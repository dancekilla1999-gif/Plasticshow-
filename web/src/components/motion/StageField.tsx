'use client';

import { useEffect, useRef } from 'react';
import { getCapabilities } from '@/lib/capabilities';

/**
 * The hero's living backdrop: a hand-written WebGL fragment shader that renders
 * drifting stage haze, two moving light shafts and a scanline shimmer.
 *
 * Written directly against WebGL rather than pulling in Three.js — this is a
 * single full-screen quad, so a library would add ~150 KB for nothing. Falls
 * back to a pure-CSS gradient wherever `allowHeavy` is false.
 */
const FRAG = `#version 300 es
precision highp float;
out vec4 outColor;

uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform vec3 uAccent;

// Value noise + fbm, used for the haze.
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), u.x),
             mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
}

float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++){
    v += a * noise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

// A soft light shaft sweeping from the top of the frame.
float shaft(vec2 uv, float x, float width, float skew){
  float d = abs(uv.x - x - uv.y * skew);
  return smoothstep(width, 0.0, d) * smoothstep(1.15, -0.1, uv.y);
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = uv;
  p.x *= uRes.x / uRes.y;

  float t = uTime * 0.055;

  // Drifting haze.
  float haze = fbm(p * 2.4 + vec2(t, t * 0.6));
  haze = pow(haze, 2.2);

  // Two shafts breathe in and out of the frame at different rates.
  float s1 = shaft(uv, 0.32 + sin(uTime * 0.13) * 0.07, 0.16, 0.22);
  float s2 = shaft(uv, 0.71 + cos(uTime * 0.09) * 0.05, 0.11, -0.18);

  // A pool of light that follows the cursor, eased on the CPU side.
  float glow = smoothstep(0.55, 0.0, distance(uv, uMouse) * vec2(uRes.x / uRes.y, 1.0).y);

  vec3 base = vec3(0.031, 0.031, 0.039);
  vec3 col = base;
  col += uAccent * (s1 * 0.16 + s2 * 0.11);
  col += vec3(0.85, 0.80, 0.72) * haze * 0.055;
  col += uAccent * glow * 0.09;

  // Vignette keeps the type readable over the centre.
  float vig = smoothstep(1.25, 0.25, length(uv - 0.5));
  col *= 0.55 + vig * 0.45;

  // Fine dither to stop banding across the large dark gradient.
  col += (hash(gl_FragCoord.xy + uTime) - 0.5) * 0.012;

  outColor = vec4(col, 1.0);
}`;

const VERT = `#version 300 es
in vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`;

export function StageField({ accent = [0.78, 0.06, 0.18] }: { accent?: [number, number, number] }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !getCapabilities().allowHeavy) return;

    const gl = canvas.getContext('webgl2', {
      antialias: false,
      alpha: false,
      powerPreference: 'low-power',
    });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return sh;
    };

    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, 'uRes');
    const uTime = gl.getUniformLocation(program, 'uTime');
    const uMouse = gl.getUniformLocation(program, 'uMouse');
    gl.uniform3f(gl.getUniformLocation(program, 'uAccent'), accent[0], accent[1], accent[2]);

    // Half-resolution render target: the shader is all low-frequency light, so
    // the upscale is invisible and it costs a quarter of the fill rate.
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * 0.5;
      const w = Math.floor(canvas.clientWidth * dpr);
      const h = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width === w && canvas.height === h) return;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const mouse = { x: 0.5, y: 0.6, tx: 0.5, ty: 0.6 };
    const onMove = (e: PointerEvent) => {
      mouse.tx = e.clientX / window.innerWidth;
      mouse.ty = 1 - e.clientY / window.innerHeight;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    // Pause when off-screen or the tab is hidden — no cycles burned unseen.
    let visible = true;
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, {
      threshold: 0,
    });
    io.observe(canvas);
    const onVisibility = () => { visible = !document.hidden; };
    document.addEventListener('visibilitychange', onVisibility);

    let frame = 0;
    const start = performance.now();
    const loop = () => {
      frame = requestAnimationFrame(loop);
      if (!visible) return;
      mouse.x += (mouse.tx - mouse.x) * 0.045;
      mouse.y += (mouse.ty - mouse.y) * 0.045;
      gl.uniform1f(uTime, (performance.now() - start) / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    loop();

    canvas.dataset.live = 'true';

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVisibility);
      io.disconnect();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [accent]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      // `screen` blending: the shader's near-black base leaves the photograph
      // untouched and only its light shafts and haze are added on top.
      className="pointer-events-none absolute inset-0 h-full w-full opacity-0 mix-blend-screen transition-opacity duration-1000 data-[live=true]:opacity-100"
    />
  );
}
