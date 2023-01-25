/* Modules */
import './style.css'

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass.js';

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
  const renderTarget = new THREE.WebGLRenderTarget(size.width, size.height, { samples: 3 });

  /* Post Processing */
  const composer = new EffectComposer(renderer, renderTarget);

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    3.6,
    0.1,
    0.1
  );
  composer.addPass(bloomPass);

  const afterimagePass = new AfterimagePass(0.98);
  composer.addPass(afterimagePass);
  
  composer.setPixelRatio(window.devicePixelRatio);
  composer.setSize(window.innerWidth, window.innerHeight);

  const body = document.getElementById('body');

  /* Resize threejs scene on window resize */
  window.onresize = function () {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    composer.setSize(window.innerWidth, window.innerHeight);

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

  /* 3D Objects */
  scene.background = new THREE.Color(0x000005);

  const sphereGeometry = new THREE.SphereGeometry(0.01, 16, 16);
  const sphereMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 1.0, 1.0) });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  scene.add(sphere);

  const pathMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff } );
  var pathMesh;

  class QuadraticSegmentCurve extends THREE.Curve {
    constructor(scale = 1, o = new THREE.Vector3(), t = new THREE.Vector3(), k = 0.0) {
      super();
      this.scale = scale;
      this.o = o;
      this.t = t;
      this.k = k;
    }
    getPoint(p, optionalTarget = new THREE.Vector3()) {

      const point = optionalTarget;

		  const scale = this.scale, o = this.o, t = this.t, k = this.k;

      p *= k;

      const px = new THREE.Vector3();
      px.lerpVectors(o, t, p*p);

      const py = new THREE.Vector3();
      py.lerpVectors(o, t, -1*p*p + (2*p));

      point.set(px.x, py.y, px.z).multiplyScalar(scale);
      
		  return point;

    }
  };

  function generatePath(origin, current, k) {

    let path = new QuadraticSegmentCurve(10, origin, current, k);
    let pathGeometry = new THREE.TubeGeometry(path, 36, (1-k) * 0.05, 3, false);

    pathMesh = new THREE.Mesh(pathGeometry, pathMaterial);

  }

  /* Projectile position while mouse down */
  var mouseDown = false;

  window.onmousedown = function() {

    sphere.position.set(intersectionPoint.x, intersectionPoint.y, intersectionPoint.z);
    mouseDown = true;
    launching = false;
    scene.remove(pathMesh);

  }

  window.onmouseup = function() {

    mouseDown = false;

    setLaunchPosition();

  }

  /* Launch setup and animate */
  var launchTime;
  const launchDuration = 1000;
  var terminalPoint = new THREE.Vector3();
  var originPoint = new THREE.Vector3();
  var launching = false;

  function setLaunchPosition() {

    terminalPoint = new THREE.Vector3(intersectionPoint.x, intersectionPoint.y, -10.0);

    let originPointPageX = 0.0;
    let originPointPageY = -1.0;
    
    const originPointRayCast = new THREE.Raycaster();
    originPointRayCast.setFromCamera(new THREE.Vector2(originPointPageX, originPointPageY), camera);
    const raycastIntersects = originPointRayCast.intersectObjects(interesectionObjects, true);

    originPoint = raycastIntersects[0].point;

    launchTime = Date.now();

    launching = true;

  }

  function animateLaunch() {

    const currentTime = Date.now() - launchTime;

    const k = currentTime / launchDuration;

    if (k >= 1.0) {

      launching = false;

      scene.remove(pathMesh);

    }

    else {

      const currentPositionX = new THREE.Vector3();
      const currentPositionY = new THREE.Vector3();
      currentPositionX.lerpVectors(originPoint, terminalPoint, k*k);
      currentPositionY.lerpVectors(originPoint, terminalPoint, -1*k*k+(2*k));

      sphere.position.set(currentPositionX.x, currentPositionY.y, currentPositionX.z);

      const kclamp = Math.max(Math.min(k, 1.0), 0.5);

      sphere.scale.set(kclamp, kclamp, kclamp);

      scene.remove(pathMesh);
      generatePath(originPoint, terminalPoint, k);
      scene.add(pathMesh);

    }

  }

  /* Scene render and animate */
  const clock = new THREE.Clock();

  function animate() {

    var time = clock.getDelta();
    
    if (mouseDown) sphere.position.set(intersectionPoint.x, intersectionPoint.y, -10.0);

    else if (launching) { animateLaunch(); }
    
    renderer.render(scene, camera);

    composer.render();
    
    var frame = requestAnimationFrame(animate);

  }

  animate();

}