"use strict";

const NOTIFICATIONS_KEY = "pomodoro_notifications_enabled";
const NOTIFICATIONS_ASKED_KEY = "pomodoro_notifications_asked";

export function isNotificationsEnabled() {
    return localStorage.getItem(NOTIFICATIONS_KEY) === "true";
}

export function hasBeenAskedAboutNotifications() {
    return localStorage.getItem(NOTIFICATIONS_ASKED_KEY) === "true";
}

export function setNotificationsAsked() {
    localStorage.setItem(NOTIFICATIONS_ASKED_KEY, "true");
}

export function enableNotifications() {
    localStorage.setItem(NOTIFICATIONS_KEY, "true");
}

export function disableNotifications() {
    localStorage.setItem(NOTIFICATIONS_KEY, "false");
}

export async function requestNotificationPermission() {
    if (!("Notification" in window)) {
        return false;
    }

    if (Notification.permission === "granted") {
        return true;
    }

    if (Notification.permission === "denied") {
        return false;
    }

    return await Notification.requestPermission() === "granted";
}

export function showNotification(title, body) {
    if (!isNotificationsEnabled()) return;

    if (window.electronAPI) {
        window.electronAPI.showNotification(title, body);
        return;
    }

    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    try {
        const notification = new Notification(title, {
            body: body,
            silent: false
        });

        notification.onclick = function() {
            window.focus();
            notification.close();
        };

        setTimeout(() => notification.close(), 10000);
    } catch (error) {
        console.error("Error mostrando notificación:", error);
    }
}

export function notifySessionStart(mode) {
    const modeNames = {
        "work": "Trabajo",
        "shortBreak": "Descanso Corto",
        "longBreak": "Descanso Largo"
    };
    showNotification("Pomodoro - Sesión iniciada", `Comenzó: ${modeNames[mode] || mode}`);
}

export function notifySessionEnd(mode) {
    const modeNames = {
        "work": "Trabajo",
        "shortBreak": "Descanso Corto",
        "longBreak": "Descanso Largo"
    };
    showNotification("Pomodoro - Sesión completada", `Finalizó: ${modeNames[mode] || mode}`);
}

export function showNotificationModal() {
    const modal = document.getElementById("notifications-modal");
    if (modal) modal.classList.remove("hidden");
}

export function hideNotificationModal() {
    const modal = document.getElementById("notifications-modal");
    if (modal) modal.classList.add("hidden");
}

export function initNotificationModal() {
    if (hasBeenAskedAboutNotifications()) return;

    showNotificationModal();

    const confirmBtn = document.getElementById("notifications-confirm");
    const checkbox = document.getElementById("notifications-checkbox");

    confirmBtn.addEventListener("click", async function() {
        setNotificationsAsked();
        if (checkbox.checked) {
            const granted = await requestNotificationPermission();
            if (granted) {
                enableNotifications();
            } else {
                disableNotifications();
            }
        } else {
            disableNotifications();
        }
        hideNotificationModal();
    });
}
