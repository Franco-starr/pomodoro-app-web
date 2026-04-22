import * as THREE from 'three';

export let tvLight;

export function setupLights(scene) {

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  tvLight = new THREE.SpotLight(0xffffff, 2, 3);
  tvLight.position.set(0, 0.5, 0.21);
  tvLight.target.position.set(0, 0, 3);

  scene.add(tvLight);
  scene.add(tvLight.target);
}