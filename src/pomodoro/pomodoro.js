"use strict";
import { saveSession, loadSession, clearSession } from './localstorage.js';
import { addLog } from './logs.js';
import { playTickSound, playBellSound, stopTickSound, stopBellSound } from './sound.js';
import { notifySessionStart, notifySessionEnd } from './notifications.js';
import { setVideoMode } from '../three/video.js';

let worker = null;

window.onload = () => {
    const defaultWorkDuration = 25;
    const defaultShortBreakDuration = 5;
    const defaultLongBreakDuration = 15;
    const defaultLongBreakInterval = 4;
    const defaultTotalPomodoros = 12;

    let workDuration = defaultWorkDuration;
    let shortBreakDuration = defaultShortBreakDuration;
    let longBreakDuration = defaultLongBreakDuration;
    let longBreakInterval = defaultLongBreakInterval;
    let totalPomodoros = defaultTotalPomodoros;

    let mode = "work";
    let pomodorosCompleted = 0;
    let minutes = workDuration;
    let seconds = 0;
    let timerStarted = false;
    let sessionStartDate = null;
    let isRunning = false;
    let pausedByWorker = false;

    const timerDisplay = document.querySelector(".timer-display");
    const startBtn = document.getElementById("start-btn");
    const pauseBtn = document.getElementById("pause-btn");
    const resetBtn = document.getElementById("reset-btn");
    const skipBtn = document.getElementById("skip-btn");
    skipBtn.disabled = true;
    pauseBtn.disabled = true;
    resetBtn.disabled = true;

    const workDurationInput = document.getElementById("work-duration");
    const shortBreakInput = document.getElementById("break-duration");
    const longBreakInput = document.getElementById("long-break-duration");
    const cyclesInput = document.getElementById("cycles");
    const sessionLabel = document.getElementById("session-label");
    const currentCycleDisplay = document.getElementById("currentCycle");
    const totalPomodorosDisplay = document.getElementById("totalPomodoros");
    const totalPomodorosInput = document.getElementById("total-pomodoros");

    function saveConfig() {
        localStorage.setItem('pomodoro_config', JSON.stringify({
            workDuration,
            shortBreakDuration,
            longBreakDuration,
            longBreakInterval,
            totalPomodoros
        }));
    }

    function loadConfig() {
        const config = localStorage.getItem('pomodoro_config');
        if (config) {
            const parsed = JSON.parse(config);
            workDuration = parsed.workDuration || defaultWorkDuration;
            shortBreakDuration = parsed.shortBreakDuration || defaultShortBreakDuration;
            longBreakDuration = parsed.longBreakDuration || defaultLongBreakDuration;
            longBreakInterval = parsed.longBreakInterval || defaultLongBreakInterval;
            totalPomodoros = parsed.totalPomodoros || defaultTotalPomodoros;
        }
        workDurationInput.value = workDuration;
        shortBreakInput.value = shortBreakDuration;
        longBreakInput.value = longBreakDuration;
        cyclesInput.value = longBreakInterval;
        if (totalPomodorosInput) {
            totalPomodorosInput.value = totalPomodoros;
        }
    }

    function updateDisplay() {
        const min = String(minutes).padStart(2, "0");
        const sec = String(seconds).padStart(2, "0");
        timerDisplay.textContent = `${min}:${sec}`;
    }

    function updateSessionLabel() {
        if (mode === "work") {
            sessionLabel.textContent = "WORK";
        } else if (mode === "shortBreak") {
            sessionLabel.textContent = "SHORT BREAK";
        } else {
            sessionLabel.textContent = "LONG BREAK";
        }
        applyModeStyles();
    }

    function applyModeStyles() {
        document.body.classList.remove("work", "break", "long-break");
        if (mode === "work") {
            document.body.classList.add("work");
        } else if (mode === "shortBreak") {
            document.body.classList.add("break");
        } else {
            document.body.classList.add("long-break");
        }
    }

    function toggleSettings(disabled) {
        workDurationInput.disabled = disabled;
        shortBreakInput.disabled = disabled;
        longBreakInput.disabled = disabled;
        cyclesInput.disabled = disabled;
    }

    function syncDisplayWithSettings() {
        totalPomodorosDisplay.textContent = totalPomodoros;
        currentCycleDisplay.textContent = pomodorosCompleted;
    }

    function persistSession() {
        saveSession({
            mode,
            pomodorosCompleted,
            workDuration,
            shortBreakDuration,
            longBreakDuration,
            longBreakInterval,
            totalPomodoros,
            minutes,
            seconds,
            timerStarted,
            sessionStartDate: sessionStartDate ? sessionStartDate.toISOString() : null,
            isRunning,
            lastSaved: Date.now()
        });
    }

    function clearPersistedSession() {
        clearSession();
    }

    function startTimer(fromRestore = false) {
        if (isRunning) return;

        if (!timerStarted) {
            if (!fromRestore) {
                updateSettings();
            }
            setSessionTime();
            timerStarted = true;
            sessionStartDate = new Date();
            console.log('🚀 Sesión iniciada:', sessionStartDate);
            notifySessionStart(mode);
            setVideoMode(mode);
        }

        isRunning = true;
        toggleSettings(true);

        startBtn.disabled = true;
        skipBtn.disabled = false;
        pauseBtn.disabled = false;
        resetBtn.disabled = false;

        updateDisplay();
        persistSession();

        worker.postMessage({ type: "START" });
    }

    function pauseTimer() {
        if (!isRunning) return;

        pauseBtn.disabled = true;
        startBtn.disabled = false;
        isRunning = false;
        persistSession();
        stopBellSound();
        stopTickSound();

        const sessionData = {
            startDate: sessionStartDate.toISOString(),
            cyclesCompleted: pomodorosCompleted,
            status: 'paused',
            workDuration,
            breakDuration: shortBreakDuration,
            longBreakDuration,
            longBreakInterval,
            totalPomodoros
        };
        addLog(sessionData);
        console.log('⏸️  Sesión pausada - Ciclos completados:', pomodorosCompleted);

        worker.postMessage({ type: "PAUSE" });
    }

    function resetTimer() {
        if (sessionStartDate) {
            const sessionData = {
                startDate: sessionStartDate.toISOString(),
                cyclesCompleted: pomodorosCompleted,
                status: 'reset',
                workDuration,
                breakDuration: shortBreakDuration,
                longBreakDuration,
                longBreakInterval,
                totalPomodoros
            };
            addLog(sessionData);
            console.log('🔄 Sesión reseteada - Ciclos completados:', pomodorosCompleted);
        }

        timerStarted = false;
        toggleSettings(false);
        skipBtn.disabled = true;
        pauseBtn.disabled = true;
        startBtn.disabled = false;
        resetBtn.disabled = true;
        isRunning = false;
        stopBellSound();
        stopTickSound();

        pomodorosCompleted = 0;
        mode = "work";
        minutes = workDuration;
        seconds = 0;

        clearPersistedSession();

        console.log("Reset:", minutes + ":" + seconds);
        updateDisplay();
        updateSessionLabel();
        setVideoMode("reset");

        worker.postMessage({ type: "RESET" });
    }

    function skipSession() {
        worker.postMessage({ type: "SKIP" });
    }

    function updateSettings() {
        workDuration = Number(workDurationInput.value);
        shortBreakDuration = Number(shortBreakInput.value);
        longBreakDuration = Number(longBreakInput.value);
        longBreakInterval = Number(cyclesInput.value);
        if (totalPomodorosInput) {
            totalPomodoros = Number(totalPomodorosInput.value);
        }

        saveConfig();
        sendConfigToWorker();
    }

    function setSessionTime() {
        if (mode === "work") {
            minutes = workDuration;
        } else if (mode === "shortBreak") {
            minutes = shortBreakDuration;
        } else {
            minutes = longBreakDuration;
        }
        seconds = 0;
    }

    function restoreFromSession(session) {
        workDuration = session.workDuration || workDuration;
        shortBreakDuration = session.shortBreakDuration || shortBreakDuration;
        longBreakDuration = session.longBreakDuration || longBreakDuration;
        longBreakInterval = session.longBreakInterval || longBreakInterval;
        totalPomodoros = session.totalPomodoros || totalPomodoros;
        mode = session.mode || mode;
        pomodorosCompleted = session.pomodorosCompleted || pomodorosCompleted;
        minutes = typeof session.minutes === 'number' ? session.minutes : minutes;
        seconds = typeof session.seconds === 'number' ? session.seconds : seconds;
        timerStarted = !!session.timerStarted;
        sessionStartDate = session.sessionStartDate ? new Date(session.sessionStartDate) : null;
        isRunning = !!session.isRunning;

        workDurationInput.value = workDuration;
        shortBreakInput.value = shortBreakDuration;
        longBreakInput.value = longBreakDuration;
        cyclesInput.value = longBreakInterval;
        if (totalPomodorosInput) {
            totalPomodorosInput.value = totalPomodoros;
        }
        totalPomodorosDisplay.textContent = totalPomodoros;

        if (isRunning && session.lastSaved) {
            const elapsed = Math.floor((Date.now() - session.lastSaved) / 1000);
            let totalRemaining = (session.minutes * 60 + session.seconds) - elapsed;
            
            while (totalRemaining <= 0 && pomodorosCompleted < totalPomodoros) {
                if (mode === "work") {
                    pomodorosCompleted++;
                }
                
                if (mode === "work") {
                    if (pomodorosCompleted % longBreakInterval === 0) {
                        mode = "longBreak";
                        totalRemaining += longBreakDuration * 60;
                    } else {
                        mode = "shortBreak";
                        totalRemaining += shortBreakDuration * 60;
                    }
                } else {
                    mode = "work";
                    totalRemaining += workDuration * 60;
                }
                totalRemaining -= 1;
            }
            
            if (totalRemaining > 0) {
                minutes = Math.floor(totalRemaining / 60);
                seconds = totalRemaining % 60;
            } else {
                minutes = workDuration;
                seconds = 0;
            }
            
            timerStarted = true;
            currentCycleDisplay.textContent = pomodorosCompleted;
            updateSessionLabel();
            applyModeStyles();
            updateDisplay();
            setVideoMode(mode);
            syncDisplayWithSettings();
            saveConfig();
            
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            skipBtn.disabled = false;
            resetBtn.disabled = false;
            toggleSettings(true);
            
            worker.postMessage({
                type: "RESTORE",
                data: {
                    mode,
                    pomodorosCompleted,
                    minutes,
                    seconds,
                    workDuration,
                    shortBreakDuration,
                    longBreakDuration,
                    longBreakInterval,
                    totalPomodoros,
                    sessionStartDate: sessionStartDate ? sessionStartDate.toISOString() : null,
                    isRunning,
                    lastSaved: session.lastSaved,
                    elapsed: elapsed
                }
            });
        } else {
            currentCycleDisplay.textContent = pomodorosCompleted;
            updateSessionLabel();
            applyModeStyles();
            updateDisplay();
            syncDisplayWithSettings();
            saveConfig();
            
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            skipBtn.disabled = true;
            resetBtn.disabled = true;
            toggleSettings(false);
            
            worker.postMessage({
                type: "RESTORE",
                data: {
                    mode,
                    pomodorosCompleted,
                    minutes,
                    seconds,
                    workDuration,
                    shortBreakDuration,
                    longBreakDuration,
                    longBreakInterval,
                    totalPomodoros,
                    sessionStartDate: sessionStartDate ? sessionStartDate.toISOString() : null,
                    isRunning: false,
                    lastSaved: session.lastSaved
                }
            });
        }
    }

    function sendConfigToWorker() {
        worker.postMessage({
            type: "UPDATE_CONFIG",
            data: {
                workDuration,
                shortBreakDuration,
                longBreakDuration,
                longBreakInterval,
                totalPomodoros
            }
        });
    }

    function initWorker() {
        worker = new Worker('/workers/worker.js');

        worker.onmessage = function(e) {
            const { type, state } = e.data;

            switch (type) {
                case "READY":
                    console.log("✅ Worker listo");
                    sendConfigToWorker();
                    break;

                case "TICK":
                    if (state) {
                        minutes = state.minutes;
                        seconds = state.seconds;
                        updateDisplay();
                        persistSession();

                        if (minutes === 0 && seconds <= 5 && minutes >= 0) {
                            playTickSound();
                        }
                    }
                    break;

                case "SESSION_COMPLETE":
                    playBellSound();
                    stopTickSound();

                    const totalComplete = e.data.totalComplete;

                    if (sessionStartDate) {
                        const sessionData = {
                            startDate: sessionStartDate.toISOString(),
                            cyclesCompleted: pomodorosCompleted,
                            status: 'completed',
                            workDuration,
                            breakDuration: shortBreakDuration,
                            longBreakDuration,
                            longBreakInterval,
                            totalPomodoros
                        };
                        addLog(sessionData);
                        console.log('✅ Sesión completada - Ciclos:', pomodorosCompleted);
                    }

                    if (totalComplete) {
                        mode = "work";
                        pomodorosCompleted = 0;
                        minutes = workDuration;
                        seconds = 0;
                        timerStarted = false;
                        isRunning = false;
                        sessionStartDate = null;
                        
                        currentCycleDisplay.textContent = pomodorosCompleted;
                        updateSessionLabel();
                        updateDisplay();
                        setVideoMode("reset");
                        clearPersistedSession();
                        
                        startBtn.disabled = false;
                        pauseBtn.disabled = true;
                        skipBtn.disabled = true;
                        resetBtn.disabled = true;
                        toggleSettings(false);
                    } else {
                        if (state) {
                            mode = state.mode;
                            pomodorosCompleted = state.pomodorosCompleted;
                            minutes = state.minutes;
                            seconds = state.seconds;
                        }

                        currentCycleDisplay.textContent = pomodorosCompleted;
                        updateSessionLabel();
                        updateDisplay();
                        setVideoMode(mode);
                        persistSession();
                    }
                    break;

                case "STARTED":
                    if (state) {
                        mode = state.mode;
                        sessionStartDate = state.sessionStartDate ? new Date(state.sessionStartDate) : null;
                        minutes = state.minutes;
                        seconds = state.seconds;
                        pomodorosCompleted = state.pomodorosCompleted;
                    }
                    timerStarted = true;
                    isRunning = true;
                    currentCycleDisplay.textContent = pomodorosCompleted;
                    updateDisplay();
                    updateSessionLabel();
                    applyModeStyles();
                    setVideoMode(mode);
                    persistSession();
                    startBtn.disabled = true;
                    pauseBtn.disabled = false;
                    skipBtn.disabled = false;
                    resetBtn.disabled = false;
                    toggleSettings(true);
                    break;

                case "PAUSED":
                    break;

                case "RESET":
                    if (state) {
                        mode = state.mode;
                        pomodorosCompleted = state.pomodorosCompleted;
                        minutes = state.minutes;
                        seconds = state.seconds;
                    }
                    break;

                case "SKIP":
                    const skipTotalComplete = e.data.totalComplete;
                    
                    if (sessionStartDate) {
                        const sessionData = {
                            startDate: sessionStartDate.toISOString(),
                            cyclesCompleted: pomodorosCompleted,
                            status: 'skipped',
                            workDuration,
                            breakDuration: shortBreakDuration,
                            longBreakDuration,
                            longBreakInterval,
                            totalPomodoros
                        };
                        addLog(sessionData);
                        console.log('⏭️ Sesión saltada - Ciclos:', pomodorosCompleted);
                    }
                    
                    if (skipTotalComplete) {
                        mode = "work";
                        pomodorosCompleted = 0;
                        minutes = workDuration;
                        seconds = 0;
                        timerStarted = false;
                        isRunning = false;
                        sessionStartDate = null;
                        
                        currentCycleDisplay.textContent = pomodorosCompleted;
                        updateSessionLabel();
                        updateDisplay();
                        setVideoMode("reset");
                        clearPersistedSession();
                        
                        startBtn.disabled = false;
                        pauseBtn.disabled = true;
                        skipBtn.disabled = true;
                        resetBtn.disabled = true;
                        toggleSettings(false);
                    } else {
                        if (state) {
                            mode = state.mode;
                            pomodorosCompleted = state.pomodorosCompleted;
                            minutes = state.minutes;
                            seconds = state.seconds;
                        }
                        currentCycleDisplay.textContent = pomodorosCompleted;
                        notifySessionEnd(mode);
                        updateSessionLabel();
                        updateDisplay();
                        setVideoMode(mode);
                        persistSession();
                    }
                    break;

                case "RESTORED":
                    if (state) {
                        mode = state.mode;
                        pomodorosCompleted = state.pomodorosCompleted;
                        minutes = state.minutes;
                        seconds = state.seconds;
                        isRunning = state.isRunning;
                        timerStarted = isRunning;
                    }
                    currentCycleDisplay.textContent = pomodorosCompleted;
                    updateSessionLabel();
                    applyModeStyles();
                    updateDisplay();
                    setVideoMode(mode);
                    if (isRunning) {
                        startBtn.disabled = true;
                        skipBtn.disabled = false;
                        pauseBtn.disabled = false;
                        resetBtn.disabled = false;
                        toggleSettings(true);
                    } else {
                        startBtn.disabled = false;
                        pauseBtn.disabled = true;
                        skipBtn.disabled = true;
                        resetBtn.disabled = true;
                        toggleSettings(false);
                    }
                    break;

                case "STATE":
                    if (state) {
                        mode = state.mode;
                        pomodorosCompleted = state.pomodorosCompleted;
                        minutes = state.minutes;
                        seconds = state.seconds;
                    }
                    currentCycleDisplay.textContent = pomodorosCompleted;
                    updateSessionLabel();
                    applyModeStyles();
                    updateDisplay();
                    setVideoMode(mode);
                    if (isRunning) {
                        persistSession();
                    }
                    break;
            }
        };

        worker.onerror = function(err) {
            console.error("❌ Error en worker:", err);
        };
    }

    startBtn.addEventListener("click", startTimer);
    pauseBtn.addEventListener("click", pauseTimer);
    resetBtn.addEventListener("click", resetTimer);
    skipBtn.addEventListener("click", skipSession);

    workDurationInput.addEventListener("change", () => {
        workDuration = Number(workDurationInput.value);
        saveConfig();
        sendConfigToWorker();
        if (!timerStarted && mode === "work") {
            minutes = workDuration;
            seconds = 0;
            updateDisplay();
        }
    });

    shortBreakInput.addEventListener("change", () => {
        shortBreakDuration = Number(shortBreakInput.value);
        saveConfig();
        sendConfigToWorker();
        if (!timerStarted && mode === "shortBreak") {
            minutes = shortBreakDuration;
            seconds = 0;
            updateDisplay();
        }
    });

    longBreakInput.addEventListener("change", () => {
        longBreakDuration = Number(longBreakInput.value);
        saveConfig();
        sendConfigToWorker();
        if (!timerStarted && mode === "longBreak") {
            minutes = longBreakDuration;
            seconds = 0;
            updateDisplay();
        }
    });

    cyclesInput.addEventListener("change", () => {
        longBreakInterval = Number(cyclesInput.value);
        saveConfig();
        sendConfigToWorker();
    });

    if (totalPomodorosInput) {
        totalPomodorosInput.addEventListener("change", () => {
            totalPomodoros = Number(totalPomodorosInput.value);
            totalPomodorosDisplay.textContent = totalPomodoros;
            saveConfig();
            sendConfigToWorker();
        });
    }

    document.getElementById("reset-settings").addEventListener("click", () => {
        workDuration = defaultWorkDuration;
        shortBreakDuration = defaultShortBreakDuration;
        longBreakDuration = defaultLongBreakDuration;
        longBreakInterval = defaultLongBreakInterval;
        totalPomodoros = defaultTotalPomodoros;

        workDurationInput.value = defaultWorkDuration;
        shortBreakInput.value = defaultShortBreakDuration;
        longBreakInput.value = defaultLongBreakDuration;
        cyclesInput.value = defaultLongBreakInterval;
        if (totalPomodorosInput) {
            totalPomodorosInput.value = defaultTotalPomodoros;
        }
        totalPomodorosDisplay.textContent = defaultTotalPomodoros;

        saveConfig();
        sendConfigToWorker();

        if (!timerStarted) {
            if (mode === "work") {
                minutes = workDuration;
            } else if (mode === "shortBreak") {
                minutes = shortBreakDuration;
            } else {
                minutes = longBreakDuration;
            }
            seconds = 0;
            updateDisplay();
        }
    });

    loadConfig();
    initWorker();

    const savedSession = loadSession();
    if (savedSession) {
        restoreFromSession(savedSession);
        
        if (savedSession.isRunning) {
            setTimeout(() => {
                worker.postMessage({ type: "GET_STATE" });
            }, 100);
        }
    } else {
        updateSettings();
    }

    syncDisplayWithSettings();
    updateDisplay();

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && isRunning) {
            worker.postMessage({ type: "GET_STATE" });
        }
    });

    console.log('%c✅ Sistema de Logs del Pomodoro Cargado (con Web Worker)', 'color: green; font-size: 14px; font-weight: bold;');
    console.log('%c📊 Ver historial en: logs.html', 'color: blue; font-size: 12px;');
};