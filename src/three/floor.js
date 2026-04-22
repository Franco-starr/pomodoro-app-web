import * as THREE from 'three';

export function createFloor() {

  const size = 512;
  const squares = 8;

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;

  const ctx = canvas.getContext('2d');
  const squareSize = size / squares;

  for (let y = 0; y < squares; y++) {
    for (let x = 0; x < squares; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? '#23238b' : '#111111';
      ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5, 5);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      opacity: 0.8,
      roughness: 0.8,
      metalness: 0.98
    })
  );

  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.01;

  return floor;
}