// PipBoy Display Driver v2.77.1a — RobCo Industries (Unlicensed Wasteland Fork)
// Found this terminal half-buried near Megaton. Screen still worked.
// Took me three stimpaks and a rad-away just to get the CRT shader calibrated.
// If you're reading this, congratulations: you can read. That puts you
// ahead of most super mutants and at least one Brotherhood scribe I know.
// Do NOT adjust SCAN_LINE_STRENGTH below -10. Last guy who did that
// is now a feral ghoul. Coincidence? Maybe. I'm not taking chances.


(function () {
  const CRT_FRAG = `
    precision mediump float;

    varying vec2 vTexCoord;
    uniform sampler2D tex0;
    uniform vec2 canvasSize;
    uniform vec2 texelSize;

    uniform float u_time;
    uniform vec2 u_srcResolution;
    uniform float u_glitchIntensity;
    uniform float u_glitchSeed;
    uniform float u_flickerAmount;

    #define SCREEN_CURVATURE 0.02
    #define SCAN_LINE_AMOUNT 0.6
    #define SCAN_LINE_STRENGTH -8.0
    #define PIXEL_STRENGTH -1.5
    #define MASK_INTENSITY 0.1
    #define MASK_SIZE 6.0
    #define MASK_BORDER 0.5
    #define ABERRATION 1.0
    #define VIGNETTE_AMOUNT 0.2
    #define NOISE_AMOUNT 0.015
    #define INTERFERENCE_AMOUNT 0.06
    #define ROLL_LINE_AMOUNT 0.1
    #define ROLL_SPEED 1.0

    float random(vec2 uv) {
      return fract(cos(uv.x * 83.4827 + uv.y * 92.2842) * 43758.5453);
    }

    vec2 warp(vec2 uv) {
      vec2 delta = uv - 0.5;
      float d2 = dot(delta, delta);
      return uv + delta * d2 * SCREEN_CURVATURE;
    }

    vec3 fetchPixel(vec2 uv, vec2 off, vec2 res) {
      vec2 pos = floor(uv * res + off) / res + 0.5 / res;
      if (max(abs(pos.x - 0.5), abs(pos.y - 0.5)) > 0.5) return vec3(0.0);
      float n = 0.0;
      if (NOISE_AMOUNT > 0.0) n = random(pos + fract(u_time)) * NOISE_AMOUNT;
      return texture2D(tex0, pos).rgb + n;
    }

    vec2 dist(vec2 pos, vec2 res) {
      pos = pos * res;
      return -(pos - floor(pos) - 0.5);
    }

    float gaus(float pos, float scale) {
      return exp2(scale * pos * pos);
    }

    vec3 horz3(vec2 pos, float off, vec2 res) {
      vec3 b = fetchPixel(pos, vec2(-1.0, off), res);
      vec3 c = fetchPixel(pos, vec2( 0.0, off), res);
      vec3 d = fetchPixel(pos, vec2( 1.0, off), res);
      float dst = dist(pos, res).x;
      float scale = PIXEL_STRENGTH;
      float wb = gaus(dst - 1.0, scale);
      float wc = gaus(dst + 0.0, scale);
      float wd = gaus(dst + 1.0, scale);
      return (b * wb + c * wc + d * wd) / (wb + wc + wd);
    }

    float scan(vec2 pos, float off, vec2 res) {
      return gaus(dist(pos, res).y + off, SCAN_LINE_STRENGTH);
    }

    vec3 tri(vec2 pos, vec2 res) {
      vec3 clr = fetchPixel(pos, vec2(0.0), res);
      if (SCAN_LINE_AMOUNT > 0.0) {
        vec3 a = horz3(pos, -1.0, res);
        vec3 b = horz3(pos,  0.0, res);
        vec3 c = horz3(pos,  1.0, res);
        float wa = scan(pos, -1.0, res);
        float wb = scan(pos,  0.0, res);
        float wc = scan(pos,  1.0, res);
        clr = mix(clr, a * wa + b * wb + c * wc, SCAN_LINE_AMOUNT);
      }
      return clr;
    }

    float rollLine(vec2 uv) {
      float x = uv.y * 3.0 - u_time * ROLL_SPEED;
      float f = cos(x) * cos(x * 2.35 + 1.1) * cos(x * 4.45 + 2.3);
      return smoothstep(0.5, 0.9, f) * ROLL_LINE_AMOUNT;
    }

    void main() {
      vec2 uv = vTexCoord;
      vec2 res = u_srcResolution;

      vec2 pos = warp(uv);
      float line = rollLine(pos);

      vec2 sqPix = floor(pos * res) / res + 0.5 / res;
      float interference = random(sqPix.yy + fract(u_time));
      pos.x += (interference * (INTERFERENCE_AMOUNT + line * 6.0)) / res.x;

      if (u_glitchIntensity > 0.0) {
        float band = floor(pos.y * 30.0);
        float bandNoise = fract(sin(band * 43.758 + u_glitchSeed) * 43758.5453);
        if (bandNoise > 0.85) {
          pos.x += (bandNoise - 0.5) * u_glitchIntensity * 0.08;
        }
      }

      float chromatic = ABERRATION + line * 2.0;
      vec2 chromX = vec2(chromatic, 0.0) / res;
      if (u_glitchIntensity > 0.0) chromX *= 1.0 + u_glitchIntensity * 4.0;
      float r = tri(pos - chromX, res).r;
      float g = tri(pos, res).g;
      float b = tri(pos + chromX, res).b;
      vec3 clr = vec3(r, g, b);

      vec2 pixel = pos * canvasSize;

      vec2 coord = pixel / MASK_SIZE;
      vec2 subcoord = coord * vec2(3.0, 1.0);
      vec2 cellOffset = vec2(0.0, fract(floor(coord.x) * 0.5));
      float ind = mod(floor(subcoord.x), 3.0);
      vec3 maskColor = vec3(
        ind < 0.5 ? 1.0 : 0.0,
        (ind >= 0.5 && ind < 1.5) ? 1.0 : 0.0,
        ind >= 1.5 ? 1.0 : 0.0
      ) * 3.0;
      vec2 cellUV = fract(subcoord + cellOffset) * 2.0 - 1.0;
      vec2 border = 1.0 - cellUV * cellUV * MASK_BORDER;
      maskColor *= border.x * border.y;
      clr *= 1.0 + (maskColor - 1.0) * MASK_INTENSITY;

      clr *= 1.0 + SCAN_LINE_AMOUNT * 0.3 + line * 1.5 + MASK_INTENSITY * 0.2;

      vec2 edge = max(1.0 - (pos * 2.0 - 1.0) * (pos * 2.0 - 1.0), 0.0);
      clr *= pow(edge.x * edge.y, VIGNETTE_AMOUNT);

      if (u_glitchIntensity > 0.0) {
        float nBand = step(0.92, fract(sin(floor(pos.y * 20.0 + u_time * 5.0) * 45.23) * 12345.6));
        float noise = random(uv * u_time * 100.0);
        clr = mix(clr, vec3(noise), nBand * u_glitchIntensity * 0.5);
      }

      clr *= u_flickerAmount;

      if (pos.x < 0.0 || pos.x > 1.0 || pos.y < 0.0 || pos.y > 1.0) clr = vec3(0.0);

      gl_FragColor = vec4(clr, 1.0);
    }
  `;

  const BLOOM_FRAG = `
    precision mediump float;

    varying vec2 vTexCoord;
    uniform sampler2D tex0;
    uniform vec2 texelSize;

    #define BLOOM_SPREAD 3.0
    #define BLOOM_GLOW 0.12

    void main() {
      vec2 uv = vTexCoord;
      vec4 sum = vec4(0.0);
      for (float x = -2.0; x <= 2.0; x++) {
        for (float y = -2.0; y <= 2.0; y++) {
          sum += texture2D(tex0, uv + vec2(x, y) * texelSize * BLOOM_SPREAD);
        }
      }
      sum /= 25.0;
      vec4 orig = texture2D(tex0, uv);
      gl_FragColor = orig + (sum - orig) * BLOOM_GLOW;
    }
  `;

  let glitch = {
    active: false, timer: 0, duration: 0,
    intensity: 0, type: 'none', seed: 0, cooldown: 0
  };

  function updateGlitch(p) {
    if (glitch.active) {
      glitch.timer--;
      if (glitch.timer <= 0) {
        glitch.active = false;
        glitch.intensity = 0;
        glitch.cooldown = p.floor(p.random(120, 300));
      }
    } else {
      if (glitch.cooldown > 0) {
        glitch.cooldown--;
      } else if (p.random() < 0.003) {
        glitch.active = true;
        glitch.timer = p.floor(p.random(5, 30));
        glitch.duration = glitch.timer;
        glitch.intensity = p.random(0.3, 1.0);
        glitch.seed = p.random(1000);
        let types = ['hshift', 'chromasplit', 'noise', 'flicker'];
        glitch.type = types[p.floor(p.random(types.length))];
      }
    }
  }

  /**
   * PipBoy — inline CRT post-processing for pixel art.
   *
   * Single image:
   *   PipBoy({ container: 'id', src: 'art.png', width: 288, height: 240 })
   *
   * Multiple images with navigation:
   *   PipBoy({ container: 'id', srcs: ['a.png','b.png'], width: 288, height: 240 })
   *
   * The container should hold fallback <img> tags. They get hidden once the canvas is ready.
   */
  window.PipBoy = function (cfg) {
    var sources = cfg.srcs || [cfg.src];
    var container = document.getElementById(cfg.container);
    var currentIndex = 0;
    var crtEnabled = true;
    var channelSwitch = { active: false, timer: 0, duration: 8, targetIndex: 0 };
    var pad = cfg.pad || 0;
    var srcW = cfg.width + pad * 2;
    var srcH = cfg.height + pad * 2;

    var controls = document.createElement('div');
    controls.className = 'crt-controls';

    var prevBtn = document.createElement('button');
    prevBtn.textContent = '[ PREV ]';
    var nextBtn = document.createElement('button');
    nextBtn.textContent = '[ NEXT ]';
    var toggleBtn = document.createElement('button');
    toggleBtn.textContent = '[ CRT ]';
    toggleBtn.className = 'active';

    var navGroup = document.createElement('div');
    navGroup.style.display = 'flex';
    navGroup.style.gap = '.5rem';
    if (sources.length > 1) {
      navGroup.appendChild(prevBtn);
      navGroup.appendChild(nextBtn);
    }
    controls.appendChild(navGroup);
    controls.appendChild(toggleBtn);
    container.appendChild(controls);

    var osd = { text: '', alpha: 0, timer: 0, duration: 120 };

    function channelLabel(idx) {
      var name = sources[idx].replace(/^.*\//, '').replace(/\.[^.]+$/, '');
      return String(idx + 1).padStart(2, '0') + ' ' + name;
    }

    function showOSD(idx) {
      osd.text = channelLabel(idx);
      osd.alpha = 255;
      osd.timer = osd.duration;
    }

    var sketch = function (p) {
      var artworks = [];
      var buffer, crtShader, bloomShader, osdFont;

      function drawOSD(buf) {
        if (osd.timer <= 0) return;
        osd.timer--;
        if (osd.timer < 30) osd.alpha = Math.round(255 * osd.timer / 30);
        var scale = buf.height / srcH;
        var size = Math.max(22, Math.round(scale * 12));
        buf.smooth();
        buf.push();
        buf.textFont(osdFont);
        buf.textSize(size);
        buf.textAlign(buf.LEFT, buf.TOP);
        buf.fill(255, 255, 255, osd.alpha);
        buf.text(osd.text, buf.width * 0.04, buf.height * 0.05);
        buf.pop();
        buf.noSmooth();
      }

      p.preload = function () {
        for (var i = 0; i < sources.length; i++) {
          artworks.push(p.loadImage(sources[i]));
        }
        osdFont = p.loadFont('/assets/fonts/departure-mono/DepartureMono-Regular.otf');
      };

      function calcSize() {
        var w = container.clientWidth;
        var h = Math.round(w * srcH / srcW);
        return { w: w, h: h };
      }

      function drawArt(art) {
        buffer.background(10);
        var scale = Math.min(buffer.width / srcW, buffer.height / srcH);
        var drawW = cfg.width * scale;
        var drawH = cfg.height * scale;
        var ox = (buffer.width - drawW) / 2;
        var oy = (buffer.height - drawH) / 2;
        buffer.image(art, ox, oy, drawW, drawH);
      }

      p.setup = function () {
        p.pixelDensity(1);
        var sz = calcSize();
        var cnv = p.createCanvas(sz.w, sz.h, p.WEBGL);
        cnv.parent(cfg.container);
        buffer = p.createGraphics(sz.w, sz.h);
        buffer.noSmooth();
        crtShader = p.createFilterShader(CRT_FRAG);
        bloomShader = p.createFilterShader(BLOOM_FRAG);

        // Hide fallback images, activate CRT styling
        var imgs = container.querySelectorAll('img');
        for (var i = 0; i < imgs.length; i++) imgs[i].style.display = 'none';
        container.classList.remove('image-grid', 'pixelated');
        container.classList.add('crt-active');
      };

      p.draw = function () {
        var cs = channelSwitch;
        if (cs.active) {
          cs.timer--;
          var progress = 1.0 - cs.timer / cs.duration;

          if (cs.timer <= cs.duration * 0.5) {
            currentIndex = cs.targetIndex;
          }

          buffer.push();
          if (progress < 0.5) {
            // first half: old image breaks up into static
            drawArt(artworks[currentIndex]);
            buffer.loadPixels();
            var staticAmount = progress * 2.0;
            for (var i = 0; i < buffer.pixels.length; i += 4) {
              if (Math.random() < staticAmount * 0.7) {
                var v = Math.random() * 255;
                buffer.pixels[i] = v;
                buffer.pixels[i + 1] = v;
                buffer.pixels[i + 2] = v;
              }
            }
            buffer.updatePixels();
          } else {
            // second half: new image emerges from static
            drawArt(artworks[currentIndex]);
            buffer.loadPixels();
            var staticAmount = (1.0 - progress) * 2.0;
            for (var i = 0; i < buffer.pixels.length; i += 4) {
              if (Math.random() < staticAmount * 0.7) {
                var v = Math.random() * 255;
                buffer.pixels[i] = v;
                buffer.pixels[i + 1] = v;
                buffer.pixels[i + 2] = v;
              }
            }
            buffer.updatePixels();
          }
          buffer.pop();
          drawOSD(buffer);

          var squish = Math.sin(progress * Math.PI);
          var scaleX = 1.0 + squish * 0.15;
          var scaleY = 1.0 - squish * 0.85;
          var drawW = p.width * scaleX;
          var drawH = p.height * scaleY;
          p.background(10);
          p.image(buffer, -drawW / 2, -drawH / 2, drawW, drawH);

          if (crtEnabled) {
            var flicker = 0.6 + Math.sin(progress * Math.PI * 4) * 0.4;
            crtShader.setUniform('u_time', p.millis() / 1000.0);
            crtShader.setUniform('u_srcResolution', [srcW, srcH]);
            crtShader.setUniform('u_glitchIntensity', Math.sin(progress * Math.PI) * 0.8);
            crtShader.setUniform('u_glitchSeed', p.random(1000));
            crtShader.setUniform('u_flickerAmount', flicker);
            p.filter(crtShader);
            p.filter(bloomShader);
          }

          if (cs.timer <= 0) cs.active = false;
        } else {
          var art = artworks[currentIndex];
          drawArt(art);
          drawOSD(buffer);
          p.background(10);
          p.resetShader();
          p.image(buffer, -p.width / 2, -p.height / 2, p.width, p.height);

          if (crtEnabled) {
            updateGlitch(p);
            var flicker = 1.0;
            if (glitch.active && glitch.type === 'flicker') flicker = 0.85 + p.random(0.3);
            crtShader.setUniform('u_time', p.millis() / 1000.0);
            crtShader.setUniform('u_srcResolution', [srcW, srcH]);
            crtShader.setUniform('u_glitchIntensity', glitch.active ? glitch.intensity : 0.0);
            crtShader.setUniform('u_glitchSeed', glitch.seed);
            crtShader.setUniform('u_flickerAmount', flicker);
            p.filter(crtShader);
            p.filter(bloomShader);
          }
        }
      };

      p.windowResized = function () {
        var sz = calcSize();
        p.resizeCanvas(sz.w, sz.h);
        buffer.resizeCanvas(sz.w, sz.h);
        buffer.noSmooth();
      };
    };

    new p5(sketch, cfg.container);

    function updateNav() {
      prevBtn.disabled = currentIndex <= 0;
      nextBtn.disabled = currentIndex >= sources.length - 1;
      prevBtn.style.opacity = prevBtn.disabled ? '0.3' : '1';
      nextBtn.style.opacity = nextBtn.disabled ? '0.3' : '1';
    }
    updateNav();

    function switchChannel(idx) {
      if (idx === currentIndex) return;
      if (!crtEnabled || channelSwitch.active) {
        currentIndex = idx;
        showOSD(idx);
        return;
      }
      channelSwitch.active = true;
      channelSwitch.timer = channelSwitch.duration;
      channelSwitch.targetIndex = idx;
      showOSD(idx);
    }

    prevBtn.addEventListener('click', function () {
      var target = currentIndex - 1;
      if (channelSwitch.active) target = channelSwitch.targetIndex - 1;
      if (target >= 0) {
        switchChannel(target);
        prevBtn.disabled = target <= 0;
        nextBtn.disabled = false;
        prevBtn.style.opacity = prevBtn.disabled ? '0.3' : '1';
        nextBtn.style.opacity = '1';
      }
    });
    nextBtn.addEventListener('click', function () {
      var target = currentIndex + 1;
      if (channelSwitch.active) target = channelSwitch.targetIndex + 1;
      if (target < sources.length) {
        switchChannel(target);
        nextBtn.disabled = target >= sources.length - 1;
        prevBtn.disabled = false;
        nextBtn.style.opacity = nextBtn.disabled ? '0.3' : '1';
        prevBtn.style.opacity = '1';
      }
    });
    toggleBtn.addEventListener('click', function () {
      crtEnabled = !crtEnabled;
      toggleBtn.classList.toggle('active', crtEnabled);
      container.style.background = crtEnabled ? '#0a0a0a' : 'transparent';
    });
  };
})();
