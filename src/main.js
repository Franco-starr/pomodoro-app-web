// THREE (escena 3D)
console.log("📦 Importando three/main.js");
import './three/main.js';

// POMODORO (lógica)
console.log("📦 Importando pomodoro/script.js");
import './pomodoro/script.js';

// NAVBAR - Window controls
document.getElementById("min-btn").addEventListener("click", () => {
    window.electronAPI.minimize();
});

document.getElementById("close-btn").addEventListener("click", () => {
    window.electronAPI.close();
});

document.getElementById("logs-btn").addEventListener("click", () => {
    if (window.electronAPI) {
        window.electronAPI.openLogs();
    } else {
        window.location.href = '/logs.html';
    }
});