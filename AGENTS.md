# AGENTS.md - Pomodoro 3D

## Project Overview
Vite + Vanilla JavaScript Pomodoro timer with Three.js 3D visualization. Retro TV displays video and responds to color analysis.

## Build Commands

```bash
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Build for production (dist/)
npm run preview  # Preview production build locally
```

**No testing framework exists.**

---

## Project Structure

```
src/
├── main.js              # Entry point
├── style.css            # Main stylesheet
├── three/               # Three.js 3D visualization
│   ├── main.js          # Scene setup, async video init
│   ├── scene.js         # THREE.Scene
│   ├── camera.js        # PerspectiveCamera
│   ├── renderer.js      # WebGLRenderer
│   ├── lights.js        # Ambient + spotlight
│   ├── floor.js         # Checkered floor
│   ├── tv.js            # GLTF model loader
│   ├── video.js         # Video + VideoTexture (async)
│   ├── animate.js       # Animation loop
│   ├── colorAnalyzer.js # Average color extraction
│   └── crtShader.js     # CRT shader material
├── pomodoro/            # Timer logic
│   ├── pomodoro.js      # State machine + worker communication
│   ├── script.js        # Settings handlers
│   ├── localstorage.js  # Session persistence
│   ├── logs.js          # Session logging
│   └── logpage.js       # Logs page logic
├── worker.js            # Timer Web Worker (in public/workers/)
└── assets/             # Fonts, images
public/
├── workers/worker.js   # Web Worker (served statically)
└── videos/           # Video files
```

---

## Code Style Guidelines

### General
- **Files:** kebab-case (`color-analyzer.js`)
- **Indentation:** 2 spaces
- **Quotes:** Single quotes preferred
- **Semicolons:** Always use

### Import/Export
Use named exports. Group: external first, then internal:
```javascript
import * as THREE from 'three';
import { createVideo } from './video.js';
import { LOGS_KEY } from './constants.js';
```

### Function Declarations
Use `function` keyword (not arrow functions):
```javascript
function startTimer(fromRestore = false) { }
export async function createVideo() { }
```

### Constants
- camelCase: `defaultWorkDuration = 25`
- UPPER_SNAKE_CASE: `LOGS_KEY`, `STORAGE_KEY`

### Variables
- camelCase, descriptive names
- `let workDuration = 25;`
- `let isRunning = false;`

### DOM Elements
Prefix with element type:
```javascript
const timerDisplay = document.querySelector('.timer-display');
const startBtn = document.getElementById('start-btn');
```

### CSS
- kebab-case classes: `.timer-display`, `.btn-start`
- BEM-like: `.log-entry`, `.log-entry.completed`
- State classes: `.hidden`, `.work`, `.break`

---

## Web Worker Patterns

The timer runs in a Web Worker for precise timing independent of main thread.

### Worker Location
Workers must be in `public/workers/` for Vite to copy them to `dist/`:
```javascript
// public/workers/worker.js
self.onmessage = function(e) {
    const { type, data } = e.data;
    // process...
    postMessage({ type: "TICK", state });
};
```

### Main Thread Communication
```javascript
// src/pomodoro/pomodoro.js
worker = new Worker('/workers/worker.js');

worker.postMessage({ type: "START" });

worker.onmessage = function(e) {
    const { type, state } = e.data;
    // handle message
};
```

---

## LocalStorage Patterns

```javascript
const STORAGE_KEY = "pomodoro_session";
const LOGS_KEY = "pomodoro_logs";

function saveSession(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadSession() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
}
```

---

## Error Handling

```javascript
// LocalStorage
const data = localStorage.getItem(KEY);
return data ? JSON.parse(data) : null;

// DOM
const el = document.getElementById('id');
if (el) el.value = value;

// Video/Media
video.play().catch(err => console.error('Video play failed:', err));
```

---

## Three.js Patterns

### Video Async Init
Video textures must wait for `canplay` event:
```javascript
export function createVideo() {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.src = '/videos/default.mp4';
        video.addEventListener('canplay', () => {
            const texture = new THREE.VideoTexture(video);
            resolve({ video, videoTexture: texture });
        }, { once: true });
        video.load();
    });
}

// Usage
const { video, videoTexture } = await createVideo();
```

### Shader Uniforms
```javascript
const uniforms = {
    tDiffuse: { value: videoTexture },
    time: { value: 0 }
};
```

---

## Vite Multi-Page Config

For multiple HTML entry points:
```javascript
// vite.config.js
export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: 'index.html',
                logs: 'logs.html',
            },
        },
    },
});
```

---

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `color-analyzer.js` |
| Functions | camelCase | `createVideo()` |
| Variables | camelCase | `workDuration` |
| Constants | UPPER_SNAKE_CASE | `LOGS_KEY` |
| CSS Classes | kebab-case | `.timer-display` |
| DOM Vars | prefix + camelCase | `startBtn`, `timerDisplay` |

---

## Notes

- No TypeScript
- No ESLint/Prettier config
- No tests
- Comments in Spanish
- Mix of `"use strict"` and ES6 module strict mode