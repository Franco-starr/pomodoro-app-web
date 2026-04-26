"use strict";

const TICK_SOUND_PATH = "./audio/Egg Timer Clock Ticking  Useful Every Days Sounds  Filmmaker's Sound Effects.mp3";
const BELL_SOUND_PATH = "./audio/Egg Timer Ring Sound Effect.mp3";

let tickSound = null;
let bellSound = null;

function initSounds() {
    tickSound = new Audio(TICK_SOUND_PATH);
    tickSound.preload = "auto";
    tickSound.load();

    bellSound = new Audio(BELL_SOUND_PATH);
    bellSound.preload = "auto";
    bellSound.load();
}

function playTickSound() {
    if (tickSound) {
        //tickSound.currentTime = 0;
        tickSound.play().catch(err => console.error("Tick sound error:", err));
    }
}

function playBellSound() {
    if (bellSound) {
        bellSound.currentTime = 0.5;
        bellSound.play().catch(err => console.error("Bell sound error:", err));
    }
}

function stopTickSound() {
    if (tickSound) {
        tickSound.pause();
        tickSound.currentTime = 0;
    }
}

function stopBellSound() {
    if (bellSound) {
        bellSound.pause();
        bellSound.currentTime = 0;
    }
}


initSounds();

export { playTickSound, playBellSound, stopTickSound, stopBellSound };
