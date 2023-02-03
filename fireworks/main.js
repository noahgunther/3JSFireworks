//© 2023 Noah Gunther <noah.gunther@gmail.com>

import './style.css'

/* Modules */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass.js';

/* Audio */
import launch0AudioUrl from "./audio/launch0.mp3?url";
import launch1AudioUrl from "./audio/launch1.mp3?url";
import launch2AudioUrl from "./audio/launch2.mp3?url";
import launch3AudioUrl from "./audio/launch3.mp3?url";
import launch4AudioUrl from "./audio/launch4.mp3?url";
var launchAudios = [];
launchAudios.push(launch0AudioUrl, launch1AudioUrl, launch2AudioUrl, launch3AudioUrl, launch4AudioUrl);
import explosion0AudioUrl from "./audio/explosion0.mp3?url";
import explosion1AudioUrl from "./audio/explosion1.mp3?url";
import explosion2AudioUrl from "./audio/explosion2.mp3?url";
import explosionCrackleAudioUrl from "./audio/explosionCrackle.mp3?url";
var explosionAudios = [];
explosionAudios.push(explosion0AudioUrl, explosion1AudioUrl, explosion2AudioUrl);

/* Graphics */
import trashIconDarkUrl from './graphics/trashdark.png';

/* Start threejs scene when window loaded */
window.addEventListener("load", init, false);

