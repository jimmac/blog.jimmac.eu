// SPDX-License-Identifier: CC0-1.0
// To the extent possible under law, the author has waived all copyright
// and related or neighboring rights to this work.
// https://creativecommons.org/publicdomain/zero/1.0/
//
// DualSense Viewer v3.0 — "console cowboy"
// Displays the original Playstation 5 Dualsense mesh (see
// dualsense.LICENSE.txt alongside this script for the CC-BY-4.0
// credit) as a page ornament. The canvas bleeds over the surrounding
// text and alpha-composites onto the page; grabbing the controller
// itself (raycast hit test) lets you tumble it around. A connected
// gamepad makes it lean and its light bar glow.

(function () {
  'use strict';

  var instances = [];

  window.ControllerView = function (cfg) {
    var container = document.getElementById(cfg.container);
    if (!container) return null;

    if (!window.THREE || !THREE.GLTFLoader) {
      container.classList.add('controller-fallback');
      container.textContent = 'three.js failed to load — controller view disabled';
      return null;
    }

    var modelUrl = cfg.model || 'dualsense.glb';
    var modelWidth = cfg.width || 13;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* renderer */

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true, alpha: true, preserveDrawingBuffer: true
      });
    } catch (e) {
      container.classList.add('controller-fallback');
      container.textContent = 'WebGL unavailable — controller view disabled';
      return null;
    }
    if (THREE.ColorManagement) THREE.ColorManagement.legacyMode = false;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    var canvas = renderer.domElement;

    /* scene graph: lean (gamepad) > tumble (drag) > model */

    var scene = new THREE.Scene();
    var leanGroup = new THREE.Group();
    var tumbleGroup = new THREE.Group();
    leanGroup.add(tumbleGroup);
    scene.add(leanGroup);
    // default pose: 30° of local yaw plus a 20° pitch tipping the top
    // face towards the camera ("−20 in X" in Blender convention)
    tumbleGroup.quaternion.setFromEuler(new THREE.Euler(
      THREE.MathUtils.degToRad(20), THREE.MathUtils.degToRad(30), 0));

    var camera = new THREE.PerspectiveCamera(38, 16 / 10, 0.1, 100);

    /* lights — tuned per colour scheme so the model reads well on both
       the light page and the dark page; swaps live when the theme does */

    var darkQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    var isDark = false;

    var hemi = new THREE.HemisphereLight(0xdfe8ff, 0x14141a, 0.85);
    scene.add(hemi);

    var key = new THREE.DirectionalLight(0xfff2e0, 1.15);
    key.position.set(6, 11, 7);
    scene.add(key);

    var rim = new THREE.DirectionalLight(0x9db8ff, 0.5);
    rim.position.set(-9, 5, -11);
    scene.add(rim);

    var fill = new THREE.DirectionalLight(0xffffff, 0.28);
    fill.position.set(0, 4, 14);
    scene.add(fill);

    function applyTheme() {
      isDark = !!(darkQuery && darkQuery.matches);
      if (isDark) {
        // dark page: warm amber key with a cool blue rim — the rim
        // separates the model from the dark background
        hemi.color.set(0xf6d4b8); hemi.groundColor.set(0x0a0806);
        hemi.intensity = 0.55;
        key.color.set(0xf0a868); key.intensity = 1.5;
        rim.color.set(0x8cadff); rim.intensity = 1.35;
        fill.color.set(0xf7ddc4); fill.intensity = 0.15;
        renderer.toneMappingExposure = 1.0;
      } else {
        // light page: cool blue accents
        hemi.color.set(0xdfe8ff); hemi.groundColor.set(0x14141a);
        hemi.intensity = 0.85;
        key.color.set(0xfff2e0); key.intensity = 1.15;
        rim.color.set(0x9db8ff); rim.intensity = 0.5;
        fill.color.set(0xffffff); fill.intensity = 0.28;
        renderer.toneMappingExposure = 1.05;
      }
    }

    applyTheme();
    if (darkQuery && darkQuery.addEventListener) {
      darkQuery.addEventListener('change', applyTheme);
    }

    /* gamepad + idle state */

    var targets = { leanX: 0, leanZ: 0, nod: 0 };
    var cur = { leanX: 0, leanZ: 0, nod: 0 };
    var hasPad = false;
    var activity = 0;
    var tTotal = 0;

    function readPad() {
      var pads = navigator.getGamepads ? navigator.getGamepads() : [];
      for (var i = 0; i < pads.length; i++) {
        if (pads[i] && pads[i].connected) return pads[i];
      }
      return null;
    }

    function pollGamepad() {
      var pad = readPad();
      if (!pad) return false;

      var a = pad.axes, b = pad.buttons;
      function btn(i) { return b[i] && b[i].value > 0 ? b[i].value : 0; }

      var lx = a[0] || 0, ly = a[1] || 0, rx = a[2] || 0, ry = a[3] || 0;
      targets.leanX = ly * 0.22 + (rx * 0.06);
      targets.leanZ = -lx * 0.14;
      targets.nod = (btn(6) + btn(7)) * 0.06;

      activity = Math.max(activity, Math.abs(lx), Math.abs(ly),
        Math.abs(rx), Math.abs(ry), btn(6), btn(7));
      for (var i = 0; i < b.length; i++) activity = Math.max(activity, btn(i));
      return true;
    }

    function demo(t) {
      var amp = reduced ? 0 : 1;
      targets.leanX = Math.sin(t * 0.9) * 0.05 * amp;
      targets.leanZ = Math.sin(t * 0.7) * 0.04 * amp;
      targets.nod = 0;
    }

    function apply(dt) {
      var k = 1 - Math.exp(-8 * dt);
      cur.leanX += (targets.leanX - cur.leanX) * k;
      cur.leanZ += (targets.leanZ - cur.leanZ) * k;
      cur.nod += (targets.nod - cur.nod) * k;

      leanGroup.rotation.x = cur.leanX + cur.nod;
      leanGroup.rotation.z = cur.leanZ;
      leanGroup.position.y = reduced ? 0 : Math.sin(tTotal * 1.1) * 0.08;

      for (var i = 0; i < emissiveMats.length; i++) {
        emissiveMats[i].emissiveIntensity =
          0.75 + 0.25 * Math.sin(tTotal * 2) + Math.min(1.4, activity * 1.6);
      }
      activity *= Math.exp(-3 * dt);
    }

    /* the model */

    var modelReady = false;
    var emissiveMats = [];
    var allMats = [];
    var emissiveBase = 1.0;
    var modelBox = new THREE.Box3();
    var modelSizeArr = [0, 0, 0];

    var loader = new THREE.GLTFLoader();

    loader.load(modelUrl, function (gltf) {
      var model = gltf.scene;

      // The GLB is exported from the Blender scene already lying flat:
      // top face up, grips towards the viewer, triggers away from it.
      var box = new THREE.Box3().setFromObject(model);
      var size = box.getSize(new THREE.Vector3());
      var center = box.getCenter(new THREE.Vector3());
      var scale = modelWidth / Math.max(size.x, size.y, size.z);

      model.position.sub(center);
      model.traverse(function (node) {
        if (node.isMesh) {
          var mats = Array.isArray(node.material) ? node.material : [node.material];
          mats.forEach(function (m) {
            if (allMats.indexOf(m) === -1) allMats.push(m);
            // The model uses alphaMode BLEND for translucent windows
            // (e.g. the marked buttons under the shell). Combined with
            // the authored doubleSided flag this composites interior
            // back faces over the front — "seeing through" the object.
            // Front-face culling on the translucent materials keeps
            // the windows but never renders the inside.
            if (m.transparent) m.side = THREE.FrontSide;
            if ((m.emissiveTexture || (m.emissive && m.emissive.r > 0)) &&
                emissiveMats.indexOf(m) === -1) {
              emissiveMats.push(m);
            }
          });
        }
      });

      tumbleGroup.add(model);
      tumbleGroup.scale.setScalar(scale);
      modelBox.setFromObject(tumbleGroup);
      modelSizeArr = [size.x * scale, size.y * scale, size.z * scale];
      modelReady = true;
    }, undefined, function (err) {
      container.classList.add('controller-fallback');
      container.textContent = 'controller model failed to load';
      if (window.console) console.error('ControllerView: failed to load', modelUrl, err);
    });

    /* grabbing: raycast the controller itself, not the canvas rect.
       The canvas is pointer-transparent, so page text stays selectable
       right through it; the grab cursor only appears over the pad. */

    var dragging = false;
    var dragPointer = -1;
    var lastX = 0, lastY = 0;
    var ray = new THREE.Ray();
    var ndc = new THREE.Vector2();

    // release inertia: angular velocity (rad/s, world space) plus the
    // recent drag motion it is estimated from
    var spinVel = new THREE.Vector3();
    var dragSamples = [];

    function hitModel(x, y) {
      if (!modelReady) return false;
      var r = canvas.getBoundingClientRect();
      if (x < r.left || x > r.right || y < r.top || y > r.bottom) return false;
      ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
      ray.origin.setFromMatrixPosition(camera.matrixWorld);
      ray.direction.set(ndc.x, ndc.y, 0.5).unproject(camera).sub(ray.origin).normalize();
      modelBox.setFromObject(tumbleGroup);
      return ray.intersectsBox(modelBox);
    }

    window.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch' || !hitModel(e.clientX, e.clientY)) return;
      dragging = true;
      dragPointer = e.pointerId;
      lastX = e.clientX; lastY = e.clientY;
      spinVel.set(0, 0, 0); // grabbing catches a spinning controller
      dragSamples.length = 0;
      e.preventDefault(); // no text selection while tumbling
      document.documentElement.style.cursor = 'grabbing';
    });

    /* trackball: free rotation, no clamps, no gimbal lock. The drag
       delta maps to a rotation axis in the screen plane, transformed
       into world space and premultiplied onto the current orientation,
       so the controller always follows the cursor intuitively. */

    var dragQ = new THREE.Quaternion();
    var dragAxis = new THREE.Vector3();
    var camQ = new THREE.Quaternion();
    var DRAG_SPEED = 0.0075; // radians per pixel

    window.addEventListener('pointermove', function (e) {
      if (dragging && e.pointerId === dragPointer) {
        var dx = e.clientX - lastX, dy = e.clientY - lastY;
        lastX = e.clientX; lastY = e.clientY;
        var len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0) {
          camera.getWorldQuaternion(camQ);
          dragAxis.set(dy, dx, 0).normalize().applyQuaternion(camQ);
          var angle = len * DRAG_SPEED;
          dragQ.setFromAxisAngle(dragAxis, angle);
          tumbleGroup.quaternion.premultiply(dragQ);
          // remember recent motion so the release velocity can be
          // estimated from it
          var now = performance.now();
          dragSamples.push({
            t: now,
            x: dragAxis.x * angle, y: dragAxis.y * angle, z: dragAxis.z * angle
          });
          while (dragSamples.length > 0 && now - dragSamples[0].t > 200) {
            dragSamples.shift();
          }
        }
        return;
      }
      if (!dragging && e.pointerType !== 'touch' && modelReady) {
        var over = hitModel(e.clientX, e.clientY);
        document.documentElement.style.cursor = over ? 'grab' : '';
      }
    });

    function endDrag(e) {
      if (dragging && e.pointerId === dragPointer) {
        dragging = false;
        document.documentElement.style.cursor = '';
        releaseSpin();
      }
    }
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);

    // Estimate the angular velocity at release from the last ~100ms
    // of drag motion. Holding still before letting go means no fling.
    function releaseSpin() {
      var now = performance.now();
      var sx = 0, sy = 0, sz = 0, oldest = null;
      for (var i = dragSamples.length - 1; i >= 0; i--) {
        var s = dragSamples[i];
        if (now - s.t > 100) break;
        sx += s.x; sy += s.y; sz += s.z;
        oldest = s.t;
      }
      dragSamples.length = 0;
      if (oldest === null) return;
      var span = Math.max(16, now - oldest) / 1000;
      spinVel.set(sx / span, sy / span, sz / span);
      var speed = spinVel.length();
      if (speed > 40) spinVel.multiplyScalar(40 / speed);
      if (spinVel.length() < 0.05) spinVel.set(0, 0, 0);
    }

    /* sizing — driven by the CSS-sized canvas, not the layout box */

    function resize() {
      var w = canvas.clientWidth || container.clientWidth || 640;
      var h = canvas.clientHeight || w * 0.75;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
      var aspect = Math.max(0.4, w / h);
      var d = 19;
      if (aspect < 1.45) d = Math.min(38, 19 * (1.45 / aspect));
      camera.aspect = aspect;
      camera.position.set(0, d * 0.42, d * 0.91);
      camera.lookAt(0, -0.4, 0);
      camera.updateProjectionMatrix();
    }
    resize();
    if (window.ResizeObserver) {
      new ResizeObserver(resize).observe(canvas);
      new ResizeObserver(resize).observe(container);
    } else {
      window.addEventListener('resize', resize);
    }

    /* render loop, paused when scrolled away */

    var visible = true;
    var raf = 0;
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible && !raf) raf = requestAnimationFrame(frame);
      }, { rootMargin: '150px' }).observe(container);
    }

    var clock = new THREE.Clock();

    function frame() {
      raf = visible ? requestAnimationFrame(frame) : 0;
      var dt = Math.min(clock.getDelta(), 0.05);
      tTotal += dt;

      hasPad = pollGamepad();
      if (!hasPad) demo(tTotal);
      apply(dt);

      // release inertia: keep tumbling around the last drag axis,
      // decaying like friction until it settles
      if (!dragging && spinVel.lengthSq() > 0) {
        var speed = spinVel.length();
        dragAxis.copy(spinVel).divideScalar(speed);
        dragQ.setFromAxisAngle(dragAxis, speed * dt);
        tumbleGroup.quaternion.premultiply(dragQ);
        spinVel.multiplyScalar(Math.exp(-2.2 * dt));
        if (spinVel.length() < 0.05) spinVel.set(0, 0, 0);
      }

      renderer.render(scene, camera);
    }

    renderer.render(scene, camera); // first paint, no rAF needed
    raf = requestAnimationFrame(frame);

    var api = {
      container: container,
      scene: scene,
      camera: camera,
      renderer: renderer,
      debug: function () {
        return {
          triangles: renderer.info.render.triangles,
          drawCalls: renderer.info.render.calls,
          modelReady: modelReady,
          hasPad: hasPad,
          dragging: dragging,
          tumble: tumbleGroup.quaternion.toArray().map(function (v) {
            return Math.round(v * 1000) / 1000;
          }),
          modelSize: modelSizeArr.map(function (v) {
            return Math.round(v * 10) / 10;
          }),
          spinVel: Math.round(spinVel.length() * 100) / 100,
          theme: isDark ? 'dark' : 'light',
          rimIntensity: rim.intensity,
          lean: [cur.leanX, cur.leanZ],
          emissiveMats: emissiveMats.length,
          materials: allMats.map(function (m) {
            return { name: m.name, transparent: m.transparent, side: m.side };
          })
        };
      }
    };
    instances.push(api);
    return api;
  };

  window.ControllerView.instances = instances;
})();
