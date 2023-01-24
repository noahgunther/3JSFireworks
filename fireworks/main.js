/* Modules */
import './style.css'

import * as THREE from 'three';
import { Raycaster } from 'three';

/* Start threejs scene when window loaded */
window.addEventListener("load", init, false);

/* Init */
function init() {

  /* Initialize main scene */
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 0.1, 1000);

  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    antialias: false,
    powerPreference: "high-performance"
  });

  
  renderer.setPixelRatio(window.devicePixelRatio);

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  renderer.render(scene, camera);

  const size = renderer.getDrawingBufferSize( new THREE.Vector2() );
  const renderTarget = new THREE.WebGLRenderTarget( size.width, size.height, { samples: 2 } );

  const body = document.getElementById('body');

  /* Resize threejs scene on window resize */
  window.onresize = function () {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

  };

  /* Monitor mouse position */
  var intersectionPoint = new THREE.Vector3();

  const interesectionObjects = [];
  const rayCastTargetPlaneGeometry = new THREE.PlaneGeometry(100, 100, 1, 1);
  const rayCastTargetPlaneMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.0 });
  const rayCastTargetPlane = new THREE.Mesh(rayCastTargetPlaneGeometry, rayCastTargetPlaneMaterial);
  scene.add(rayCastTargetPlane);
  rayCastTargetPlane.position.set(0.0, 0.0, -10.0);
  rayCastTargetPlane.updateMatrixWorld();
  interesectionObjects.push(rayCastTargetPlane);
  
  const mousePagePosition = new THREE.Vector2(0.0, 0.0);
  document.body.addEventListener('mousemove', (event) => {
    mousePagePosition.x = (event.pageX / window.innerWidth) * 2 - 1;
    mousePagePosition.y = (event.pageY / window.innerHeight) * 2 - 1;
    mousePagePosition.y *= -1;
    
    const mouseRaycast = new THREE.Raycaster();
    mouseRaycast.setFromCamera(mousePagePosition, camera);
    const raycastIntersects = mouseRaycast.intersectObjects(interesectionObjects, true);
    intersectionPoint = raycastIntersects[0].point;
  });

  /* 3D Scene */
  scene.background = new THREE.Color(0x000005);

  const sphereGeometry = new THREE.SphereGeometry(0.1, 16, 16);
  const sphereMaterial = new THREE.MeshBasicMaterial();
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  scene.add(sphere);

  /* Scene render and animate */
  const clock = new THREE.Clock();

  function animate(time) {
    
    sphere.position.set(intersectionPoint.x, intersectionPoint.y, -10.0);
    
    var frame = requestAnimationFrame(animate);
    renderer.render(scene, camera);

  }

  animate(clock.getDelta());

}