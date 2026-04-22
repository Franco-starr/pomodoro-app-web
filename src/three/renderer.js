import * as THREE from 'three';
import { camera } from './camera.js';

export const renderer = new THREE.WebGLRenderer();

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

const webglContainer = document.getElementById('webgl');

function updateSize() {
  const width = webglContainer.clientWidth;
  const height = 300;
  
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  
  renderer.setSize(width, height);
}

updateSize();
webglContainer.appendChild(renderer.domElement);

window.addEventListener('resize', updateSize);