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

  const canvas = document.getElementById('bg');

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

  /* Scene background */
  scene.background = new THREE.Color(0x000005);

  /* Palette options */
  const body = document.getElementById('body');

  const colorPicker0 = document.getElementById("color0");
  const colorPicker1 = document.getElementById("color1");
  var color0 = new THREE.Color(1.0, 1.0, 1.0);
  var color1 = new THREE.Color(0.0, 0.7, 0.5);

  function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }
  
  function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  }

  function updateColorPickers() {

    colorPicker0.value = rgbToHex(Math.floor(color0.r * 255), Math.floor(color0.g * 255), Math.floor(color0.b * 255));
    colorPicker1.value = rgbToHex(Math.floor(color1.r * 255), Math.floor(color1.g * 255), Math.floor(color1.b * 255));

  }

  updateColorPickers();

  function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: Number((parseInt(result[1], 16) / 255).toFixed(2)),
      g: Number((parseInt(result[2], 16) / 255).toFixed(2)),
      b: Number((parseInt(result[3], 16) / 255).toFixed(2))
    } : null;
  }

  colorPicker0.addEventListener("input", (event) => {
    color0 = hexToRgb(colorPicker0.value);
    color0 = new THREE.Color(color0.r, color0.g, color0.b);
  });

  colorPicker1.addEventListener("input", (event) => {
    color1 = hexToRgb(colorPicker1.value);
    color1 = new THREE.Color(color1.r, color1.g, color1.b);
  });

  const scalePickerDisplayValue = document.getElementById("scalevalue");
  const scalePickerMinus = document.getElementById("scaleminus");
  const scalePickerPlus = document.getElementById("scaleplus");
  var scaleValue = 1.0;
  const scaleValueMin = 0.5;
  const scaleValueMax = 3.0;

  scalePickerMinus.onmouseover = function() {
    body.style.setProperty('cursor', 'pointer');
  }
  scalePickerMinus.onmouseout = function() {
    body.style.setProperty('cursor', 'default');
  }
  scalePickerMinus.onclick = function() {
    if (scaleValue > scaleValueMin) {
      scaleValue -= 0.25;
      scalePickerDisplayValue.style.setProperty('font-size', scaleValue * 100.0 + '%');
    }
  }

  scalePickerPlus.onmouseover = function() {
    body.style.setProperty('cursor', 'pointer');
  }
  scalePickerPlus.onmouseout = function() {
    body.style.setProperty('cursor', 'default');
  }
  scalePickerPlus.onclick = function() {
    if (scaleValue < scaleValueMax) {
      scaleValue += 0.25;
      scalePickerDisplayValue.style.setProperty('font-size', scaleValue * 100.0 + '%');
    }
  }

  /* 3D object creation functions */
  function createProjectile(color) {

    const projectileGeometry = new THREE.SphereGeometry(0.005, 16, 16);
    const projectileMaterial = new THREE.MeshBasicMaterial({ color: color });
    const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);
    scene.add(projectile);

    return projectile;

  }

  class ProjectileSegmentCurve extends THREE.Curve {
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

  function generateProjectilePath(origin, current, k, color) {

    const pathPoints = new ProjectileSegmentCurve(10, origin, current, k);
    const pathGeometry = new THREE.TubeGeometry(pathPoints, 36, Math.max((1-k) * 0.01, 0.0025), 3, false);
    const pathMaterial = new THREE.MeshBasicMaterial( { color: color } );

    const pathMesh = new THREE.Mesh(pathGeometry, pathMaterial);
    return pathMesh;

  }

  function createExplosion(p, color, i) {

    activeExplosions[i] = [];
    explodeTimes[i] = Date.now();
    explosionOriginPoints[i] = [];
    explosionTerminalPoints[i] = [];
    activeExplosionPathMeshes[i] = [];

    const shrapnelCount = 20;
    const radiusRandom = Math.max(Math.random() * 0.25, 0.15) * scaleValue;

    function createExplosionComponent() {

      const shrapnelGeometry = new THREE.SphereGeometry(0.0025, 6, 6);
      const shrapnelMaterial = new THREE.MeshBasicMaterial({ color: color });
      const shrapnel = new THREE.Mesh(shrapnelGeometry, shrapnelMaterial);
      scene.add(shrapnel);
      shrapnel.position.set(p.x, p.y, p.z);

      return shrapnel;

    }

    for (let j = 0; j < shrapnelCount; j++) {
      activeExplosions[i].push(createExplosionComponent());
      explosionOriginPoints[i].push(p);
      explosionTerminalPoints[i].push(new THREE.Vector3(p.x + (Math.random() * 2 - 1) * radiusRandom, p.y + (Math.random() * 2 - 1) * radiusRandom, p.z + (Math.random() * 2 - 1) * radiusRandom));
    }

  }

  class ExplosionSegmentCurve extends THREE.Curve {
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

      const pxyz = new THREE.Vector3();
      pxyz.lerpVectors(o, t, p);
      pxyz.y -= p*p*0.075*scaleValue;

      point.set(pxyz.x, pxyz.y, pxyz.z).multiplyScalar(scale);
      
		  return point;

    }
  };

  function generateExplosionPath(origin, current, k, color) {

    const pathPoints = new ExplosionSegmentCurve(10, origin, current, k);
    const pathGeometry = new THREE.TubeGeometry(pathPoints, 36, Math.max((1-k) * 0.05, 0.001), 3, false);
    const pathMaterial = new THREE.MeshBasicMaterial( { color: color } );

    const pathMesh = new THREE.Mesh(pathGeometry, pathMaterial);
    return pathMesh;

  }

  /* Projectile position while mouse down */
  var mouseDown = false;
  var currentProjectile;
  var activeProjectiles = [];
  var activePathMeshes = [];
  var activeExplosions = [];
  var activeExplosionPathMeshes = [];

  canvas.onmousedown = function() {

    currentProjectile = createProjectile(color0);

    currentProjectile.position.set(intersectionPoint.x, intersectionPoint.y, intersectionPoint.z);

    mouseDown = true;

  }

  canvas.onmouseup = function() {

    if (mouseDown) {
      
      mouseDown = false;

      let overwritten = false;
      let index;
      for (let i = 0; i < activeProjectiles.length; i++) {
        if (activeProjectiles[i] == null && !overwritten) {
          activeProjectiles[i] = currentProjectile;
          overwritten = true;
          index = i;
        }
      }
      if (!overwritten) {
        activeProjectiles.push(currentProjectile);
        index = activeProjectiles.length - 1;
      }

      setLaunchPosition(index);

    }

  }

  /* Launch setup and animation */
  const launchDuration = 1000;
  const explodeDuration = 500;
  var launchTimes = [];
  var explodeTimes = [];
  var terminalPoints = [];
  var originPoints = [];
  var explosionTerminalPoints = [];
  var explosionOriginPoints = [];

  function setLaunchPosition(i) {

    terminalPoints[i] = new THREE.Vector3(intersectionPoint.x, intersectionPoint.y, intersectionPoint.z);

    const originPointPageX = 0.0;
    const originPointPageY = -1.0;
    
    const originPointRayCast = new THREE.Raycaster();
    originPointRayCast.setFromCamera(new THREE.Vector2(originPointPageX, originPointPageY), camera);
    const raycastIntersects = originPointRayCast.intersectObjects(interesectionObjects, true);

    originPoints[i] = raycastIntersects[0].point;

    launchTimes[i] = Date.now();

  }

  function animateLaunch(i) {

    const currentTime = Date.now() - launchTimes[i];

    const k = currentTime / launchDuration;

    if (k < 1.0) {

      const currentPositionX = new THREE.Vector3();
      const currentPositionY = new THREE.Vector3();
      currentPositionX.lerpVectors(originPoints[i], terminalPoints[i], k*k);
      currentPositionY.lerpVectors(originPoints[i], terminalPoints[i], -1*k*k+(2*k));

      activeProjectiles[i].position.set(currentPositionX.x, currentPositionY.y, currentPositionX.z);

      const kclamp = Math.max(Math.min(k, 1.0), 0.5) * 0.1;

      activeProjectiles[i].scale.set(kclamp, kclamp, kclamp);

      if (activePathMeshes[i]) { 
        scene.remove(activePathMeshes[i]);
        activePathMeshes[i].geometry.dispose();
        activePathMeshes[i].material.dispose();
      }
      activePathMeshes[i] = generateProjectilePath(originPoints[i], terminalPoints[i], k, activeProjectiles[i].material.color);
      scene.add(activePathMeshes[i]);

    }

    else if (activeProjectiles[i] != null) {

      createExplosion(activeProjectiles[i].position, color1, i);

      scene.remove(activePathMeshes[i]);
      scene.remove(activeProjectiles[i]);

      activePathMeshes[i].geometry.dispose();
      activePathMeshes[i].material.dispose();

      activeProjectiles[i].geometry.dispose();
      activeProjectiles[i].material.dispose();

      activePathMeshes[i] = null;
      activeProjectiles[i] = null;

    }

  }

  function animateExplosion(i) {

    const currentTime = Date.now() - explodeTimes[i];

    const k = currentTime / explodeDuration;

    for (let j = 0; j < activeExplosions[i].length; j++) {

      if (k < 1.0) {

        const currentPosition = new THREE.Vector3();
        currentPosition.lerpVectors(explosionOriginPoints[i][j], explosionTerminalPoints[i][j], k);
        currentPosition.y -= k*k*0.075*scaleValue;
  
        activeExplosions[i][j].position.set(currentPosition.x, currentPosition.y, currentPosition.z);

        const kclamp = Math.max(Math.min(1.0-k, 1.0), 0.5);

        activeExplosions[i][j].scale.set(kclamp, kclamp, kclamp);

        if (activeExplosionPathMeshes[i][j]) { 
          scene.remove(activeExplosionPathMeshes[i][j]);
          activeExplosionPathMeshes[i][j].geometry.dispose();
          activeExplosionPathMeshes[i][j].material.dispose();
        }
        activeExplosionPathMeshes[i][j] = generateExplosionPath(explosionOriginPoints[i][j], explosionTerminalPoints[i][j], k, activeExplosions[i][j].material.color);
        scene.add(activeExplosionPathMeshes[i][j]);
  
      }
  
      else if (activeExplosions[i][j] != null) {

        scene.remove(activeExplosions[i][j]);
        scene.remove(activeExplosionPathMeshes[i][j]);

        activeExplosions[i][j].geometry.dispose();
        activeExplosionPathMeshes[i][j].geometry.dispose();

        activeExplosions[i][j].material.dispose();
        activeExplosionPathMeshes[i][j].material.dispose();
  
        activeExplosions[i][j] = null;
        activeExplosionPathMeshes[i][j] = null;
  
      }
      
    }

  }

  /* Scene render and animate */
  const clock = new THREE.Clock();

  function animate() {

    var time = clock.getDelta();
    
    if (mouseDown) currentProjectile.position.set(intersectionPoint.x, intersectionPoint.y, intersectionPoint.z);

    for (let i = 0; i < activeProjectiles.length; i++) {
      animateLaunch(i);
    }

    for (let i = 0; i < activeExplosions.length; i++) {
      animateExplosion(i);
    }
    
    renderer.render(scene, camera);

    composer.render();
    
    var frame = requestAnimationFrame(animate);

  }

  animate();

}