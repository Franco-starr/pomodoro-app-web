import * as THREE from 'three';

export function createCRTMaterial(videoTexture) {

  return new THREE.ShaderMaterial({

    uniforms: {
      tDiffuse: { value: videoTexture },
      time: { value: 0 },
      resolution: { value: new THREE.Vector2(640, 480) },
      emissiveStrength: { value: 1.0 },
      lightIntensity: { value: 1.0 },
      toneMapped: false
    },

    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,

    fragmentShader: `
uniform sampler2D tDiffuse;
uniform float time;
uniform vec2 resolution;
uniform float emissiveStrength;

varying vec2 vUv;

void main() {

  vec2 uv = vUv;

  // -----------------------
  // 🎥 BASE
  // -----------------------
  vec3 base = texture2D(tDiffuse, uv).rgb;

  // -----------------------
  // 🔴🟢🔵 SLOT MASK (PSX REAL)
  // -----------------------
  float scale = 360.0;
  vec2 pos = uv * scale;

  float row = mod(floor(pos.y), 2.0);
  float col = mod(floor(pos.x), 3.0);

  if (row == 1.0) {
    pos.x += 1.5;
    col = mod(floor(pos.x), 3.0);
  }

  vec3 mask;

  if (col < 1.0) {
    mask = vec3(1.0, 0.2, 0.2);
  } else if (col < 2.0) {
    mask = vec3(0.2, 1.0, 0.2);
  } else {
    mask = vec3(0.2, 0.2, 1.0);
  }

  vec3 color = base * mask;

  // -----------------------
  // 🌫️ COLOR BLEED
  // -----------------------
  vec3 bleed1 = texture2D(tDiffuse, uv + vec2(0.0015, 0.0)).rgb;
  vec3 bleed2 = texture2D(tDiffuse, uv - vec2(0.0015, 0.0)).rgb;

  color = mix(color, bleed1, 0.25);
  color = mix(color, bleed2, 0.25);

  // -----------------------
  // 📺 SCANLINES SUAVES
  // -----------------------
  float scan = sin(uv.y * resolution.y * 1.2);
  float scanMask = smoothstep(0.3, 1.0, scan);
  color *= mix(0.7, 1.0, scanMask);

  // -----------------------
  // 💡 GLOW
  // -----------------------
  float glow = 1.2 + 0.4 * sin(time * 3.0);
  color *= emissiveStrength * glow;

  color = pow(color, vec3(0.75));

  // -----------------------
  // ⚡ FLICKER
  // -----------------------
  float flicker = 0.90 + 0.05 * sin(time * 40.0);
  color *= flicker;

  // -----------------------
  // 🔥 BOOST FINAL
  // -----------------------
  color += color * 1.5;

  gl_FragColor = vec4(color, 1.0);
}
`
  });
}
