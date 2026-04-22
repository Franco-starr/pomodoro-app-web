import * as THREE from 'three';

export const scene = new THREE.Scene();

scene.background = new THREE.Color(0x2a2a3c);
scene.fog = new THREE.FogExp2(0x2a2a3c, 0.175);