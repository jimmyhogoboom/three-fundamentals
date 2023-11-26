import * as THREE from 'three';

const boxGeometry = (width = 1, height = 1, depth = 1) => {
  return new THREE.BoxGeometry(width, height, depth)
}

const coneGeometry = ({
  radius = 1,
  height = 1,
  radialSegments = 16,
  heightSegments = 4,
  openEnded = true,
  thetaStart = Math.PI * 0.18,
  thetaLength = Math.PI * 0.82
} = {}) => {
  return new THREE.ConeGeometry(radius, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength);
};

const sphereGeometry = (radius = 1, widthSegments = 30, heightSegments = 30) => {
  return new THREE.SphereGeometry(radius, widthSegments, heightSegments);
}

function makeMesh(geometry, color) {
  const material = new THREE.MeshPhongMaterial({ color });
  return new THREE.Mesh(geometry, material);
}

function renderScene(renderer, scene, camera) {
  renderer.render(scene, camera);
}

function directionalLight() {
  const color = 0xFFFFFF;
  const intensity = 3;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);

  return light;
}

function resizeCameraAspectToDisplaySize(canvas, camera) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  return needResize;
}

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const pixelRatio = window.devicePixelRatio;
  const width = canvas.clientWidth * pixelRatio | 0;
  const height = canvas.clientHeight * pixelRatio | 0;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

const cubeOfColorAt = (c, { x }) => {
  const cube = makeMesh(boxGeometry(), c);
  cube.position.x = x;

  return cube;
};

const coneOfColorAt = (c, { x }) => {
  const cone = makeMesh(coneGeometry(), c);
  cone.position.x = x;

  return cone;
}

const sphereOfColorAt = (c, { x }) => {
  const sphere = makeMesh(sphereGeometry(), c);
  sphere.position.x = x;

  return sphere;
};

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

  const fov = 75;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 5;

  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  // TODO: move this according to player input
  camera.position.z = 2;

  const scene = new THREE.Scene();

  const meshDefs = [
    { color: 0x44aa88, initialX: 0 },
    { color: 0x8844aa, initialX: -2 },
    { color: 0xaa8844, initialX: 2 },
  ];

  const meshes = meshDefs.map((def, i) => {
    if (i % 3 === 0) {
      return coneOfColorAt(def.color, { x: def.initialX });
    }
    if (i % 2 === 0) {
      return sphereOfColorAt(def.color, { x: def.initialX })
    }
    return cubeOfColorAt(def.color, { x: def.initialX });
  });

  meshes.forEach(cube => scene.add(cube));

  // TODO: make this come from a nearby star
  const light = directionalLight();

  scene.add(light);

  const ops = [
    function rotatingCubes({ timeSeconds: t }) {
      meshes.forEach((cube, i) => {
        const speed = 1 + i * .1;
        const rotation = t * speed;
        cube.rotation.x = rotation;
        cube.rotation.y = rotation;
      });
    },
  ];

  let count = 0;

  // Begin rendering loop
  let h = window.innerWidth;
  let w = window.innerHeight;

  const render = time => {
    const timeSeconds = time * 0.001;

    resizeCameraAspectToDisplaySize(canvas, camera);

    resizeRendererToDisplaySize(renderer);

    ops.map(op => op({ time, timeSeconds }));

    renderScene(renderer, scene, camera);

    requestAnimationFrame(render);

    count++;

    let fps = count / timeSeconds;

    // if (count % 20 === 0 )
    //   console.log(count, time, fps)
  }

  requestAnimationFrame(render);
}

main();
