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

  /* Timeline */
  var timelinePosition = 0;
  var timelineLength = 10000;
  var recording = true;
  var timelinePlaying = true;

  /* Firework parameters */
  const body = document.getElementById('body');

  // Random parameters toggle
  const randomParamsToggle = document.getElementById("randomparamstoggle");
  var randomizeParamsBool = true;
  randomParamsToggle.checked = true;

  function randomizeColor() {

    const color = new THREE.Color(Math.random(), Math.random(), Math.random());

    return color;

  }

  function randomizeScale() {

    const scale = (Math.random() * (scaleValueMax - scaleValueMin)) + scaleValueMin;

    scalePickerDisplayValue.style.setProperty('font-size', scale * 100.0 + '%');

    return scale;

  }

  randomParamsToggle.addEventListener("change", function() {
    randomizeParamsBool = randomParamsToggle.checked;
  });

  // Colors
  const colorPicker0 = document.getElementById("color0");
  const colorPicker1 = document.getElementById("color1");
  var color0 = randomizeColor();
  var color1 = randomizeColor();

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

  // Scale
  const scalePickerDisplayValue = document.getElementById("scalevalue");
  const scalePickerMinus = document.getElementById("scaleminus");
  const scalePickerPlus = document.getElementById("scaleplus");
  const scaleValueMin = 0.5;
  const scaleValueMax = 3.0;
  var scaleValue = randomizeScale();

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

  // Position values (read-only)
  const positionDisplayValues = document.getElementById("positionvalues");

  function updatePositionDisplayValues(x, y) {

    x = (Math.round((x / 2 + 0.5) * 1000) * 0.1).toFixed(1);
    y = (Math.round((y / 2 + 0.5) * 1000) * 0.1).toFixed(1);

    positionDisplayValues.innerHTML = "X: " + x + "% Y: " + y + "%";

  }

  /* Firework class */
  class Firework {
    constructor(
      active,
      recorded,
      playLaunchOneShot,
      launchDuration, 
      launchTime, 
      originPoint, 
      terminalPoint, 
      explodeDuration, 
      explodeTime,
      explosionTerminalPoints,
      projectileMesh,
      pathMesh,
      explosionMeshes,
      explosionPathMeshes,
      color0,
      color1,
      explosionScale,
      position
    ) {
      this.active = active;
      this.recorded = recorded;
      this.playLaunchOneShot = playLaunchOneShot;
      this.launchDuration = launchDuration;
      this.launchTime = launchTime;
      this.originPoint = originPoint;
      this.terminalPoint = terminalPoint;
      this.explodeDuration = explodeDuration;
      this.explodeTime = explodeTime;
      this.explosionTerminalPoints = explosionTerminalPoints;
      this.projectileMesh = projectileMesh;
      this.pathMesh = pathMesh;
      this.explosionMeshes = explosionMeshes;
      this.explosionPathMeshes = explosionPathMeshes;
      this.color0 = color0;
      this.color1 = color1;
      this.explosionScale = explosionScale;
      this.position = position;
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
    const pathGeometry = new THREE.TubeGeometry(pathPoints, 36, Math.max((1-k) * 0.01, 0.01), 3, false);
    const pathMaterial = new THREE.MeshBasicMaterial( { color: color } );

    const pathMesh = new THREE.Mesh(pathGeometry, pathMaterial);
    return pathMesh;

  }

  class ExplosionSegmentCurve extends THREE.Curve {
    constructor(scale = 1, o = new THREE.Vector3(), t = new THREE.Vector3(), k = 0.0, sv = 1.0) {
      super();
      this.scale = scale;
      this.o = o;
      this.t = t;
      this.k = k;
      this.sv = sv;
    }
    getPoint(p, optionalTarget = new THREE.Vector3()) {

      const point = optionalTarget;

		  const scale = this.scale, o = this.o, t = this.t, k = this.k, sv = this.sv;

      p *= k;

      const pxyz = new THREE.Vector3();
      pxyz.lerpVectors(o, t, p);
      pxyz.y -= p*p*0.075*sv;

      point.set(pxyz.x, pxyz.y, pxyz.z).multiplyScalar(scale);
      
		  return point;

    }
  };

  function generateExplosionPath(origin, current, k, color, sv) {

    const pathPoints = new ExplosionSegmentCurve(10, origin, current, k, sv);
    const pathGeometry = new THREE.TubeGeometry(pathPoints, 36, Math.max((1-k) * 0.05, 0.001), 3, false);
    const pathMaterial = new THREE.MeshBasicMaterial( { color: color } );

    const pathMesh = new THREE.Mesh(pathGeometry, pathMaterial);
    return pathMesh;

  }

  /* Firework creation */
  var mouseDown = false;
  var currentProjectile;
  var fireworks = [];

  canvas.onmousedown = function() {

    if (randomizeParamsBool) {
      color0 = randomizeColor();
      color1 = randomizeColor();
      updateColorPickers();
      scaleValue = randomizeScale();
    }

    currentProjectile = createProjectile(color0);

    currentProjectile.position.set(intersectionPoint.x, intersectionPoint.y, intersectionPoint.z);

    mouseDown = true;

  }

  canvas.onmouseup = function() {

    if (mouseDown) {
      
      mouseDown = false;

      updatePositionDisplayValues(mousePagePosition.x, mousePagePosition.y);

      const launchDuration = 1000;
      const explodeDuration = 500;

      const terminalPoint = new THREE.Vector3(intersectionPoint.x, intersectionPoint.y, intersectionPoint.z);
      let explosionMeshes = [];
      let explosionPathMeshes = [];
      let terminalPoints = [];
      function createExplosion(p, color) {

        const shrapnelCount = 20;
        const radiusRandom = Math.max(Math.random() * 0.25, 0.15) * scaleValue;

        for (let j = 0; j < shrapnelCount; j++) {

          explosionMeshes.push(createExplosionComponent());

          explosionPathMeshes.push(null);

          terminalPoints.push(new THREE.Vector3(
            p.x + (Math.random() * 2 - 1) * radiusRandom,
            p.y + (Math.random() * 2 - 1) * radiusRandom, 
            p.z + (Math.random() * 2 - 1) * radiusRandom
          ));

        }

        function createExplosionComponent() {

          const shrapnelGeometry = new THREE.SphereGeometry(0.0025, 6, 6);
          const shrapnelMaterial = new THREE.MeshBasicMaterial({ color: color });
          const shrapnel = new THREE.Mesh(shrapnelGeometry, shrapnelMaterial);
          scene.add(shrapnel);
          shrapnel.position.set(p.x, p.y, p.z);

          return shrapnel;

        }

      }

      createExplosion(terminalPoint, color1);

      fireworks.push(
        new Firework(
          true,
          recording,
          recording,
          launchDuration,
          recording ? Date.now() - launchDuration : Date.now(),
          setLaunchPosition(),
          terminalPoint,
          explodeDuration,
          recording ? Date.now() : Date.now() + launchDuration,
          terminalPoints,
          currentProjectile,
          null,
          explosionMeshes,
          explosionPathMeshes,
          color0,
          color1,
          scaleValue,
          new THREE.Vector2(mousePagePosition.x, mousePagePosition.y)
        )
      );

    }

  }

  /* Launch setup and animation */
  function setLaunchPosition() {

    const originPointPageX = 0.0;
    const originPointPageY = -1.0;
    
    const originPointRayCast = new THREE.Raycaster();
    originPointRayCast.setFromCamera(new THREE.Vector2(originPointPageX, originPointPageY), camera);
    const raycastIntersects = originPointRayCast.intersectObjects(interesectionObjects, true);

    return raycastIntersects[0].point;

  }

  function animateFirework(index) {

    if (fireworks[index].active) {

      const currentTime = Date.now() - fireworks[index].launchTime;

      const k = currentTime / fireworks[index].launchDuration;

      if (k < 1.0 || fireworks[index].playLaunchOneShot) {

        fireworks[index].playLaunchOneShot = false;

        const currentPositionX = new THREE.Vector3();
        const currentPositionY = new THREE.Vector3();
        currentPositionX.lerpVectors(fireworks[index].originPoint, fireworks[index].terminalPoint, k*k);
        currentPositionY.lerpVectors(fireworks[index].originPoint, fireworks[index].terminalPoint, -1*k*k+(2*k));

        fireworks[index].projectileMesh.position.set(currentPositionX.x, currentPositionY.y, currentPositionX.z);

        const kclamp = Math.max(Math.min(k, 1.0), 0.5) * 0.1;
        fireworks[index].projectileMesh.scale.set(kclamp, kclamp, kclamp);

        if (fireworks[index].pathMesh != null) { 
          scene.remove(fireworks[index].pathMesh);
          fireworks[index].pathMesh.geometry.dispose();
          fireworks[index].pathMesh.material.dispose();
        }
        fireworks[index].pathMesh = generateProjectilePath(fireworks[index].originPoint, fireworks[index].terminalPoint, k, fireworks[index].color0);
        scene.add(fireworks[index].pathMesh);

      }

      else if (fireworks[index].projectileMesh != null) {

        scene.remove(fireworks[index].pathMesh);
        scene.remove(fireworks[index].projectileMesh);

        fireworks[index].pathMesh.geometry.dispose();
        fireworks[index].pathMesh.material.dispose();

        fireworks[index].projectileMesh.geometry.dispose();
        fireworks[index].projectileMesh.material.dispose();

        fireworks[index].pathMesh = null;
        fireworks[index].projectileMesh = null;

      }

      animateExplosion(index);

    }

  }

  function animateExplosion(index) {

    const currentTime = Date.now() - fireworks[index].explodeTime;

    const k = currentTime / fireworks[index].explodeDuration;

    for (let j = 0; j < fireworks[index].explosionMeshes.length; j++) {

      if (k < 1.0 && k >= 0.0) {

        const currentPosition = new THREE.Vector3();
        currentPosition.lerpVectors(fireworks[index].terminalPoint, fireworks[index].explosionTerminalPoints[j], k);
        currentPosition.y -= k*k*0.075*fireworks[index].explosionScale;
  
        fireworks[index].explosionMeshes[j].position.set(currentPosition.x, currentPosition.y, currentPosition.z);

        const kclamp = Math.max(Math.min(1.0-k, 1.0), 0.5);
        fireworks[index].explosionMeshes[j].scale.set(kclamp, kclamp, kclamp);

        if (fireworks[index].explosionPathMeshes[j] != null) { 
          scene.remove(fireworks[index].explosionPathMeshes[j]);
          fireworks[index].explosionPathMeshes[j].geometry.dispose();
          fireworks[index].explosionPathMeshes[j].material.dispose();
        }
        fireworks[index].explosionPathMeshes[j] = generateExplosionPath(
          fireworks[index].terminalPoint, 
          fireworks[index].explosionTerminalPoints[j], 
          k, 
          fireworks[index].color1, 
          fireworks[index].explosionScale
        );

        scene.add(fireworks[index].explosionPathMeshes[j]);
  
      }
  
      else if (fireworks[index].explosionMeshes[j] != null && k > 0.0) {

        scene.remove(fireworks[index].explosionPathMeshes[j]);
        scene.remove(fireworks[index].explosionMeshes[j]);

        fireworks[index].explosionPathMeshes[j].geometry.dispose();
        fireworks[index].explosionPathMeshes[j].material.dispose();
        
        fireworks[index].explosionMeshes[j].geometry.dispose();
        fireworks[index].explosionMeshes[j].material.dispose();
        
        fireworks[index].explosionPathMeshes[j] = null;
        fireworks[index].explosionMeshes[j] = null;

        fireworks[index].active = false;
  
      }
      
    }

  }

  /* Scene render and animate */
  const clock = new THREE.Clock();

  function animate(time) {

    if (timelinePlaying) timelinePosition = time;
    timelinePosition %= timelineLength;
    console.log(timelinePosition);
    
    if (mouseDown) currentProjectile.position.set(intersectionPoint.x, intersectionPoint.y, intersectionPoint.z);

    for (let i = 0; i < fireworks.length; i++) {
      animateFirework(i);
    }
    
    renderer.render(scene, camera);

    composer.render();
    
    requestAnimationFrame(animate);

  }

  animate(clock.getDelta());

}