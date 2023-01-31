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
  const rayCastTargetPlaneGeometry = new THREE.PlaneGeometry(300, 300, 1, 1);
  const rayCastTargetPlaneMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.0 });
  const rayCastTargetPlane = new THREE.Mesh(rayCastTargetPlaneGeometry, rayCastTargetPlaneMaterial);
  scene.add(rayCastTargetPlane);
  rayCastTargetPlane.position.set(0.0, 0.0, -10.0);
  rayCastTargetPlane.updateMatrixWorld();
  interesectionObjects.push(rayCastTargetPlane);
  
  const mousePagePosition = new THREE.Vector2(0.0, 0.0);
  var timelineMousePageX;
  document.body.addEventListener('mousemove', (event) => {
    timelineMousePageX = event.clientX;
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
  var recording = false;
  var timelinePlaying = false;
  var skipToEnd = false;
  var skipToStart = false;
  var lastAfterImageDampValue = afterimagePass.uniforms['damp'].value;
  var timelineReversing = false;
  var loopForever = true;

  // Timeline ui
  const timelineLine = document.getElementById("timelinelinewrapper");
  const timelinePositionMarker = document.getElementById("timelineposition");
  const playPauseButton = document.getElementById("playpausebutton");
  const playButtonImg = document.getElementById("playbutton");
  const pauseButtonImg = document.getElementById("pausebutton");
  const skipToEndButton = document.getElementById("skiptoendbutton");
  const skipToStartButton = document.getElementById("skiptostartbutton");
  const reversePauseButton = document.getElementById("reversepausebutton");
  const reverseButtonImg = document.getElementById("reversebutton");
  const reversePauseButtonImg = document.getElementById("pausebuttonrev");
  const loopButton = document.getElementById("loopbutton");
  const loopOnceButtonImg = document.getElementById("looponcebutton");
  const loopForeverButtonImg = document.getElementById("loopforeverbutton");

  function updateTimelinePositionMarker() {

    const currentTime = timelinePosition / timelineLength;
    timelinePositionMarker.style.setProperty('left', currentTime * 100.0 + '%');

  }

  timelineLine.onmouseover = function() {
    body.style.setProperty('cursor', 'pointer');
  }
  timelineLine.onmouseout = function() {
    body.style.setProperty('cursor', 'default');
  }
  var timelinePositionMarkerHeld = false;
  timelineLine.onmousedown = function(e) {
    lastAfterImageDampValue = afterimagePass.uniforms['damp'].value;
    afterimagePass.uniforms['damp'].value = 0.0;
    timelinePositionMarkerHeld = true;
  }
  window.onmouseup = function() {
    afterimagePass.uniforms['damp'].value = lastAfterImageDampValue;
    if (timelinePositionMarkerHeld) timelinePositionMarkerHeld = false;
  }

  playPauseButton.onmouseover = function() {
    body.style.setProperty('cursor', 'pointer');
  }
  playPauseButton.onmouseout = function() {
    body.style.setProperty('cursor', 'default');
  }
  playPauseButton.onclick = function() {
    
    timelineReversing = false;
    reverseButtonImg.style.visibility = !timelineReversing ? 'visible' : 'hidden';
    reversePauseButtonImg.style.visibility = timelineReversing ? 'visible' : 'hidden';

    timelinePlaying = !timelinePlaying;

    playButtonImg.style.visibility = !timelinePlaying ? 'visible' : 'hidden';
    pauseButtonImg.style.visibility = timelinePlaying ? 'visible' : 'hidden';

    afterimagePass.uniforms['damp'].value = timelinePlaying ? 0.98 : 1.0;

  }

  skipToEndButton.onmouseover = function() {
    body.style.setProperty('cursor', 'pointer');
  }
  skipToEndButton.onmouseout = function() {
    body.style.setProperty('cursor', 'default');
  }
  skipToEndButton.onclick = function() {
    
    skipToEnd = true;

    lastAfterImageDampValue = afterimagePass.uniforms['damp'].value;

  }

  reversePauseButton.onmouseover = function() {
    body.style.setProperty('cursor', 'pointer');
  }
  reversePauseButton.onmouseout = function() {
    body.style.setProperty('cursor', 'default');
  }
  reversePauseButton.onclick = function() {
    
    timelinePlaying = false;
    playButtonImg.style.visibility = !timelinePlaying ? 'visible' : 'hidden';
    pauseButtonImg.style.visibility = timelinePlaying ? 'visible' : 'hidden';

    timelineReversing = !timelineReversing;

    reverseButtonImg.style.visibility = !timelineReversing ? 'visible' : 'hidden';
    reversePauseButtonImg.style.visibility = timelineReversing ? 'visible' : 'hidden';

    afterimagePass.uniforms['damp'].value = timelineReversing ? 0.0 : 1.0;

  }

  skipToStartButton.onmouseover = function() {
    body.style.setProperty('cursor', 'pointer');
  }
  skipToStartButton.onmouseout = function() {
    body.style.setProperty('cursor', 'default');
  }
  skipToStartButton.onclick = function() {
    
    skipToStart = true;

    lastAfterImageDampValue = afterimagePass.uniforms['damp'].value;

  }

  loopButton.onmouseover = function() {
    body.style.setProperty('cursor', 'pointer');
  }
  loopButton.onmouseout = function() {
    body.style.setProperty('cursor', 'default');
  }
  loopButton.onclick = function() {

    loopForever = !loopForever;
    
    loopOnceButtonImg.style.visibility = !loopForever ? 'visible' : 'hidden';
    loopForeverButtonImg.style.visibility = loopForever ? 'visible' : 'hidden';

  }

  /* Firework parameters */
  const body = document.getElementById('body');

  // Recording
  const recordToggle = document.getElementById("recordtoggle");
  recordToggle.checked = recording;

  recordToggle.addEventListener("change", function() {
    recording = recordToggle.checked;
    timelinePlaying = false;
    timelineReversing = false;
    afterimagePass.uniforms['damp'].value = 0.98;
  });

  // Random parameters toggles
  const randomTypeToggle = document.getElementById("randomtypetoggle");
  const randomColorToggle = document.getElementById("randomcolortoggle");
  const randomScaleToggle = document.getElementById("randomscaletoggle");
  var randomizeTypeBool = true;
  var randomizeColorBool = true;
  var randomizeScaleBool = true;
  randomTypeToggle.checked = true;
  randomColorToggle.checked = true;
  randomScaleToggle.checked = true;

  function randomizeExplosionType() {

    const type = Math.floor(Math.random() * explosionTypeNames.length);

    explosionTypePicker.value = explosionTypeNames[type];

    return explosionTypeNames[type];

  }

  function randomizeColor() {

    const color = new THREE.Color(Math.random(), Math.random(), Math.random());

    return color;

  }

  function randomizeScale() {

    const scale = (Math.random() * (scaleValueMax - scaleValueMin)) + scaleValueMin;

    scalePickerDisplayValue.style.setProperty('font-size', scale * 100.0 + '%');

    return scale;

  }

  randomTypeToggle.addEventListener("change", function() {
    randomizeTypeBool = randomTypeToggle.checked;
  });
  randomColorToggle.addEventListener("change", function() {
    randomizeColorBool = randomColorToggle.checked;
  });
  randomScaleToggle.addEventListener("change", function() {
    randomizeScaleBool = randomScaleToggle.checked;
  });

  // Explosion type
  var explosionTypeNames = [];
  explosionTypeNames.push("burst");
  explosionTypeNames.push("drift");
  explosionTypeNames.push("pop");
  explosionTypeNames.push("flash");
  explosionTypeNames.push("zap");
  explosionTypeNames.push("flower");
  explosionTypeNames.push("flower2");

  const explosionTypePicker = document.getElementById("explosiontype");
  var explosionType = randomizeExplosionType();

  explosionTypePicker.addEventListener("input", (event) => {
    explosionType = explosionTypePicker.value;
  });

  // Colors
  const colorPicker0 = document.getElementById("color0");
  const colorPicker1 = document.getElementById("color1");
  const colorPicker2 = document.getElementById("color2");
  var color0 = randomizeColor();
  var color1 = randomizeColor();
  var color2 = randomizeColor();

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
    colorPicker2.value = rgbToHex(Math.floor(color2.r * 255), Math.floor(color2.g * 255), Math.floor(color2.b * 255));

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

  colorPicker2.addEventListener("input", (event) => {
    color2 = hexToRgb(colorPicker2.value);
    color2 = new THREE.Color(color2.r, color2.g, color2.b);
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
      launchCompleted,
      explosionPlayed,
      projectileDisposed,
      explosionDisposed,
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
      explosionType,
      color0,
      color1,
      color2,
      explosionScale,
      position
    ) {
      this.active = active;
      this.recorded = recorded;
      this.playLaunchOneShot = playLaunchOneShot;
      this.launchCompleted = launchCompleted;
      this.explosionPlayed = explosionPlayed;
      this.projectileDisposed = projectileDisposed;
      this.explosionDisposed = explosionDisposed;
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
      this.explosionType = explosionType;
      this.color0 = color0;
      this.color1 = color1;
      this.color2 = color2;
      this.explosionScale = explosionScale;
      this.position = position;
    }
  }

  /* 3D object creation functions */
  function createProjectile(color) {

    const projectileGeometry = new THREE.SphereGeometry(0.005, 3, 3);
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
    constructor(scale = 1, o = new THREE.Vector3(), t = new THREE.Vector3(), k = 0.0, sv = 1.0, type = '') {
      super();
      this.scale = scale;
      this.o = o;
      this.t = t;
      this.k = k;
      this.sv = sv;
      this.type = type;
    }
    getPoint(p, optionalTarget = new THREE.Vector3()) {

      const point = optionalTarget;

		  const scale = this.scale, o = this.o, t = this.t, k = this.k, sv = this.sv, type = this.type;

      p *= k;

      const pxyz = new THREE.Vector3();

      if (type == "burst") {
        const l = new THREE.Vector3();
        l.lerpVectors(o, t, k - k/2);
        pxyz.lerpVectors(o, t, p);
      }
      else if (type == "drift") {
        pxyz.lerpVectors(o, t, p);
        pxyz.y -= p*p*0.075*sv;
      }
      else if (type == "zap") {
        pxyz.lerpVectors(o, t, p);
        pxyz.x += (Math.random() * 0.02 - 0.01) * sv * (1-k);
        pxyz.y += (Math.random() * 0.02 - 0.01) * sv * (1-k);
        pxyz.z += (Math.random() * 0.02 - 0.01) * sv * (1-k);
      }
      else if (type == "flower") {
        const l = new THREE.Vector3();
        l.lerpVectors(o, t, k*k*3.0);
        pxyz.lerpVectors(l, t, p);
      }
      else if (type == "flower2") {
        const l = new THREE.Vector3();
        l.lerpVectors(o, t, k*k*3.0);
        l.normalize();
        pxyz.lerpVectors(l, t, p);
      }

      point.set(pxyz.x, pxyz.y, pxyz.z).multiplyScalar(scale);
      
		  return point;

    }
  };

  function generateExplosionPath(origin, current, k, color, sv, type) {

    const pathPoints = new ExplosionSegmentCurve(10, origin, current, k, sv, type);
    const pathGeometry = new THREE.TubeGeometry(pathPoints, 6, Math.max((1-k) * 0.05, 0.001), 3, false);
    const pathMaterial = new THREE.MeshBasicMaterial( { color: color } );

    const pathMesh = new THREE.Mesh(pathGeometry, pathMaterial);
    return pathMesh;

  }

  /* Firework creation */
  var mouseDown = false;
  var currentProjectile;
  var fireworks = [];

  canvas.onmousedown = function() {

    if (randomizeTypeBool) explosionType = randomizeExplosionType();
    if (randomizeColorBool) {  
      color0 = randomizeColor();
      color1 = randomizeColor();
      color2 = randomizeColor();
      updateColorPickers();
    }
    if (randomizeScaleBool) scaleValue = randomizeScale();

    currentProjectile = createProjectile(color0);

    currentProjectile.position.set(intersectionPoint.x, intersectionPoint.y, intersectionPoint.z);

    mouseDown = true;

  }

  canvas.onmouseup = function() {

    if (mouseDown) {
      
      mouseDown = false;

      updatePositionDisplayValues(mousePagePosition.x, mousePagePosition.y);

      const launchDuration = 1000;
      let explodeDuration;
      explodeDuration = 500;
      if (explosionType == "pop") explodeDuration = 350;
      else if (explosionType == "flash") explodeDuration = 200;

      const terminalPointX = (Math.round((mousePagePosition.x / 2 + 0.5) * 1000) * 0.1).toFixed(1);
      const terminalPointY = (Math.round((mousePagePosition.y / 2 + 0.5) * 1000) * 0.1).toFixed(1);

      const terminalPoint = new THREE.Vector3(intersectionPoint.x, intersectionPoint.y, intersectionPoint.z);
      let explosionMeshes = [];
      let explosionPathMeshes = [];
      let explosionTerminalPoints = [];
      function createExplosion(type, p, color) {

        const shrapnelCount = type == "flash" ? 1 : 20 + Math.floor(Math.random() * 10);
        const radiusRandom = Math.max(Math.random() * 0.25, 0.15) * scaleValue;

        for (let j = 0; j < shrapnelCount; j++) {

          explosionMeshes.push(createExplosionComponent(type));

          explosionPathMeshes.push(null);

          if (type == "burst" || type == "pop") {
            const phi = Math.acos(1.0 - 2.0*j/shrapnelCount);
            const theta = 6.28 * j/1.618;
            explosionTerminalPoints.push(new THREE.Vector3(
              (Math.cos(theta)*Math.sin(phi) + (Math.random() * 0.2 - 0.1)) * radiusRandom,
              (Math.sin(theta)*Math.sin(phi) + (Math.random() * 0.2 - 0.1)) * radiusRandom, 
              (Math.sin(theta)*Math.cos(phi) + (Math.random() * 0.2 - 0.1)) * radiusRandom
            ));
          }
          else if (type == "drift" || type == "zap") {
            explosionTerminalPoints.push(new THREE.Vector3(
              (Math.random() * 2 - 1) * radiusRandom,
              (Math.random() * 2 - 1) * radiusRandom, 
              (Math.random() * 2 - 1) * radiusRandom
            ));
          }
          else if (type == "flash") {
            explosionTerminalPoints.push(new THREE.Vector3(0.0, 0.0, 0.0));
          }
          else if (type == "flower" || type == "flower2") {
            explosionTerminalPoints.push(new THREE.Vector3(
              (Math.sin(j) + (Math.random() * 0.2 - 0.1)) * radiusRandom * 0.33,
              (Math.cos(j) + (Math.random() * 0.2 - 0.1)) * radiusRandom * 0.33, 
              (Math.cos(j) + (Math.random() * 0.2 - 0.1)) * radiusRandom * 0.33
            ));
          }

        }

        function createExplosionComponent(type) {

          const segmentCount = type == "pop" || type == "flash" ? 32 : 3;
          const shrapnelGeometry = new THREE.SphereGeometry(0.0025, segmentCount, segmentCount);
          const shrapnelMaterial = new THREE.MeshBasicMaterial({ color: color });
          const shrapnel = new THREE.Mesh(shrapnelGeometry, shrapnelMaterial);
          scene.add(shrapnel);
          shrapnel.position.set(p.x, p.y, p.z);

          return shrapnel;

        }

      }

      createExplosion(explosionType, terminalPoint, color1);

      fireworks.push(
        new Firework(
          true,
          recording,
          recording,
          false,
          false,
          false,
          false,
          launchDuration,
          recording ? timelinePosition - launchDuration : Date.now(),
          setLaunchPosition(),
          terminalPoint,
          explodeDuration,
          recording ? timelinePosition : Date.now() + launchDuration,
          explosionTerminalPoints,
          currentProjectile,
          null,
          explosionMeshes,
          explosionPathMeshes,
          explosionType,
          color0,
          color1,
          color2,
          scaleValue,
          new THREE.Vector2(
            terminalPointX, 
            terminalPointY
          )
        )
      );

      if (!timelinePlaying) updateFireworks();

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

  function updateTerminalPosition(index) {

    const terminalPointPageX = (fireworks[index].position.x * 0.01) * 2.0 - 1.0;
    const terminalPointPageY = (fireworks[index].position.y * 0.01) * 2.0 - 1.0;
    
    const originPointRayCast = new THREE.Raycaster();
    originPointRayCast.setFromCamera(new THREE.Vector2(terminalPointPageX, terminalPointPageY), camera);
    const raycastIntersects = originPointRayCast.intersectObjects(interesectionObjects, true);

    return raycastIntersects[0].point;

  }

  function animateFirework(index) {

    if (fireworks[index].active) {

      const currentTime = fireworks[index].recorded ? timelinePosition - fireworks[index].launchTime : Date.now() - fireworks[index].launchTime;

      let k = currentTime / fireworks[index].launchDuration;

      fireworks[index].terminalPoint = updateTerminalPosition(index);

      if (k < 1.0 && k >= 0.0) {

        scene.add(fireworks[index].projectileMesh);

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

        fireworks[index].launchCompleted = false;
        fireworks[index].projectileDisposed = false;

      }

      else if (
      ((!fireworks[index].launchCompleted || fireworks[index].playLaunchOneShot) && k > 0.0 && !skipToEnd) 
      || (timelinePosition == 0.0 && k >= 1.0 && recording)) {

        fireworks[index].launchCompleted = true;
        fireworks[index].playLaunchOneShot = false;

        k = 1.0;

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

        fireworks[index].projectileDisposed = false;

      }

      else if (!fireworks[index].projectileDisposed && fireworks[index].pathMesh != null) {

        scene.remove(fireworks[index].pathMesh);
        scene.remove(fireworks[index].projectileMesh);

        fireworks[index].pathMesh.geometry.dispose();
        fireworks[index].pathMesh.material.dispose();

        fireworks[index].projectileMesh.geometry.dispose();
        fireworks[index].projectileMesh.material.dispose();

        fireworks[index].projectileDisposed = true;

        if (!fireworks[index].recorded) {
          fireworks[index].pathMesh = null;
          fireworks[index].projectileMesh = null;
        }

      }

      animateExplosion(index);

    }

  }

  function animateExplosion(index) {

    const currentTime = fireworks[index].recorded ? timelinePosition - fireworks[index].explodeTime : Date.now() - fireworks[index].explodeTime;

    const k = currentTime / fireworks[index].explodeDuration;

    for (let j = 0; j < fireworks[index].explosionMeshes.length; j++) {

      if (k < 1.0 && k >= 0.0) {

        scene.add(fireworks[index].explosionMeshes[j]);

        var currentPosition = new THREE.Vector3();
        var terminalPoint = new THREE.Vector3(
          fireworks[index].terminalPoint.x + fireworks[index].explosionTerminalPoints[j].x, 
          fireworks[index].terminalPoint.y + fireworks[index].explosionTerminalPoints[j].y, 
          fireworks[index].terminalPoint.z + fireworks[index].explosionTerminalPoints[j].z 
        );

        currentPosition.lerpVectors(fireworks[index].terminalPoint, terminalPoint, k);

        if (fireworks[index].explosionType == "drift") {
          currentPosition.y -= k*k*0.075*fireworks[index].explosionScale;
        }
  
        fireworks[index].explosionMeshes[j].position.set(currentPosition.x, currentPosition.y, currentPosition.z);

        const colorMix = new THREE.Color();
        colorMix.lerpColors(fireworks[index].color1, fireworks[index].color2, Math.max(Math.min(k*2.0 - 1.0, 1.0), 0.0));
        fireworks[index].explosionMeshes[j].material.color = colorMix;

        if (fireworks[index].explosionType != "pop" && fireworks[index].explosionType != "flash") {

          const kclamp = Math.max(Math.min(1.0-k, 1.0), 0.5);
          fireworks[index].explosionMeshes[j].scale.set(kclamp, kclamp, kclamp);

          if (fireworks[index].explosionPathMeshes[j] != null) { 
            scene.remove(fireworks[index].explosionPathMeshes[j]);
            fireworks[index].explosionPathMeshes[j].geometry.dispose();
            fireworks[index].explosionPathMeshes[j].material.dispose();
          }
          
          fireworks[index].explosionPathMeshes[j] = generateExplosionPath(
            fireworks[index].terminalPoint, 
            terminalPoint, 
            k, 
            colorMix,
            fireworks[index].explosionScale,
            fireworks[index].explosionType
          );

          scene.add(fireworks[index].explosionPathMeshes[j]);

        }

        else if (fireworks[index].explosionType == "pop") {

          const popScale = k * 2.0 * fireworks[index].explosionScale * (1/j+1) * Math.random()*k;
          fireworks[index].explosionMeshes[j].scale.set(popScale, popScale, popScale);

        }

        else if (fireworks[index].explosionType == "flash") {

          const flashScale = k * 20.0 * fireworks[index].explosionScale;
          fireworks[index].explosionMeshes[j].scale.set(flashScale, flashScale, flashScale);

        }

        fireworks[index].explosionPlayed = true;

        fireworks[index].explosionDisposed = false;
  
      }
  
      else if (!fireworks[index].explosionDisposed && fireworks[index].explosionPlayed) {

        scene.remove(fireworks[index].explosionMeshes[j]);

        if (fireworks[index].explosionType != "pop" && fireworks[index].explosionType != "flash") {

          scene.remove(fireworks[index].explosionPathMeshes[j]);
          fireworks[index].explosionPathMeshes[j].geometry.dispose();
          fireworks[index].explosionPathMeshes[j].material.dispose();

        }
        
        fireworks[index].explosionMeshes[j].geometry.dispose();
        fireworks[index].explosionMeshes[j].material.dispose();

        if (!fireworks[index].recorded) {
          fireworks[index].explosionPathMeshes[j] = null;
          fireworks[index].explosionMeshes[j] = null;
        }

        if (j == fireworks[index].explosionMeshes.length - 1) {
          fireworks[index].explosionDisposed = true;
          fireworks[index].explosionPlayed = false;
          if (!fireworks[index].recorded) fireworks[index].active = false;
        }

      }
      
    }

  }

  /* Scene render and animate */
  const clock = new THREE.Clock();
  var timeOnLastFrame = 0.0;

  function updateFireworks() {
    for (let i = 0; i < fireworks.length; i++) {
      animateFirework(i);
    }
  }

  function animate(time) {

    if (recording) {

      if (timelinePositionMarkerHeld) {

        const tlRect = timelineLine.getBoundingClientRect();
        const x = timelineMousePageX - tlRect.left;
        var t = x / tlRect.width;
        t = Math.max(Math.min(t, 1.0), 0.0);

        timelinePosition = t * timelineLength;
        timelinePositionMarker.style.setProperty('left', t * 100.0 + '%');

        updateFireworks();

      }

      else if (skipToEnd) {

        afterimagePass.uniforms['damp'].value = 0.0;

        timelinePosition = timelineLength;

        updateTimelinePositionMarker();

        updateFireworks();

        skipToEnd = false;

        requestAnimationFrame(function() { afterimagePass.uniforms['damp'].value = lastAfterImageDampValue; });

      }

      else if (skipToStart) {

        afterimagePass.uniforms['damp'].value = 0.0;

        timelinePosition = 0.0;

        updateTimelinePositionMarker();

        updateFireworks();

        skipToStart = false;

        requestAnimationFrame(function() { afterimagePass.uniforms['damp'].value = lastAfterImageDampValue; });

      }

      else if (timelinePlaying) { 

        timelinePosition += time - timeOnLastFrame;

        if (timelinePosition >= timelineLength) {

          timelinePosition = 0.0;

          if (!loopForever) {

            timelinePosition = 0.0;
            timelinePlaying = false;

            playButtonImg.style.visibility = !timelinePlaying ? 'visible' : 'hidden';
            pauseButtonImg.style.visibility = timelinePlaying ? 'visible' : 'hidden';

            afterimagePass.uniforms['damp'].value = timelinePlaying ? 0.98 : 1.0;

          }

          lastAfterImageDampValue = afterimagePass.uniforms['damp'].value;
          afterimagePass.uniforms['damp'].value = 0.0;
          requestAnimationFrame(function() { afterimagePass.uniforms['damp'].value = lastAfterImageDampValue; });

        }

        updateTimelinePositionMarker();

        updateFireworks();

      }
      
      else if (timelineReversing) {

        timelinePosition -= time - timeOnLastFrame;

        if (timelinePosition <= 0.0) {

          timelinePosition = 0.0;
          timelineReversing = false;

          reverseButtonImg.style.visibility = !timelineReversing ? 'visible' : 'hidden';
          reversePauseButtonImg.style.visibility = timelineReversing ? 'visible' : 'hidden';

        }

        updateTimelinePositionMarker();

        updateFireworks();

      }

    }

    else {

      updateFireworks();

    }
    
    if (mouseDown) currentProjectile.position.set(intersectionPoint.x, intersectionPoint.y, intersectionPoint.z);
    
    renderer.render(scene, camera);
    composer.render();

    timeOnLastFrame = time;
    
    requestAnimationFrame(animate);

  }

  animate(clock.getDelta());

}
