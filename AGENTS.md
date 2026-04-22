# AGENTS.md - Pomodoro 3D

## Project Overview
A Vite + Vanilla JavaScript Pomodoro timer with Three.js 3D visualization. Features a retro-style TV that displays video and responds to color analysis.

## Build Commands

```bash
npm run dev      # Start development server (http://localhost:5173)
npm run build    # Build for production
npm run preview  # Preview production build
```

**No testing framework exists** - no test commands available.

---

## Project Structure

```
src/
├── main.js              # Entry point - imports three/ and pomodoro/
├── style.css            # Main stylesheet
├── three/               # Three.js 3D visualization
│   ├── main.js          # Scene setup, initialization
│   ├── scene.js         # THREE.Scene configuration
│   ├── camera.js        # Camera setup
│   ├── renderer.js      # WebGL renderer
│   ├── lights.js        # Lighting (ambient + spotlight)
│   ├── floor.js         # Checkered floor generation
│   ├── tv.js            # GLTF TV model loader
│   ├── video.js         # Video element + VideoTexture
│   ├── animate.js       # Animation loop
│   ├── colorAnalyzer.js # Average color extraction
│   ├── crtShader.js     # CRT shader material
│   └── style.css        # Three.js specific styles
├── pomodoro/            # Timer logic
│   ├── pomodoro.js      # Core timer state machine
│   ├── script.js        # Settings modal handlers
│   ├── localstorage.js  # Session persistence
│   ├── logs.js          # Session logging
│   ├── logpage.js       # Logs page logic
│   └── style.css        # Pomodoro-specific styles
└── assets/              # Fonts, images, etc.
```

---

## Code Style Guidelines

### General Conventions

- **File naming:** kebab-case (e.g., `color-analyzer.js`, `logpage.js`)
- **Indentation:** 2 spaces (no tabs)
- **Line endings:** LF (Unix style)
- **String quotes:** Single quotes preferred
- **Semicolons:** Always use semicolons

### JavaScript Style

#### "use strict" Directive
Files that don't use ES6 modules should include `"use strict";` at the top:
```javascript
"use strict";
// code here...
```

#### Import/Export
Use named exports for all modules. Group imports: external libraries first, then internal modules:
```javascript
// External
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Internal
import { createFloor } from './floor.js';
import { startAnimation } from './animate.js';
```

#### Function Declarations
Use `function` keyword (not arrow functions):
```javascript
function startTimer(fromRestore = false) {
    // ...
}

export function createVideo() {
    // ...
}
```

#### Constants
Use camelCase for simple constants, UPPER_SNAKE_CASE for keys:
```javascript
const defaultWorkDuration = 25;
const LOGS_KEY = "pomodoro_logs";
const STORAGE_KEY = "pomodoro_session";
```

#### Variable Naming
- camelCase for variables and functions
- Descriptive names (no single letters except loop counters)
```javascript
let workDuration = 25;
let shortBreakDuration = 5;
let isRunning = false;
```

#### DOM Element Naming
Prefix DOM queries with the element type:
```javascript
const timerDisplay = document.querySelector(".timer-display");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
```

### CSS Style

#### Class Naming
- Use kebab-case for classes: `.timer-display`, `.btn-start`
- BEM-like naming for components: `.log-entry`, `.log-entry.completed`
- State classes: `.hidden`, `.work`, `.break`, `.long-break`

#### Selector Order
1. Reset/Base styles
2. Layout styles
3. Component styles
4. State styles
5. Media queries

---

## Three.js Conventions

### Import Pattern
```javascript
import * as THREE from 'three';
```

### Scene Setup Pattern
Each module exports a single object/function:
```javascript
export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(...);
export function setupLights(scene) { ... }
```

### Shader Conventions
- Inline vertex/fragment shaders as template literals
- Pass textures as uniforms: `tDiffuse: { value: videoTexture }`
- Use `varying` for UV interpolation

### Animation Loop Pattern
```javascript
function animate(now = 0) {
    requestAnimationFrame(animate);
    // ... update logic
    renderer.render(scene, camera);
}
animate();
```

---

## LocalStorage Patterns

### Storage Keys
```javascript
const STORAGE_KEY = "pomodoro_session";
const LOGS_KEY = "pomodoro_logs";
const CONFIG_KEY = "pomodoro_config";
```

### Data Persistence
- Use `JSON.stringify()` for saving
- Use `JSON.parse()` with null checks for loading
- Store ISO date strings for dates, not Date objects

---

## Error Handling

### LocalStorage Access
```javascript
const data = localStorage.getItem(KEY);
return data ? JSON.parse(data) : null;
```

### DOM Queries
```javascript
const element = document.getElementById("element-id");
// Always check existence when optional
if (element) {
    element.value = something;
}
```

### Video/Media
```javascript
video.play().catch(err => console.error('Video play failed:', err));
```

---

## Naming Conventions Summary

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `color-analyzer.js` |
| Functions | camelCase | `createVideo()`, `startTimer()` |
| Variables | camelCase | `workDuration`, `isRunning` |
| Constants | UPPER_SNAKE_CASE | `LOGS_KEY`, `MAX_RETRIES` |
| CSS Classes | kebab-case | `.timer-display`, `.btn-start` |
| DOM Variables | camelCase with type prefix | `startBtn`, `timerDisplay` |

---

## Common Patterns

### Timer State Machine
```javascript
let mode = "work"; // "work", "shortBreak", "longBreak"
let isRunning = false;
let timerInterval = null;

function tick() {
    if (minutes === 0 && seconds === 0) {
        nextSession();
        return;
    }
}
```

### Event Handling
```javascript
startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
```

### Session Persistence
```javascript
function persistSession() {
    saveSession({
        mode,
        pomodorosCompleted,
        workDuration,
        lastSaved: Date.now()
    });
}
```

---

## Notes

- No TypeScript is used in this project
- No ESLint or Prettier configuration exists
- No automated tests exist
- Comments are written in Spanish
- The codebase uses a mix of `"use strict"` and ES6 module strict mode
