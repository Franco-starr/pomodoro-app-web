import "./pomodoro.js";
import { initNotificationModal, isNotificationsEnabled, enableNotifications, disableNotifications, requestNotificationPermission } from './notifications.js';

/*------- Settings Modal ------- */

const settingsBtn = document.getElementById("settings-btn");
const modal = document.getElementById("settings-modal");
const closeBtn = document.getElementById("close-settings");

settingsBtn.onclick = () => {
    modal.classList.remove("hidden");
};

closeBtn.onclick = () => {
    modal.classList.add("hidden");
};

/*------- Notifications Buttons in Settings ------- */
const notifYesBtn = document.getElementById("notifications-yes");
const notifNoBtn = document.getElementById("notifications-no");

if (notifYesBtn && notifNoBtn) {
    function updateNotificationButtons() {
        const enabled = isNotificationsEnabled();
        const yesActive = enabled;
        const noActive = !enabled;

        notifYesBtn.classList.toggle("active", yesActive);
        notifNoBtn.classList.toggle("active", noActive);

        notifYesBtn.disabled = yesActive;
        notifNoBtn.disabled = noActive;
    }

    updateNotificationButtons();

    notifYesBtn.addEventListener("click", async function() {
        const granted = await requestNotificationPermission();
        if (granted) {
            enableNotifications();
        } else {
            disableNotifications();
        }
        updateNotificationButtons();
    });

    notifNoBtn.addEventListener("click", function() {
        disableNotifications();
        updateNotificationButtons();
    });
}

initNotificationModal();

/*--------------- LOG VIEW ------------------- */