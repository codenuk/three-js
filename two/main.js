import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import gsap from "gsap";

let camera, scene, renderer;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function init() {
  // Init scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa0a0a0);
  scene.fog = new THREE.Fog(scene.background, 1, 5000);

  // Light 1
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff);
  hemiLight.position.set(0, 20, 0);
  hemiLight.userData.name = "hemiLight";
  hemiLight.userData.isEnabled = false;
  scene.add(hemiLight);

  // Light 2
  const dirLight = new THREE.DirectionalLight(0xffffff);
  dirLight.position.set(-3, 10, -10);
  dirLight.castShadow = true;
  dirLight.shadow.camera.top = 2;
  dirLight.shadow.camera.bottom = -2;
  dirLight.shadow.camera.left = -2;
  dirLight.shadow.camera.right = 2;
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 40;
  dirLight.userData.name = "dirLight";
  dirLight.userData.isEnabled = false;
  scene.add(dirLight);

  // Init camera (PerspectiveCamera)
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );

  // Position camera
  camera.position.set(0, 10, 30);

  // Init renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });

  // Set size (whole window)
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Reder Setting
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;

  // Render to canvas element
  document.body.appendChild(renderer.domElement);

  // Room Model
  const loader = new GLTFLoader();
  loader.load(
    "../assets/room/scene.gltf",
    function (gltf) {
      gltf.scene.userData.name = "Room";
      gltf.scene.userData.isEnabled = false;
      scene.add(gltf.scene);
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );

  // Shiba Model
  loader.load(
    "../assets/shiba/scene.gltf",
    function (gltf) {
      gltf.scene.position.set(5, 0, 10);
      gltf.scene.userData.name = "Shiba";
      gltf.scene.userData.isEnabled = true;
      scene.add(gltf.scene);
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

function onClick(event) {
  // calculate pointer position in normalized device coordinates
  // (-1 to +1) for both components

  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // update the picking ray with the camera and pointer position
  raycaster.setFromCamera(pointer, camera);

  // calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length === 0) return;

  if (intersects[0].object.userData.name.search("Shiba") > 0) {
    intersects[0].object.material.color.set(0xff0000);

    gsap.to(camera.position, {
      duration: 1, // seconds
      x: intersects[0].point.x,
      y: intersects[0].point.y,
      z: intersects[0].point.z + 3,
      onUpdate: function () {
        camera.lookAt(intersects[0].point.x, intersects[0].point.y, intersects[0].point.z)
      },
    });
  }
}

init();
animate();
window.addEventListener("resize", onWindowResize, false);
window.addEventListener("click", onClick);
