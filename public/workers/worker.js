"use strict";

console.log("🔧 Worker iniciado");

let state = {
    mode: "work",
    pomodorosCompleted: 0,
    minutes: 25,
    seconds: 0,
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    totalPomodoros: 12,
    isRunning: false,
    sessionStartDate: null,
    lastSaved: null
};

let timerInterval = null;

function tick() {
    if (state.minutes === 0 && state.seconds === 0) {
        const isTotalComplete = state.pomodorosCompleted >= state.totalPomodoros;
        
        if (isTotalComplete) {
            state.sessionStartDate = null;
            completeSession();
            postMessage({ type: "SESSION_COMPLETE", state: getStateForUI(), totalComplete: true });
            stop();
            return;
        }
        
        completeSession();
        postMessage({ type: "SESSION_COMPLETE", state: getStateForUI(), totalComplete: false });
        return;
    }

    if (state.seconds === 0) {
        state.minutes--;
        state.seconds = 59;
    } else {
        state.seconds--;
    }

    state.lastSaved = Date.now();
    postMessage({ type: "TICK", state: getStateForUI() });
}

function getStateForUI() {
    return {
        mode: state.mode,
        pomodorosCompleted: state.pomodorosCompleted,
        minutes: state.minutes,
        seconds: state.seconds,
        isRunning: state.isRunning,
        sessionStartDate: state.sessionStartDate,
        lastSaved: state.lastSaved
    };
}

function completeSession() {
    if (state.mode === "work") {
        state.pomodorosCompleted++;
    }

    if (state.mode === "work") {
        if (state.pomodorosCompleted % state.longBreakInterval === 0) {
            state.mode = "longBreak";
            state.minutes = state.longBreakDuration;
        } else {
            state.mode = "shortBreak";
            state.minutes = state.shortBreakDuration;
        }
    } else {
        state.mode = "work";
        state.minutes = state.workDuration;
    }
    state.seconds = 0;

    if (state.pomodorosCompleted >= state.totalPomodoros) {
        state.isRunning = false;
    }
}

function start() {
    if (state.isRunning) return;

    if (!state.sessionStartDate) {
        state.sessionStartDate = Date.now();
    }

    state.isRunning = true;
    timerInterval = setInterval(tick, 1000);
    postMessage({ type: "STARTED", state: getStateForUI() });
}

function pause() {
    state.isRunning = false;
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    postMessage({ type: "PAUSED", state: getStateForUI() });
}

function reset() {
    stop();
    state.mode = "work";
    state.pomodorosCompleted = 0;
    state.minutes = state.workDuration;
    state.seconds = 0;
    state.sessionStartDate = null;
    postMessage({ type: "RESET", state: getStateForUI() });
}

function stop() {
    state.isRunning = false;
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function skip() {
    const willComplete = state.pomodorosCompleted + 1 >= state.totalPomodoros;
    
    if (willComplete) {
        state.sessionStartDate = null;
    }
    
    completeSession();
    
    const isTotalComplete = state.pomodorosCompleted >= state.totalPomodoros;
    postMessage({ type: "SKIP", state: getStateForUI(), totalComplete: isTotalComplete });
    
    if (isTotalComplete) {
        stop();
    }
}

function updateConfig(config) {
    state.workDuration = config.workDuration;
    state.shortBreakDuration = config.shortBreakDuration;
    state.longBreakDuration = config.longBreakDuration;
    state.longBreakInterval = config.longBreakInterval;
    state.totalPomodoros = config.totalPomodoros;

    if (!state.isRunning) {
        if (state.mode === "work") {
            state.minutes = config.workDuration;
        } else if (state.mode === "shortBreak") {
            state.minutes = config.shortBreakDuration;
        } else {
            state.minutes = config.longBreakDuration;
        }
        state.seconds = 0;
    }
}

function restoreFromMain(session) {
    state.mode = session.mode;
    state.pomodorosCompleted = session.pomodorosCompleted;
    state.minutes = session.minutes;
    state.seconds = session.seconds;
    state.workDuration = session.workDuration;
    state.shortBreakDuration = session.shortBreakDuration;
    state.longBreakDuration = session.longBreakDuration;
    state.longBreakInterval = session.longBreakInterval;
    state.totalPomodoros = session.totalPomodoros;
    state.sessionStartDate = session.sessionStartDate;
    state.isRunning = false;

    if (session.isRunning && session.lastSaved) {
        const elapsed = Math.floor((Date.now() - session.lastSaved) / 1000);
        
        if (elapsed > 0 && state.minutes > 0) {
            advanceTime(elapsed);
        }
        
        if (state.pomodorosCompleted >= state.totalPomodoros) {
            state.sessionStartDate = null;
            state.isRunning = false;
            postMessage({ type: "SESSION_COMPLETE", state: getStateForUI(), totalComplete: true });
        } else if (state.minutes === 0 && state.seconds === 0) {
            completeSession();
            if (state.pomodorosCompleted >= state.totalPomodoros) {
                state.sessionStartDate = null;
                state.isRunning = false;
                postMessage({ type: "SESSION_COMPLETE", state: getStateForUI(), totalComplete: true });
            } else {
                state.isRunning = false;
                postMessage({ type: "SESSION_COMPLETE", state: getStateForUI(), totalComplete: false });
            }
        } else {
            postMessage({ type: "RESTORED", state: getStateForUI() });
            start();
        }
    } else {
        postMessage({ type: "RESTORED", state: getStateForUI() });
    }
}

function advanceTime(elapsedSeconds) {
    let remaining = state.minutes * 60 + state.seconds;

    while (elapsedSeconds >= remaining) {
        elapsedSeconds -= remaining;

        if (state.mode === "work") {
            state.pomodorosCompleted++;
        }

        if (state.pomodorosCompleted >= state.totalPomodoros) {
            state.isRunning = false;
            state.mode = "work";
            state.minutes = state.workDuration;
            state.seconds = 0;
            state.sessionStartDate = null;
            break;
        }

        if (state.mode === "work") {
            if (state.pomodorosCompleted % state.longBreakInterval === 0) {
                state.mode = "longBreak";
                remaining = state.longBreakDuration * 60;
            } else {
                state.mode = "shortBreak";
                remaining = state.shortBreakDuration * 60;
            }
        } else {
            state.mode = "work";
            remaining = state.workDuration * 60;
        }
    }

    if (state.isRunning && elapsedSeconds > 0) {
        remaining = Math.max(0, remaining - elapsedSeconds);
        state.minutes = Math.floor(remaining / 60);
        state.seconds = remaining % 60;
    }
}

self.onmessage = function(e) {
    const { type, data } = e.data;

    switch (type) {
        case "START":
            start();
            break;
        case "PAUSE":
            pause();
            break;
        case "RESET":
            reset();
            break;
        case "SKIP":
            skip();
            break;
        case "UPDATE_CONFIG":
            updateConfig(data);
            break;
        case "RESTORE":
            restoreFromMain(data);
            break;
        case "GET_STATE":
            postMessage({ type: "STATE", state: getStateForUI() });
            break;
    }
};

postMessage({ type: "READY" });