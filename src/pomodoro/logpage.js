import { getAllLogs, getStats, deleteLog, clearAllLogs, formatDate, exportLogsAsJSON } from './logs.js';

/*------- Sessions Modal ------- */
const sessionsBtn = document.getElementById("sessions-btn");
const logsModal = document.getElementById("logs-modal");
const closeLogsBtn = document.getElementById("close-logs");

const logsSection = document.querySelector(".logs-section");
const logsContent = document.getElementById("logs-content");

// abrir modal
sessionsBtn.onclick = () => {
    logsModal.classList.remove("hidden");
    logsSection.classList.remove("hidden");

    // mover logs-section al modal
    logsContent.appendChild(logsSection);
};

// cerrar modal
closeLogsBtn.onclick = () => {
    logsModal.classList.add("hidden");
    logsSection.classList.add("hidden");

    // devolver logs-section al contenedor principal
    document.querySelector(".log-container").appendChild(logsSection);
};

/*------- Window Functions ------- */
window.formatDate = formatDate;
window.deleteLog = deleteLog;
window.clearAllLogs = () => {
    if (confirm('¿Estás seguro de que deseas borrar todos los logs?')) {
        clearAllLogs();
        location.reload();
    }
};
window.exportLogs = exportLogsAsJSON;

function displayStats() {
    const stats = getStats();
    const statsHTML = `
        <div class="stat-card">
            <h3>Total de Sesiones</h3>
            <div class="number">${stats.totalSessions}</div>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
            <h3>Completadas</h3>
            <div class="number">${stats.completedSessions}</div>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
            <h3>Pausadas</h3>
            <div class="number">${stats.pausedSessions}</div>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
            <h3>Reseteadas</h3>
            <div class="number">${stats.resetSessions}</div>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);">
            <h3>Saltadas</h3>
            <div class="number">${stats.skippedSessions || 0}</div>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);">
            <h3>Ciclos Totales</h3>
            <div class="number">${stats.totalCyclesCompleted}</div>
        </div>
    `;
    document.getElementById('statsContainer').innerHTML = statsHTML;
}

function displayLogs() {
    const logs = getAllLogs();
    const logsContainer = document.getElementById('logsContainer');

    if (logs.length === 0) {
        logsContainer.innerHTML = '<div class="no-logs">No hay sesiones registradas yet. ¡Comienza un pomodoro!</div>';
        return;
    }

    const logsHTML = logs
        .reverse()
        .map(log => `
            <div class="log-entry ${log.status}">
                <button class="delete-btn" onclick="deleteLog(${log.id}); location.reload();">Eliminar</button>
                <div class="log-info">
                    <div class="log-info-item">
                        <span class="log-label">📅 Fecha Inicio:</span>
                        <span class="log-value">${formatDate(log.startDate)}</span>
                    </div>
                    <div class="log-info-item">
                        <span class="log-label">🏁 Fecha Fin:</span>
                        <span class="log-value">${formatDate(log.endDate)}</span>
                    </div>
                    <div class="log-info-item">
                        <span class="log-label">✅ Progreso:</span>
                        <span class="log-value">${log.cyclesCompleted} / ${log.totalPomodoros || '?'}</span>
                    </div>
                    <div class="log-info-item">
                        <span class="log-label">🔄 Long Break Cada:</span>
                        <span class="log-value">${log.longBreakInterval || '?'}</span>
                    </div>
                    <div class="log-info-item">
                        <span class="log-label">Estado:</span>
                        <span class="status-badge ${log.status}">
                            ${log.status === 'completed' ? '✓ Completado' : log.status === 'paused' ? '⏸ Pausado' : log.status === 'skipped' ? '⏭️ Saltado' : '🔄 Reseteado'}
                        </span>
                    </div>
                </div>
                <div class="log-info">
                    <div class="log-info-item">
                        <span class="log-label">⏱️ Trabajo:</span>
                        <span class="log-value">${log.workDuration} min</span>
                    </div>
                    <div class="log-info-item">
                        <span class="log-label">☕ Descanso Corto:</span>
                        <span class="log-value">${log.breakDuration} min</span>
                    </div>
                    <div class="log-info-item">
                        <span class="log-label">🌙 Descanso Largo:</span>
                        <span class="log-value">${log.longBreakDuration} min</span>
                    </div>
                    <div class="log-info-item">
                        <span class="log-label">🎯 ID:</span>
                        <span class="log-value" style="font-size: 12px;">#${log.id}</span>
                    </div>
                </div>
            </div>
        `)
        .join('');

    logsContainer.innerHTML = logsHTML;
}

// Cargar datos al abrir la página
window.addEventListener('DOMContentLoaded', () => {
    displayStats();
    displayLogs();
});
