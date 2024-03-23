import * as THREE from 'three';
import { InteractionManager } from 'three.interactive';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xbbb2ea, 1);
document.body.appendChild(renderer.domElement);

camera.position.z = 8;

const interactionManager = new InteractionManager(
  renderer,
  camera,
  renderer.domElement
);

let useWireframe = false;
let isDragging = false;
if ('ontouchstart' in window) {
  let touchStart = { x: 0, y: 0 };
  let touchEnd = { x: 0, y: 0 };
  renderer.domElement.addEventListener('touchstart', (event) => {
    useWireframe = false;
    touchStart.x = event.touches[0].clientX;
    touchStart.y = event.touches[0].clientY;
  });
  renderer.domElement.addEventListener('touchmove', (event) => {
    useWireframe = false;
    touchEnd.x = event.touches[0].clientX;
    touchEnd.y = event.touches[0].clientY;
    cubes.rotation.y += (touchEnd.x - touchStart.x) * 0.01;
    cubes.rotation.x += (touchEnd.y - touchStart.y) * 0.01;
    touchStart.x = touchEnd.x;
    touchStart.y = touchEnd.y;
  });
  
} else {
  renderer.domElement.addEventListener('mousedown', (event) => {
    useWireframe = false;
    setTimeout(() => {
      isDragging = true;
    });
  });
  renderer.domElement.addEventListener('mouseup', (event) => {
    setTimeout(() => {
      useWireframe = false;
      isDragging = false;
    });
  });
  renderer.domElement.addEventListener('mousemove', (event) => {
    useWireframe = false;
    if (isDragging) {
      cubes.rotation.y += event.movementX * 0.01;
      cubes.rotation.x += event.movementY * 0.01;
    }
  });
}

const selected = {
  x: 0, y: 0, z: 0,
}

const cubes = new THREE.Group();
const cubeMatrix = [];
for (let x = 0; x < 3; x++) {
  cubeMatrix[x] = [];
  for (let y = 0; y < 3; y++) {
    cubeMatrix[x][y] = [];
    for (let z = 0; z < 3; z++) {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
      });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.x = x * 2 - 5/2 + 1/2; 
      cube.position.y = y * 2 - 5/2 + 1/2;
      cube.position.z = z * 2 - 5/2 + 1/2;
      cubeMatrix[x][y][z] = cube;
      cubes.add(cube);
      interactionManager.add(cube);
      if ('ontouchstart' in window) {
        cube.addEventListener('click', (event) => {
          if (useWireframe || isDragging) return;
          event.stopPropagation();
          useWireframe = false;
          flip(x, y, z);
        });
      } else {
        cube.addEventListener('mousedown', (event) => {
          if (useWireframe || isDragging) return;
          event.stopPropagation();
          useWireframe = false;
          flip(x, y, z);
        });
        
      }
    }
  }
}
scene.add(cubes);

randomize();

document.addEventListener('keydown', (event) => {
  const { x, y, z } = selected;
  const cube = cubeMatrix[x][y][z];
  cube.material.wireframe = false;
  useWireframe = true;
  switch (event.key) {
    case 'ArrowUp':
      cubes.rotation.x += 0.1;
      break;
    case 'ArrowDown':
      cubes.rotation.x -= 0.1;
      break;
    case 'ArrowLeft':
      cubes.rotation.y += 0.1;
      break;
    case 'ArrowRight':
      cubes.rotation.y -= 0.1;
      break;
    case 'w':
      if (selected.z > 0) selected.z--;
      break;
    case 's':
      if (selected.z < 2) selected.z++;
      break;
    case 'a':
      if (selected.x > 0) selected.x--;
      break;
    case 'd':
      if (selected.x < 2) selected.x++;
      break;
    case 'q':
      if (selected.y > 0) selected.y--;
      break;
    case 'e':
      if (selected.y < 2) selected.y++;
      break;
    case ' ':
      flip(selected.x, selected.y, selected.z)
      break;
    case 'r':
      randomize();
      break;
  }
  if (useWireframe) {
    const { x: newX, y: newY, z: newZ } = selected;
    cubeMatrix[newX][newY][newZ].material.wireframe = true;
  }
});
window.randomize = randomize;
function randomize() {
  for (const row of cubeMatrix) {
    for (const col of row) {
      for (const cube of col) {
        cube.material.color.set(255, 255, 255);
      }
    }
  }
  const iterations = parseInt(document.querySelector('input[type="range"]').value);
  for (let i = 0; i < iterations; i++) {
    const rx = Math.floor(Math.random() * 3);
    const ry = Math.floor(Math.random() * 3);
    const rz = Math.floor(Math.random() * 3);
    flip(rx, ry, rz);
  }
}

function flip(x, y, z) {
  const delta = [
    [-1,-1,-1],
    [-1,-1, 0],
    [-1,-1, 1],
    [-1, 0,-1],
    [-1, 0, 0],
    [-1, 0, 1],
    [-1, 1,-1],
    [-1, 1, 0],
    [-1, 1, 1],
    [ 0,-1,-1],
    [ 0,-1, 0],
    [ 0,-1, 1],
    [ 0, 0,-1],
    [ 0, 0, 0],
    [ 0, 0, 1],
    [ 0, 1,-1],
    [ 0, 1, 0],
    [ 0, 1, 1],
    [ 1,-1,-1],
    [ 1,-1, 0],
    [ 1,-1, 1],
    [ 1, 0,-1],
    [ 1, 0, 0],
    [ 1, 0, 1],
    [ 1, 1,-1],
    [ 1, 1, 0],
    [ 1, 1, 1]
  ]
  for (let i = 0; i < delta.length; i++) {
    const [dx, dy, dz] = delta[i];
    const newX = x + dx;
    const newY = y + dy;
    const newZ = z + dz;
    if (newX < 0 || newX > 2 || newY < 0 || newY > 2 || newZ < 0 || newZ > 2) continue;
    const temp = cubeMatrix[newX][newY][newZ];
    const color = temp.material.color;
    if (color.r === 0 && color.g === 0 && color.b === 0) {
      temp.material.color.set(255, 255, 255);
    } else {
      temp.material.color.set(0, 0, 0);
    }
  }
}

let start = new Date();
function animate() {
  if (!useWireframe) {
    for (const row of cubeMatrix) {
      for (const col of row) {
        for (const cube of col) {
          cube.material.wireframe = false;
        }
      }
    }
  }

  interactionManager.update();

  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();