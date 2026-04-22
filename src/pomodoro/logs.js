"use strict";

const LOGS_KEY = "pomodoro_logs";

// Guardar un nuevo log de sesión completada
export function addLog(sessionData) {
    const logs = getAllLogs();
    
    const logEntry = {
        id: Date.now(),
        startDate: sessionData.startDate,
        endDate: new Date().toISOString(),
        cyclesCompleted: sessionData.cyclesCompleted,
        status: sessionData.status, // completed, paused, reset
        workDuration: sessionData.workDuration,
        breakDuration: sessionData.breakDuration,
        longBreakDuration: sessionData.longBreakDuration,
        longBreakInterval: sessionData.longBreakInterval,
        totalPomodoros: sessionData.totalPomodoros
    };
    
    logs.push(logEntry);
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
    console.log('📋 Log guardado:', logEntry);
    
    return logEntry;
}

// Obtener todos los logs
export function getAllLogs() {
    const data = localStorage.getItem(LOGS_KEY);
    return data ? JSON.parse(data) : [];
}

// Obtener estadísticas de los logs
export function getStats() {
    const logs = getAllLogs();
    
    const stats = {
        totalSessions: logs.length,
        completedSessions: logs.filter(log => log.status === 'completed').length,
        pausedSessions: logs.filter(log => log.status === 'paused').length,
        resetSessions: logs.filter(log => log.status === 'reset').length,
        skippedSessions: logs.filter(log => log.status === 'skipped').length,
        totalCyclesCompleted: logs.reduce((sum, log) => sum + log.cyclesCompleted, 0)
    };
    
    return stats;
}

// Borrar un log específico
export function deleteLog(id) {
    let logs = getAllLogs();
    logs = logs.filter(log => log.id !== id);
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
    console.log('🗑️ Log eliminado:', id);
}

// Borrar todos los logs
export function clearAllLogs() {
    localStorage.removeItem(LOGS_KEY);
    console.log('🗑️ Todos los logs han sido eliminados');
}

// Exportar logs como JSON
export function exportLogsAsJSON() {
    const logs = getAllLogs();
    const json = JSON.stringify(logs, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pomodoro_logs_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Formatear fecha para mostrar
export function formatDate(isoDate) {
    const date = new Date(isoDate);
    return date.toLocaleString('es-ES');
}