/* Init */
function init() {

  /* Initialize main scene */
  const body = document.getElementById('body');

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

  scene.background = new THREE.Color(0x000005);

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

  /* Trash all button */
  const trashAllButton = document.getElementById("trash");
  const warningOverlay = document.getElementById("warning");
  const warningText = document.getElementById("warningtext");
  const warningAcceptButton = document.getElementById("warningacceptbutton");
  const warningCancelButton = document.getElementById("warningcancelbutton");

  trashAllButton.onmouseover = function() {
    body.style.setProperty('cursor', 'pointer');
  }
  trashAllButton.onmouseout = function() {
    body.style.setProperty('cursor', 'default');
  }
  trashAllButton.onclick = function() {

    warningOverlay.style.visibility = 'visible';

    warningText.innerHTML = "WARNING: This will delete all fireworks in this show and start from scratch. Continue?";

    warningAcceptButton.onmouseover = function() {
      body.style.setProperty('cursor', 'pointer');
    }
    warningAcceptButton.onmouseout = function() {
      body.style.setProperty('cursor', 'default');
    }
    warningAcceptButton.onclick = function() {
      fireworks.forEach(firework => {
        removeFirework(firework);
      });
      warningOverlay.style.visibility = 'hidden';
      body.style.setProperty('cursor', 'default');
    }

    warningCancelButton.onmouseover = function() {
      body.style.setProperty('cursor', 'pointer');
    }
    warningCancelButton.onmouseout = function() {
      body.style.setProperty('cursor', 'default');
    }
    warningCancelButton.onclick = function() {
      warningOverlay.style.visibility = 'hidden';
      body.style.setProperty('cursor', 'default');
    }

  }

  /* Main menu */
  const mainMenu = document.getElementById("mainmenu");
  const shareShowLink = document.getElementById("sharelink");
  const toggleSiteModeLink = document.getElementById("togglemodelink");
  const documentationLink = document.getElementById("documentationlink");
  const aboutLink = document.getElementById("aboutlink");

  shareShowLink.onmouseover = function() {
    body.style.setProperty('cursor', 'pointer');
  }
  shareShowLink.onmouseout = function() {
    body.style.setProperty('cursor', 'default');
  }
  shareShowLink.onclick = function() {
    
  }

  toggleSiteModeLink.onmouseover = function() {
    body.style.setProperty('cursor', 'pointer');
  }
  toggleSiteModeLink.onmouseout = function() {
    body.style.setProperty('cursor', 'default');
  }
  toggleSiteModeLink.onclick = function() {
    toggleSiteMode();
  }

  var siteMode = 'edit';
  var lastRecordingValue = false;
  function toggleSiteMode() {

    afterimagePass.uniforms['damp'].value = 0.0;

    siteMode = siteMode == 'edit' ? 'playback' : 'edit';
    toggleSiteModeLink.innerHTML = siteMode == 'edit' ? 'PLAYBACK MODE' : 'EDIT MODE';

    if (siteMode == 'edit') {

      recording = lastRecordingValue;
  
      timelinePlaying = false;
      playButtonImg.style.visibility = !timelinePlaying ? 'visible' : 'hidden';
      pauseButtonImg.style.visibility = timelinePlaying ? 'visible' : 'hidden';

      timelinePosition = 0.0;

      updateTimelinePositionMarker();

      updateFireworks();

      editorSettings.style.zIndex = '1';
      nextFirework.style.zIndex = '1';

      trashAllButton.style.zIndex = recording ? '1' : '-1';
      timeline.style.zIndex = recording ? '1' : '-1';
      outliner.style.zIndex = recording ? '1' : '-1';

      requestAnimationFrame(function() { afterimagePass.uniforms['damp'].value = recording? 1.0 : 0.98; });

    }

    else {

      lastRecordingValue = recording;

      recording = true;

      timelinePosition = 0.0;
      timelinePlaying = true;

      if (typeof fireworks !== 'undefined') {
        fireworks.forEach(firework => {
          if (firework.recorded && firework.explodeTime == 0.0) {
            firework.playLaunchOneShot = true;
          }
        });
      }

      editorSettings.style.zIndex = '-1';
      nextFirework.style.zIndex = '-1';

      toggleUI();

      requestAnimationFrame(function() { afterimagePass.uniforms['damp'].value = 0.98; });

    }

  }

  documentationLink.onmouseover = function() {
    body.style.setProperty('cursor', 'pointer');
  }
  documentationLink.onmouseout = function() {
    body.style.setProperty('cursor', 'default');
  }
  documentationLink.onclick = function() {
    
  }

  aboutLink.onmouseover = function() {
    body.style.setProperty('cursor', 'pointer');
  }
  aboutLink.onmouseout = function() {
    body.style.setProperty('cursor', 'default');
  }
  aboutLink.onclick = function() {
    window.open("https://noahgunther.com");
  }

  /* Editor settings */
  const editorSettings = document.getElementById("settings");

  // Recording
  const recordToggle = document.getElementById("recordtoggle");
  recordToggle.checked = recording;

  recordToggle.addEventListener("change", function() {

    recording = recordToggle.checked;
    timelinePosition = recording ? 0 : -100000;

    trashAllButton.style.zIndex = recording ? '1' : '-1';
    timeline.style.zIndex = recording ? '1' : '-1';
    outliner.style.zIndex = recording ? '1' : '-1';

    updateTimelinePositionMarker();

    // Dispose of any current geometry
    fireworks.forEach(firework => {

      if (firework.projectileMesh != null) {
        scene.remove(firework.projectileMesh);
        firework.projectileMesh.geometry.dispose();
        firework.projectileMesh.material.dispose();
      }

      if (firework.pathMesh != null) {
        scene.remove(firework.pathMesh);
        firework.pathMesh.geometry.dispose();
        firework.pathMesh.material.dispose();
      }

      firework.explosionMeshes.forEach(explosionMesh => {
        
        if (explosionMesh != null) { 
          scene.remove(explosionMesh);
          explosionMesh.geometry.dispose();
          explosionMesh.material.dispose();
        }

      });

      firework.explosionPathMeshes.forEach(explosionPathMesh => {
        
        if (explosionPathMesh != null) { 
          scene.remove(explosionPathMesh);
          explosionPathMesh.geometry.dispose();
          explosionPathMesh.material.dispose();
        }

      });
      
    });

    updateFireworks();

    updateOutlinerData();

    timelinePlaying = false;
    playButtonImg.style.visibility = !timelinePlaying ? 'visible' : 'hidden';
    pauseButtonImg.style.visibility = timelinePlaying ? 'visible' : 'hidden';

    timelineReversing = false;
    reverseButtonImg.style.visibility = !timelineReversing ? 'visible' : 'hidden';
    reversePauseButtonImg.style.visibility = timelineReversing ? 'visible' : 'hidden';

    afterimagePass.uniforms['damp'].value = 0.0;

    requestAnimationFrame(function() { afterimagePass.uniforms['damp'].value = recording ? 1.0 : 0.98; });

  });

  /* Next firework */
  const nextFirework = document.getElementById("nextfirework");

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

    scalePickerDisplayValue.innerHTML = scale.toFixed(2);

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
  explosionTypeNames.push("burst", "drift", "pop", "flash", "zap", "flower", "flower2");

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
      if (scaleValue < scaleValueMin) scaleValue = scaleValueMin;
      scalePickerDisplayValue.innerHTML = scaleValue.toFixed(2);
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
      if (scaleValue > scaleValueMax) scaleValue = scaleValueMax;
      scalePickerDisplayValue.innerHTML = scaleValue.toFixed(2);
    }
  }

  // Audio
  const launchAudioToggle = document.getElementById("launchaudiotoggle");
  const explosionAudioToggle = document.getElementById("explosionaudiotoggle");
  var launchAudioBool = true;
  var explosionAudioBool = true;
  launchAudioToggle.checked = true;
  explosionAudioToggle.checked = true;

  launchAudioToggle.addEventListener("change", function() {
    launchAudioBool = launchAudioToggle.checked;
  });
  explosionAudioToggle.addEventListener("change", function() {
    explosionAudioBool = explosionAudioToggle.checked;
  });

  /* Outliner */
  const outliner = document.getElementById("outliner");
  const fireworkDataWrapper = document.getElementById("fireworkdatawrapper");

  function updateOutlinerData() {

    clearOutlinerData();

    fireworks.forEach(firework => {
      
      if (firework.recorded && firework.explodeTime == timelinePosition) {

        const fireworkData = document.createElement('fireworkdata');
        fireworkData.id = firework.id;
        fireworkData.className = 'fireworkdata';
        
        // Firework explosion type
        const fireworkDataTypeLabel = document.createElement('fireworkdatatypelabel');
        fireworkDataTypeLabel.className = 'fireworkdatatypelabel';
        fireworkDataTypeLabel.innerHTML = "Type: ";
        fireworkData.appendChild(fireworkDataTypeLabel);

        const fireworkDataTypeInput = document.createElement('fireworkdatatypeinput');
        fireworkDataTypeInput.innerHTML = '<select class="fireworkdatatypeinput"> <option value="burst">Burst</option> <option value="drift">Drift</option> <option value="pop">Pop</option> <option value="flash">Flash</option> <option value="zap">Zap</option> <option value="flower">Flower</option> <option value="flower2">Flower 2</option> </select>';
        fireworkData.appendChild(fireworkDataTypeInput);

        const typeInput = fireworkDataTypeInput.children[0];
        typeInput.value = firework.explosionType;

        // Update explosion type if input changes
        typeInput.addEventListener("input", (event) => {

          firework.explosionType = typeInput.value;

          updateFireworkParameters(firework);

        });

        // Firework colors
        const fireworkDataColorsLabel = document.createElement('fireworkdatacolorslabel');
        fireworkDataColorsLabel.className = 'fireworkdatacolorslabel';
        fireworkDataColorsLabel.innerHTML = "Colors: ";
        fireworkData.appendChild(fireworkDataColorsLabel);

        const fireworkDataColor0Input = document.createElement('fireworkdatacolor0input');
        fireworkDataColor0Input.innerHTML = '<input class="fireworkdatacolorpicker" type="color" style="left: 50%">';
        fireworkData.appendChild(fireworkDataColor0Input);

        const fireworkDataColor1Input = document.createElement('fireworkdatacolor1input');
        fireworkDataColor1Input.innerHTML = '<input class="fireworkdatacolorpicker" type="color" style="left: 60%">';
        fireworkData.appendChild(fireworkDataColor1Input);

        const fireworkDataColor2Input = document.createElement('fireworkdatacolor2input');
        fireworkDataColor2Input.innerHTML = '<input class="fireworkdatacolorpicker" type="color" style="left: 70%">';
        fireworkData.appendChild(fireworkDataColor2Input);

        const color0Input = fireworkDataColor0Input.children[0];
        color0Input.value = rgbToHex(Math.floor(firework.color0.r * 255), Math.floor(firework.color0.g * 255), Math.floor(firework.color0.b * 255));

        const color1Input = fireworkDataColor1Input.children[0];
        color1Input.value = rgbToHex(Math.floor(firework.color1.r * 255), Math.floor(firework.color1.g * 255), Math.floor(firework.color1.b * 255));

        const color2Input = fireworkDataColor2Input.children[0];
        color2Input.value = rgbToHex(Math.floor(firework.color2.r * 255), Math.floor(firework.color2.g * 255), Math.floor(firework.color2.b * 255));

        // Update colors if inputs change
        color0Input.addEventListener("input", (event) => {

          // Reset afterimage pass
          const lastAfterImageDampValue = afterimagePass.uniforms['damp'].value;
          afterimagePass.uniforms['damp'].value = 0.0;

          const newColor0 = hexToRgb(color0Input.value);

          firework.color0 = new THREE.Color(newColor0.r, newColor0.g, newColor0.b);

          if (firework.pathMesh.material != null) {
            firework.pathMesh.material.color = firework.color0;
          }
          if (firework.projectileMesh.material != null) {
            firework.projectileMesh.material.color = firework.color0;
          }

          firework.marker.style.setProperty('background-color', rgbToHex(Math.floor(firework.color0.r * 255), Math.floor(firework.color0.g * 255), Math.floor(firework.color0.b * 255)));

          requestAnimationFrame(function() { afterimagePass.uniforms['damp'].value = lastAfterImageDampValue; });

        });

        color1Input.addEventListener("input", (event) => {

          // Reset afterimage pass
          const lastAfterImageDampValue = afterimagePass.uniforms['damp'].value;
          afterimagePass.uniforms['damp'].value = 0.0;

          const newColor1 = hexToRgb(color1Input.value);

          firework.color1 = new THREE.Color(newColor1.r, newColor1.g, newColor1.b);

          firework.explosionMeshes.forEach(explosionMesh => {
            if (explosionMesh != null) {
              explosionMesh.material.color = firework.color1;
            }
          });
          firework.explosionPathMeshes.forEach(explosionPathMesh => {
            if (explosionPathMesh != null) {
              explosionPathMesh.material.color = firework.color1;
            }
          });

          requestAnimationFrame(function() { afterimagePass.uniforms['damp'].value = lastAfterImageDampValue; });

        });

        color2Input.addEventListener("input", (event) => {

          // Reset afterimage pass
          const lastAfterImageDampValue = afterimagePass.uniforms['damp'].value;
          afterimagePass.uniforms['damp'].value = 0.0;

          const newColor2 = hexToRgb(color2Input.value);

          firework.color2 = new THREE.Color(newColor2.r, newColor2.g, newColor2.b);

          requestAnimationFrame(function() { afterimagePass.uniforms['damp'].value = lastAfterImageDampValue; });

        });

        // Firework scale
        const fireworkDataScaleLabel = document.createElement('fireworkdatascalelabel');
        fireworkDataScaleLabel.className = 'fireworkdatascalelabel';
        fireworkDataScaleLabel.innerHTML = "Scale: ";
        fireworkData.appendChild(fireworkDataScaleLabel);

        const fireworkDataScaleMinus = document.createElement('fireworkdatascaleminus');
        fireworkDataScaleMinus.className = 'fireworkdatascale';
        fireworkDataScaleMinus.id = 'fireworkdatascaleminus';
        fireworkDataScaleMinus.innerHTML = '-';
        fireworkData.appendChild(fireworkDataScaleMinus);

        const fireworkDataScaleValue = document.createElement('fireworkdatascalevalue');
        fireworkDataScaleValue.className = 'fireworkdatascale';
        fireworkDataScaleValue.id = 'fireworkdatascalevalue';
        fireworkDataScaleValue.innerHTML = firework.explosionScale.toFixed(2);
        fireworkData.appendChild(fireworkDataScaleValue);

        const fireworkDataScalePlus = document.createElement('fireworkdatascaleplus');
        fireworkDataScalePlus.className = 'fireworkdatascale';
        fireworkDataScalePlus.id = 'fireworkdatascaleplus';
        fireworkDataScalePlus.innerHTML = '+';
        fireworkData.appendChild(fireworkDataScalePlus);

        fireworkDataScaleMinus.onmouseover = function() {
          body.style.setProperty('cursor', 'pointer');
        }
        fireworkDataScaleMinus.onmouseout = function() {
          body.style.setProperty('cursor', 'default');
        }
        fireworkDataScaleMinus.onclick = function() {
          if (firework.explosionScale > scaleValueMin) {
            firework.explosionScale -= 0.25;
            if (firework.explosionScale < scaleValueMin) firework.explosionScale = scaleValueMin;
            fireworkDataScaleValue.innerHTML = firework.explosionScale.toFixed(2);
            updateFireworkParameters(firework);
          }
        }

        fireworkDataScalePlus.onmouseover = function() {
          body.style.setProperty('cursor', 'pointer');
        }
        fireworkDataScalePlus.onmouseout = function() {
          body.style.setProperty('cursor', 'default');
        }
        fireworkDataScalePlus.onclick = function() {
          if (firework.explosionScale < scaleValueMax) {
            firework.explosionScale += 0.25;
            if (firework.explosionScale > scaleValueMax) firework.explosionScale = scaleValueMax;
            fireworkDataScaleValue.innerHTML = firework.explosionScale.toFixed(2);
            updateFireworkParameters(firework);
          }
        }

        // Firework position
        const fireworkDataPositionLabel = document.createElement('fireworkdatapositionlabel');
        fireworkDataPositionLabel.className = 'fireworkdatapositionlabel';
        fireworkDataPositionLabel.innerHTML = "Position: ";
        fireworkData.appendChild(fireworkDataPositionLabel);

        const fireworkDataPosition = document.createElement('fireworkdataposition');
        fireworkDataPosition.className = 'fireworkdataposition';
        fireworkDataPosition.innerHTML = "X: " + firework.position.x + ", Y: " + firework.position.y;
        fireworkData.appendChild(fireworkDataPosition);

        // Remove firework
        const removeFireworkButton = document.createElement('removefireworkbutton');
        removeFireworkButton.className = 'removefireworkbutton';
        removeFireworkButton.innerHTML = '<img src="' + trashIconDarkUrl + '">';
        fireworkData.appendChild(removeFireworkButton);
        
        removeFireworkButton.onmouseover = function() {
          body.style.setProperty('cursor', 'pointer');
        }
        removeFireworkButton.onmouseout = function() {
          body.style.setProperty('cursor', 'default');
        }
        removeFireworkButton.onclick = function() {
          removeFirework(firework);
        }

        // Append firework data to parent
        fireworkDataWrapper.appendChild(fireworkData);

      }

    });

  }

  function clearOutlinerData() {

    fireworkDataWrapper.innerHTML = '';

  }

  /* Timeline */
  var timelinePosition = -100000;
  var timelineLength = 10000;
  var recording = false;
  var timelinePlaying = false;
  var skipForward = false;
  var skipBack = false;
  var skipToEnd = false;
  var skipToStart = false;
  var lastAfterImageDampValue = afterimagePass.uniforms['damp'].value;
  var timelineReversing = false;
  var loopForever = true;

  // Timeline and related UI
  const timeline = document.getElementById("timeline");
  const timelineLine = document.getElementById("timelinelinewrapper");
  const timelinePositionMarker = document.getElementById("timelineposition");
  const timelineLengthDecreaseButton = document.getElementById("timelinelengthdecrease");
  const timelineLengthIncreaseButton = document.getElementById("timelinelengthincrease");
  const timelineLengthDisplayValue = document.getElementById("timelinelengthvalue");
  const playPauseButton = document.getElementById("playpausebutton");
  const playButtonImg = document.getElementById("playbutton");
  const pauseButtonImg = document.getElementById("pausebutton");
  const skipForwardButton = document.getElementById("skipforwardbutton");
  const skipBackButton = document.getElementById("skipbackbutton");
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
  updateTimelinePositionMarker();
  trashAllButton.style.zIndex = recording ? '1' : '-1';
  timeline.style.zIndex = recording ? '1' : '-1';
  outliner.style.zIndex = recording ? '1' : '-1';

  timelineLine.onmouseover = function() {
    body.style.setProperty('cursor', 'pointer');
  }
  timelineLine.onmouseout = function() {
    body.style.setProperty('cursor', 'default');
  }
  var timelinePositionMarkerHeld = false;
  timelineLine.onmousedown = function() {
    lastAfterImageDampValue = afterimagePass.uniforms['damp'].value;
    afterimagePass.uniforms['damp'].value = 0.0;
    timelinePositionMarkerHeld = true;
  }
  window.onmouseup = function() {
    if (timelinePositionMarkerHeld) { 
      afterimagePass.uniforms['damp'].value = lastAfterImageDampValue;
      timelinePositionMarkerHeld = false; 
    }
  }

  function updateTimelineLength() {

    let timelineDisplayMinutes = Math.floor(timelineLength * 0.001 / 60);
    let timelineDisplaySeconds = timelineLength * 0.001 % 60;
    if (timelineDisplaySeconds < 10) timelineDisplaySeconds = "0" + timelineDisplaySeconds;
    timelineLengthDisplayValue.innerHTML = "0" + timelineDisplayMinutes + ":" + timelineDisplaySeconds;

    if (timelinePosition > timelineLength) timelinePosition = timelineLength;

    fireworks.forEach(firework => {
      if (firework.recorded) {
        if (firework.explodeTime <= timelineLength) {
          firework.marker.style.visibility = "visible";
          firework.marker.style.setProperty('left', (firework.explodeTime / timelineLength) * 100.0 + '%');
        }
        else {
          const lastAfterImageDampValue = afterimagePass.uniforms['damp'].value;
          afterimagePass.uniforms['damp'].value = 0.0;
          if (!timelinePlaying) updateFireworks();
          firework.marker.style.visibility = "hidden";
          requestAnimationFrame(function() { afterimagePass.uniforms['damp'].value = lastAfterImageDampValue; });
        }
      }
    });

    updateTimelinePositionMarker();

    if (!timelinePlaying) updateOutlinerData();

  }

  timelineLengthDecreaseButton.onmouseover = function() {
    body.style.setProperty('cursor', 'pointer');
  }
  timelineLengthDecreaseButton.onmouseout = function() {
    body.style.setProperty('cursor', 'default');
  }
  timelineLengthDecreaseButton.onclick = function() {
    if (timelineLength > 10000) {
      timelineLength -= 5000;
      updateTimelineLength();
    }
  }

  timelineLengthIncreaseButton.onmouseover = function() {
    body.style.setProperty('cursor', 'pointer');
  }
  timelineLengthIncreaseButton.onmouseout = function() {
    body.style.setProperty('cursor', 'default');
  }
  timelineLengthIncreaseButton.onclick = function() {
    if (timelineLength < 60000) {
      timelineLength += 5000;
      updateTimelineLength();
    }
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

  skipForwardButton.onmouseover = function() {
    body.style.setProperty('cursor', 'pointer');
  }
  skipForwardButton.onmouseout = function() {
    body.style.setProperty('cursor', 'default');
  }
  skipForwardButton.onclick = function() {
    
    skipForward = true;

    lastAfterImageDampValue = afterimagePass.uniforms['damp'].value;

  }

  skipBackButton.onmouseover = function() {
    body.style.setProperty('cursor', 'pointer');
  }
  skipBackButton.onmouseout = function() {
    body.style.setProperty('cursor', 'default');
  }
  skipBackButton.onclick = function() {
    
    skipBack = true;

    lastAfterImageDampValue = afterimagePass.uniforms['damp'].value;

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

  /* Toggle UI */
  const toggleUiButton = document.getElementById("toggleuibutton");
  const toggleUiButtonTop = document.getElementById("toggleuibuttontop");
  const toggleUiButtonMiddle = document.getElementById("toggleuibuttonmiddle");
  const toggleUiButtonBottom = document.getElementById("toggleuibuttonbottom");

  var uiHidden = false;
  toggleUiButton.onmouseover = function() {
    body.style.setProperty('cursor', 'pointer');
  }
  toggleUiButton.onmouseout = function() {
    body.style.setProperty('cursor', 'default');
  }
  toggleUiButton.onclick = toggleUI;
  
  function toggleUI() {

    if (uiHidden) {

      toggleUiButtonTop.style.animation = 'toggleUiButtonTopOut 0.2s forwards';
      toggleUiButtonMiddle.style.animation = 'toggleUiButtonMiddleOut 0.2s forwards';
      toggleUiButtonBottom.style.animation = 'toggleUiButtonBottomOut 0.2s forwards';

      mainMenu.style.visibility = 'hidden';
      editorSettings.style.visibility = 'hidden';
      nextFirework.style.visibility = 'hidden';

      trashAllButton.style.zIndex = '-1';
      timeline.style.zIndex = '-1';
      outliner.style.zIndex = '-1';

      uiHidden = false;

    }

    else {

      toggleUiButtonTop.style.animation = 'toggleUiButtonTopIn 0.2s forwards';
      toggleUiButtonMiddle.style.animation = 'toggleUiButtonMiddleIn 0.2s forwards';
      toggleUiButtonBottom.style.animation = 'toggleUiButtonBottomIn 0.2s forwards';

      mainMenu.style.visibility = 'visible';
      editorSettings.style.visibility = 'visible';
      nextFirework.style.visibility = 'visible';

      if (siteMode == 'edit') {
        trashAllButton.style.zIndex = recording ? '1' : '-1';
        timeline.style.zIndex = recording ? '1' : '-1';
        outliner.style.zIndex = recording ? '1' : '-1';
      }

      uiHidden = true;

    }

  }
  toggleUI();

  /* Check for url fireworks */
  var urlToken = false;

  if (urlToken) toggleSiteMode();

  /* Firework class */
  class Firework {
    constructor(
      id,
      active,
      recorded,
      playLaunchOneShot,
      launchCompleted,
      launchAudioToggle,
      launchAudioPlayed,
      launchAudio,
      explosionAudioToggle,
      explosionAudioPlayed,
      explosionAudio,
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
      position,
      marker
    ) {
      this.id = id;
      this.active = active;
      this.recorded = recorded;
      this.playLaunchOneShot = playLaunchOneShot;
      this.launchCompleted = launchCompleted;
      this.launchAudioToggle = launchAudioToggle;
      this.launchAudioPlayed = launchAudioPlayed;
      this.launchAudio = launchAudio;
      this.explosionAudioToggle = explosionAudioToggle;
      this.explosionAudioPlayed = explosionAudioPlayed;
      this.explosionAudio = explosionAudio;
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
      this.marker = marker;
    }
  }

  /* 3D geometry creation functions */
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

  /* Firework creation and modification */
  var mouseDown = false;
  var currentProjectile;
  var fireworks = [];

  canvas.onmousedown = function() {

    if (siteMode == 'edit') {

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

  }

  canvas.onmouseup = function() {

    if (mouseDown && siteMode == 'edit') {
      
      mouseDown = false;

      const terminalPointX = (Math.round((mousePagePosition.x / 2 + 0.5) * 1000) * 0.1).toFixed(1);
      const terminalPointY = (Math.round((mousePagePosition.y / 2 + 0.5) * 1000) * 0.1).toFixed(1);
      const terminalPoint = new THREE.Vector3(intersectionPoint.x, intersectionPoint.y, intersectionPoint.z);

      createFirework(
        fireworks.length, 
        recording,
        false,
        launchAudioBool,
        false,
        explosionAudioBool,
        false,
        false,
        false,
        false,
        terminalPoint,
        currentProjectile,
        null,
        explosionType,
        color0,
        color1,
        color2,
        scaleValue,
        new THREE.Vector2(terminalPointX, terminalPointY)
      );

    }

  }

  function createFirework(
    id,
    recorded, 
    launchCompleted, 
    launchAudioBool, 
    launchAudioPlayed, 
    explosionAudioBool, 
    explosionAudioPlayed,
    explosionPlayed,
    projectileDisposed,
    explosionDisposed,
    terminalPoint,
    projectileMesh,
    pathMesh,
    type,
    color0, 
    color1, 
    color2,
    scale,
    screenSpaceTerminalPoint
  ) {

    const launchDuration = 1000;
    let explodeDuration = 420;
    if (type == "pop") explodeDuration = 300;
    else if (type == "flash") explodeDuration = 200;

    let explosionMeshes = [];
    let explosionPathMeshes = [];
    let explosionTerminalPoints = [];
    function createExplosion(t, p, color) {

      const shrapnelCount = t == "flash" ? 1 : 20 + Math.floor(Math.random() * 10);
      const radiusRandom = Math.max(Math.random() * 0.25, 0.15) * scale;

      for (let j = 0; j < shrapnelCount; j++) {

        explosionMeshes.push(createExplosionComponent(t));

        explosionPathMeshes.push(null);

        if (t == "burst" || t == "pop") {
          const phi = Math.acos(1.0 - 2.0*j/shrapnelCount);
          const theta = 6.28 * j/1.618;
          explosionTerminalPoints.push(new THREE.Vector3(
            (Math.cos(theta)*Math.sin(phi) + (Math.random() * 0.2 - 0.1)) * radiusRandom,
            (Math.sin(theta)*Math.sin(phi) + (Math.random() * 0.2 - 0.1)) * radiusRandom, 
            (Math.sin(theta)*Math.cos(phi) + (Math.random() * 0.2 - 0.1)) * radiusRandom
          ));
        }
        else if (t == "drift" || t == "zap") {
          explosionTerminalPoints.push(new THREE.Vector3(
            (Math.random() * 2 - 1) * radiusRandom,
            (Math.random() * 2 - 1) * radiusRandom, 
            (Math.random() * 2 - 1) * radiusRandom
          ));
        }
        else if (t == "flash") {
          explosionTerminalPoints.push(new THREE.Vector3(0.0, 0.0, 0.0));
        }
        else if (t == "flower" || t == "flower2") {
          explosionTerminalPoints.push(new THREE.Vector3(
            (Math.sin(j) + (Math.random() * 0.2 - 0.1)) * radiusRandom * 0.33,
            (Math.cos(j) + (Math.random() * 0.2 - 0.1)) * radiusRandom * 0.33, 
            (Math.cos(j) + (Math.random() * 0.2 - 0.1)) * radiusRandom * 0.33
          ));
        }

      }

      function createExplosionComponent(t) {

        const segmentCount = t == "pop" || t == "flash" ? 32 : 3;
        const shrapnelGeometry = new THREE.SphereGeometry(0.0025, segmentCount, segmentCount);
        const shrapnelMaterial = new THREE.MeshBasicMaterial({ color: color });
        const shrapnel = new THREE.Mesh(shrapnelGeometry, shrapnelMaterial);
        scene.add(shrapnel);
        shrapnel.position.set(p.x, p.y, p.z);

        return shrapnel;

      }

    }

    createExplosion(type, terminalPoint, color1);

    // Create timeline marker
    let marker = null;
    if (recording) {

      marker = document.createElement('marker');
      marker.className = 'timelinemarker';
      marker.style.setProperty('left', (timelinePosition / timelineLength) * 100.0 + '%');
      marker.style.setProperty('background-color', rgbToHex(Math.floor(color0.r * 255), Math.floor(color0.g * 255), Math.floor(color0.b * 255)));
      
      timelineLine.appendChild(marker);

    }

    const randomLaunchAudioUrl = launchAudios[Math.floor(Math.random() * launchAudios.length)];
    const randomExplosionAudioUrl = type != "pop" ? explosionAudios[Math.floor(Math.random() * explosionAudios.length)] : explosionCrackleAudioUrl;

    fireworks[id] =
      new Firework(
        id,
        true,
        recorded,
        recorded,
        launchCompleted,
        launchAudioBool,
        launchAudioPlayed,
        new Audio(randomLaunchAudioUrl),
        explosionAudioBool,
        explosionAudioPlayed,
        new Audio(randomExplosionAudioUrl),
        explosionPlayed,
        projectileDisposed,
        explosionDisposed,
        launchDuration,
        recorded ? timelinePosition - launchDuration : Date.now(),
        setLaunchPosition(),
        terminalPoint,
        explodeDuration,
        recorded ? timelinePosition : Date.now() + launchDuration,
        explosionTerminalPoints,
        projectileMesh,
        pathMesh,
        explosionMeshes,
        explosionPathMeshes,
        type,
        color0,
        color1,
        color2,
        scale,
        screenSpaceTerminalPoint,
        marker
      );

    if (!timelinePlaying && recording) {
      
      updateFireworks();

      updateOutlinerData();

    }

  }

  function updateFireworkParameters(firework) {

    // Reset afterimage pass
    const lastAfterImageDampValue = afterimagePass.uniforms['damp'].value;
    afterimagePass.uniforms['damp'].value = 0.0;

    // Dispose of any current geometry
    if (firework.pathMesh != null) {
      scene.remove(firework.pathMesh);
      firework.pathMesh.geometry.dispose();
      firework.pathMesh.material.dispose();
    }

    firework.explosionMeshes.forEach(explosionMesh => {
      
      if (explosionMesh != null) { 
        scene.remove(explosionMesh);
        explosionMesh.geometry.dispose();
        explosionMesh.material.dispose();
      }

    });

    firework.explosionPathMeshes.forEach(explosionPathMesh => {
      
      if (explosionPathMesh != null) { 
        scene.remove(explosionPathMesh);
        explosionPathMesh.geometry.dispose();
        explosionPathMesh.material.dispose();
      }

    });

    // Overwrite firework with updated
    createFirework(
      firework.id,
      true,
      firework.launchCompleted,
      firework.launchAudioToggle,
      firework.launchAudioPlayed,
      firework.explosionAudioToggle,
      firework.explosionAudioPlayed,
      firework.explosionPlayed,
      firework.projectileDisposed,
      firework.explosionDisposed,
      firework.terminalPoint,
      firework.projectileMesh,
      firework.pathMesh,
      firework.explosionType,
      firework.color0,
      firework.color1,
      firework.color2,
      firework.explosionScale,
      firework.position
    );

    requestAnimationFrame(function() { afterimagePass.uniforms['damp'].value = lastAfterImageDampValue; });

  }

  function removeFirework(firework) {

    // Reset afterimage pass
    const lastAfterImageDampValue = afterimagePass.uniforms['damp'].value;
    afterimagePass.uniforms['damp'].value = 0.0;

    // Dispose of any current geometry
    if (firework.projectileMesh != null) {
      scene.remove(firework.projectileMesh);
      firework.projectileMesh.geometry.dispose();
      firework.projectileMesh.material.dispose();
    }

    if (firework.pathMesh != null) {
      scene.remove(firework.pathMesh);
      firework.pathMesh.geometry.dispose();
      firework.pathMesh.material.dispose();
    }

    firework.explosionMeshes.forEach(explosionMesh => {
      
      if (explosionMesh != null) { 
        scene.remove(explosionMesh);
        explosionMesh.geometry.dispose();
        explosionMesh.material.dispose();
      }

    });

    firework.explosionPathMeshes.forEach(explosionPathMesh => {
      
      if (explosionPathMesh != null) { 
        scene.remove(explosionPathMesh);
        explosionPathMesh.geometry.dispose();
        explosionPathMesh.material.dispose();
      }

    });

    firework.active = false;
    firework.recorded = false;

    firework.explodeTime = -9999;
    if (firework.marker != null) firework.marker.style.visibility = 'hidden';

    updateOutlinerData();

    requestAnimationFrame(function() { 
      
      afterimagePass.uniforms['damp'].value = lastAfterImageDampValue;

      firework = null;

      fireworks.forEach(firework => {
        if (firework.explodeTime == timelinePosition) {
          firework.playLaunchOneShot = true;
        }
      });

      updateFireworks();
    
    });

  }

  /* Firework position and animation */
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

      if (k < 0.0 && timelinePosition >= 0.0) { 

        fireworks[index].launchAudioPlayed = false;

      }

      if (k < 1.0 && k >= 0.0 && fireworks[index].recorded == recording) {

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

        if (fireworks[index].launchAudioToggle && !fireworks[index].launchAudioPlayed && (timelinePlaying || !fireworks[index].recorded)) {
          fireworks[index].launchAudioPlayed = true;
          fireworks[index].launchAudio.volume = Math.min(0.35 * Math.max(Math.random(), 0.5), 1.0);
          fireworks[index].launchAudio.play();
        }

        fireworks[index].launchCompleted = false;
        fireworks[index].projectileDisposed = false;

      }

      else if (
      ((!fireworks[index].launchCompleted || fireworks[index].playLaunchOneShot) && k > 0.0 && k < 1.2 && !skipToEnd) 
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

    if (k <= 0.0) {

      fireworks[index].explosionAudioPlayed = false;

    }

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

        if (fireworks[index].explosionAudioToggle && !fireworks[index].explosionAudioPlayed && (timelinePlaying || !fireworks[index].recorded)) {
          fireworks[index].explosionAudioPlayed = true;
          fireworks[index].explosionAudio.volume = Math.min(fireworks[index].explosionScale * 0.5 * Math.max(Math.random(), 0.5), 1.0);
          fireworks[index].explosionAudio.play();
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
  var lastTimelinePosition;

  function updateFireworks() {
    for (let i = 0; i < fireworks.length; i++) {
      if (fireworks[i].recorded == recording) {
        animateFirework(i);
      }
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

        let nearestFireworkTime = timelinePosition + (timelineLength / 100);
        let nearestFireworkFound = false;
        for (let i = 0; i < fireworks.length; i++) {

          if (Math.abs(fireworks[i].explodeTime - timelinePosition) < (timelineLength / 100)
          && Math.abs(fireworks[i].explodeTime - timelinePosition) < nearestFireworkTime
          && fireworks[i].recorded
          && fireworks[i].active) {

            nearestFireworkFound = true;

            nearestFireworkTime = fireworks[i].explodeTime;

          }

        }

        if (nearestFireworkFound) timelinePosition = nearestFireworkTime;

        fireworks.forEach(firework => {
          if (firework.launchTime + firework.launchDuration == timelinePosition) {
            firework.launchCompleted = false;
          }
        });

        if (timelinePosition != lastTimelinePosition) {
        
          updateTimelinePositionMarker();

          updateFireworks();

          updateOutlinerData();

        }

      }

      else if (skipForward) {

        let soonestFireworkTime = timelineLength + 1.0;
        for (let i = 0; i < fireworks.length; i++) {

          if (fireworks[i].explodeTime > timelinePosition
          && fireworks[i].explodeTime < soonestFireworkTime
          && fireworks[i].recorded
          && fireworks[i].active) {

            soonestFireworkTime = fireworks[i].explodeTime;

          }

        }

        if (soonestFireworkTime <= timelineLength) {

          afterimagePass.uniforms['damp'].value = 0.0;

          timelinePosition = soonestFireworkTime;

          fireworks.forEach(firework => {
            if (firework.launchTime + firework.launchDuration == timelinePosition) {
              firework.launchCompleted = false;
            }
          });

          updateTimelinePositionMarker();

          updateFireworks();

          updateOutlinerData();

          requestAnimationFrame(function() { afterimagePass.uniforms['damp'].value = lastAfterImageDampValue; });
        
        }

        skipForward = false;

      }

      else if (skipBack) {

        let previousFireworkTime = -1.0;
        for (let i = 0; i < fireworks.length; i++) {

          if (fireworks[i].explodeTime < timelinePosition
          && fireworks[i].explodeTime > previousFireworkTime
          && fireworks[i].recorded
          && fireworks[i].active) {

            previousFireworkTime = fireworks[i].explodeTime;

          }

        }

        if (previousFireworkTime <= timelineLength) {

          afterimagePass.uniforms['damp'].value = 0.0;

          timelinePosition = previousFireworkTime;

          fireworks.forEach(firework => {
            if (firework.launchTime + firework.launchDuration == timelinePosition) {
              firework.launchCompleted = false;
            }
          });

          updateTimelinePositionMarker();

          updateFireworks();

          updateOutlinerData();

          requestAnimationFrame(function() { afterimagePass.uniforms['damp'].value = lastAfterImageDampValue; });
        
        }

        skipBack = false;

      }

      else if (skipToEnd) {

        afterimagePass.uniforms['damp'].value = 0.0;

        timelinePosition = timelineLength;

        updateTimelinePositionMarker();

        updateFireworks();

        updateOutlinerData();

        skipToEnd = false;

        requestAnimationFrame(function() { afterimagePass.uniforms['damp'].value = lastAfterImageDampValue; });

      }

      else if (skipToStart) {

        afterimagePass.uniforms['damp'].value = 0.0;

        timelinePosition = 0.0;

        updateTimelinePositionMarker();

        updateFireworks();

        updateOutlinerData();

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

        clearOutlinerData();

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

        clearOutlinerData();

      }

      lastTimelinePosition = timelinePosition;

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
