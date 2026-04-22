"use strict";

const STORAGE_KEY = "pomodoro_session";
const LOGS_KEY = "pomodoro_logs";

// -------- SESSION ACTIVA --------
export function saveSession(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadSession() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
}

export function clearSession() {
    localStorage.removeItem(STORAGE_KEY);
}

// -------- HISTORIAL --------

// Obtener todos los logs
export function loadLogs() {
    const data = localStorage.getItem(LOGS_KEY);
    return data ? JSON.parse(data) : [];
}

// Guardar un nuevo log
export function saveLog(session) {
    const logs = loadLogs();
    logs.push(session);
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

// Borrar logs (opcional)
export function clearLogs() {
    localStorage.removeItem(LOGS_KEY);
}