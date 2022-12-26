import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

let camera, scene, renderer, clock, mixer;

function init() {
  clock = new THREE.Clock();

  // Init scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa0a0a0);

  // Light 1
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff);
  hemiLight.position.set(0, 20, 0);
  hemiLight.userData.name = "hemiLight";
  hemiLight.userData.isEnabled = false;
  scene.add(hemiLight);

  // Init camera (PerspectiveCamera)
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );

  // Position camera
  camera.position.set(0, 0, 2);

  // Init renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });

  // Set size (whole window)
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Reder Setting
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;

  // Render to canvas element
  document.body.appendChild(renderer.domElement);

  // Test Model
  const loader = new GLTFLoader();
  loader.load(
    "../assets/test.gltf",
    function (gltf) {
      console.log("gltf", gltf);
      scene.add(gltf.scene);

      const skeleton = new THREE.SkeletonHelper(gltf.scene);
      skeleton.visible = false;
      scene.add(skeleton);

      const animations = gltf.animations;
      mixer = new THREE.AnimationMixer(gltf.scene);
      const action = mixer.clipAction(animations[3]);
      action.play();
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );

  // Controls Dom
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 1;
  controls.maxDistance = 40;
  controls.enablePan = true;
}

// Draw the scene every time the screen is refreshed
function animate() {
  requestAnimationFrame(animate);

  mixer.update(clock.getDelta());

  renderer.render(scene, camera);
}

function onWindowResize() {
  // Camera frustum aspect ratio
  camera.aspect = window.innerWidth / window.innerHeight;
  // After making changes to aspect
  camera.updateProjectionMatrix();
  // Reset size
  renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
animate();
window.addEventListener("resize", onWindowResize, false);
