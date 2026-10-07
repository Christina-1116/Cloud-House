import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import * as TWEEN from '@tweenjs/tween.js';

/* ═════════════ basics ═════════════ */
const $ = s => document.querySelector(s);
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const COARSE = matchMedia('(pointer: coarse)').matches;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.random() * a.length | 0];
const PI = Math.PI, D2R = PI / 180;
const HX = 9.6, HZ = 8, WH = 2.4, PH = .95, T = .14;

/* ═════════════ sound: synthesised, no audio files ═════════════ */
const AU = { ctx: null, out: null, mus: null, on: true, next: 0, step: 0, note: 4 };
function audioStart() {
  if (AU.ctx || !AU.on) { if (AU.ctx && AU.ctx.state === 'suspended') AU.ctx.resume(); return; }
  try {
    const C = window.AudioContext || window.webkitAudioContext; AU.ctx = new C();
    AU.out = AU.ctx.createGain(); AU.out.gain.value = .5; AU.out.connect(AU.ctx.destination);
    AU.mus = AU.ctx.createGain(); AU.mus.gain.value = .26;
    const d = AU.ctx.createDelay(1); d.delayTime.value = .42; const fb = AU.ctx.createGain(); fb.gain.value = .32;
    AU.mus.connect(AU.out); AU.mus.connect(d); d.connect(fb); fb.connect(d); d.connect(AU.out);
    AU.next = AU.ctx.currentTime + .2; setInterval(musicTick, 150);
  } catch { AU.ctx = null; }
}
function tone(f, at, dur, type = 'sine', vol = .2, to = 0, dest) {
  if (!AU.ctx || !AU.on) return;
  const t = AU.ctx.currentTime + at, o = AU.ctx.createOscillator(), g = AU.ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .012); g.gain.exponentialRampToValueAtTime(.0008, t + dur);
  o.connect(g); g.connect(dest || AU.out); o.start(t); o.stop(t + dur + .05);
}
const SFX = {
  click: () => tone(540, 0, .07, 'triangle', .1), pop: () => tone(480, 0, .13, 'sine', .2, 960),
  soft: () => { tone(392, 0, .3, 'sine', .12); tone(523, .08, .4, 'sine', .1); },
  bad: () => tone(200, 0, .18, 'sawtooth', .06, 140), spark: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, i * .07, .35, 'sine', .09)),
  level: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * .11, .5, 'triangle', .13)),
  meow: () => { tone(620, 0, .16, 'sawtooth', .04, 900); tone(900, .15, .3, 'sawtooth', .04, 520); },
  woof: () => { tone(300, 0, .09, 'square', .06, 180); tone(340, .13, .1, 'square', .06, 170); },
  shutter: () => { tone(1800, 0, .04, 'square', .05); tone(900, .06, .06, 'square', .05); },
  paper: () => tone(1200, 0, .12, 'triangle', .04, 500),
  coin: () => { tone(988, 0, .08, 'triangle', .09); tone(1319, .07, .22, 'triangle', .09); }, place: () => { tone(260, 0, .12, 'sine', .22, 130); tone(700, .03, .1, 'triangle', .08); }, whoosh: () => tone(300, 0, .25, 'sine', .1, 900),
};
const SCALE = [196, 220, 261.6, 293.7, 329.6, 392, 440, 523.3, 587.3, 659.3];
const BASS = [130.8, 98, 110, 87.3];
function musicTick() {   // slow lo-fi bells over four bass notes
  if (!AU.ctx || !AU.on || !state.music) return;
  while (AU.next < AU.ctx.currentTime + .4) {
    const at = AU.next - AU.ctx.currentTime, s = AU.step++;
    if (s % 8 === 0) { const b = BASS[(s / 8 | 0) % 4]; tone(b, at, 3.2, 'sine', .15, 0, AU.mus); tone(b * 2, at, 2.6, 'triangle', .035, 0, AU.mus); }
    if (Math.random() < (s % 2 ? .28 : .7)) { AU.note = clamp(AU.note + pick([-2, -1, -1, 1, 1, 2, 0]), 0, SCALE.length - 1); const f = SCALE[AU.note] * 2; tone(f, at, 1.1, 'sine', .09, 0, AU.mus); tone(f * 3, at, .2, 'sine', .012, 0, AU.mus); }
    AU.next += .42;
  }
}

/* ═════════════ renderer, scene, post ═════════════ */
const canvas = $('#stage');
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: true }); }
catch (err) { $('#loadMsg').textContent = '这台设备没法启动 3D 画面，换一个浏览器再试试。'; throw err; }
const DPR = Math.min(window.devicePixelRatio || 1, COARSE ? 1.6 : 2);
renderer.setPixelRatio(DPR);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = .93;
const ANISO = Math.min(8, renderer.capabilities.getMaxAnisotropy());
const scene = new THREE.Scene();
const skyC = document.createElement('canvas'); skyC.width = 4; skyC.height = 256; const skyX = skyC.getContext('2d');
const skyTex = new THREE.CanvasTexture(skyC); skyTex.colorSpace = THREE.SRGBColorSpace; scene.background = skyTex;
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), .04).texture;
const camera = new THREE.PerspectiveCamera(26, 1, .2, 160);
const handlers = {};
canvas.addEventListener('pointerdown', e => handlers.down?.(e));
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; controls.dampingFactor = .09; controls.screenSpacePanning = false;
controls.minPolarAngle = .5; controls.maxPolarAngle = 1.25; controls.minAzimuthAngle = .12; controls.maxAzimuthAngle = PI / 2 - .12;
controls.rotateSpeed = .5; controls.zoomSpeed = .8; controls.panSpeed = .9; controls.minDistance = 4.5; controls.maxDistance = 46;
const composer = new EffectComposer(renderer); composer.setPixelRatio(DPR);
composer.addPass(new RenderPass(scene, camera));
let gtao = null;
// ambient-occlusion pass removed: it produced a flickering dark patch on the back wall on some views
composer.addPass(new ShaderPass({ uniforms: { tDiffuse: { value: null } }, vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }', fragmentShader: 'uniform sampler2D tDiffuse; varying vec2 vUv; void main(){ vec4 c = texture2D(tDiffuse, vUv); vec3 v = c.rgb; if (!(v.r >= 0.0)) v.r = 0.0; if (!(v.g >= 0.0)) v.g = 0.0; if (!(v.b >= 0.0)) v.b = 0.0; gl_FragColor = vec4(min(v, vec3(32.0)), 1.0); }' }));   // one bad pixel must not blank the frame
const bloom = new UnrealBloomPass(new THREE.Vector2(2, 2), .25, .7, 1.25); composer.addPass(bloom);
composer.addPass(new OutputPass()); composer.addPass(new SMAAPass(2, 2));
const hemi = new THREE.HemisphereLight('#ffffff', '#e9dccb', .8); scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff3e2', 3); sun.castShadow = true;
sun.shadow.mapSize.set(COARSE ? 1536 : 3072, COARSE ? 1536 : 3072);
Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 40 });
sun.shadow.bias = -.0004; sun.shadow.normalBias = .04; sun.shadow.radius = 7;
sun.position.set(HX / 2 + 5, 12, HZ / 2 + 7.5); sun.target.position.set(HX / 2, 0, HZ / 2); scene.add(sun, sun.target);
const lampPool = [0, 1, 2, 3, 4, 5].map(() => { const l = new THREE.PointLight('#ffd9a0', 0, 5.5, 1.8); scene.add(l); return l; });
const glowMats = new Set();
const lights = { k: 0 };   // 0..1 how lit the lamps are

/* ═════════════ materials: every colour in the house is a theme token ═════════════ */
const THEMES = [
  { id: 'matcha', n: '抹茶奶油', lv: 1, c: { wall: '#f5ecdc', back: '#dfe7d3', floor: '#efc993', tile: '#f1f0e6', deck: '#e6c08c', cream: '#f8f1e3', wood: '#e6b87a', wood2: '#c4925a', acc: '#a9c097', acc2: '#e4a89c', acc3: '#a9cfd6', fabric: '#f3ead8', rug: '#f6efe2' } },
  { id: 'peach', n: '蜜桃乌龙', lv: 1, c: { wall: '#f6e7db', back: '#f7ddd0', floor: '#edcdaa', tile: '#f6ebe3', deck: '#e0c3a2', cream: '#fcf3e8', wood: '#e4be94', wood2: '#c4936a', acc: '#f2aa96', acc2: '#f4d19c', acc3: '#b6ceb0', fabric: '#f3dccb', rug: '#fbeee2' } },
  { id: 'mist', n: '雾蓝海盐', lv: 1, c: { wall: '#e3e9ed', back: '#d5e2ea', floor: '#dcc7a8', tile: '#e9f0f2', deck: '#cdb797', cream: '#f4f5f1', wood: '#d3b890', wood2: '#aa8e6a', acc: '#8fb2c8', acc2: '#e6bcab', acc3: '#b5caa6', fabric: '#d0dbe0', rug: '#eef2f2' } },
  { id: 'lilac', n: '薰衣草', lv: 2, c: { wall: '#ece5f1', back: '#e2d8ee', floor: '#e0c8ab', tile: '#f0ebf5', deck: '#d2bb9e', cream: '#f8f3f6', wood: '#dabb96', wood2: '#b19070', acc: '#b4a3d8', acc2: '#ecb6c7', acc3: '#a8cdbe', fabric: '#e0d6e9', rug: '#f4eef6' } },
  { id: 'cocoa', n: '焦糖可可', lv: 3, c: { wall: '#eadac6', back: '#dfc8ae', floor: '#cfa678', tile: '#ede1d1', deck: '#b99268', cream: '#f4e9d9', wood: '#be9062', wood2: '#8f6643', acc: '#c98f5e', acc2: '#839e7e', acc3: '#dcbb80', fabric: '#cfb79b', rug: '#f0e2cd' } },
];
const MT = {};
for (const k in THEMES[0].c) MT[k] = new THREE.MeshStandardMaterial({ color: THEMES[0].c[k], roughness: k === 'tile' ? .55 : .86 });
function neutralTex(draw, tile) {
  const c = document.createElement('canvas'); c.width = c.height = 256; draw(c.getContext('2d'));
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = ANISO; t.repeat.set(1 / tile, 1 / tile); return t;
}
MT.floor.map = neutralTex(x => {
  for (let r = 0; r < 4; r++) { x.fillStyle = ['#ffffff', '#f6f1ea', '#fbf8f3', '#f2ece3'][r]; x.fillRect(0, r * 64, 256, 64); x.fillStyle = 'rgba(120,90,50,.28)'; x.fillRect(0, r * 64, 256, 2); x.fillRect((r * 97 + 40) % 256, r * 64, 2, 64); x.fillRect((r * 97 + 170) % 256, r * 64, 2, 64); }
  x.fillStyle = 'rgba(120,90,50,.05)'; for (let i = 0; i < 80; i++) x.fillRect((i * 53) % 256, (i * 29) % 256, 30 + (i * 7) % 40, 1);
}, 1.6);
MT.tile.map = neutralTex(x => { x.fillStyle = '#fff'; x.fillRect(0, 0, 256, 256); x.fillStyle = 'rgba(110,120,110,.22)'; for (let i = 0; i < 2; i++) { x.fillRect(i * 128, 0, 3, 256); x.fillRect(0, i * 128, 256, 3); } }, .8);
MT.deck.map = neutralTex(x => { for (let r = 0; r < 8; r++) { x.fillStyle = r % 2 ? '#fff' : '#f1e9df'; x.fillRect(r * 32, 0, 32, 256); x.fillStyle = 'rgba(100,70,40,.3)'; x.fillRect(r * 32, 0, 2, 256); } }, 1.2);
MT.back.map = neutralTex(x => { x.fillStyle = '#fff'; x.fillRect(0, 0, 256, 256); x.fillStyle = 'rgba(110,120,110,.16)'; for (let i = 0; i < 4; i++) { x.fillRect(i * 64, 0, 2, 256); x.fillRect(0, i * 64, 256, 2); } }, .6);
const fuzzTex = neutralTex(x => { const d = x.createImageData(256, 256); let s = 9; for (let i = 0; i < d.data.length; i += 4) { s = (s * 16807) % 2147483647; const v = 150 + (s % 106); d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } x.putImageData(d, 0, 0); }, .25);
fuzzTex.colorSpace = THREE.NoColorSpace;
for (const k of ['wall', 'cream', 'fabric', 'rug', 'acc', 'acc2', 'acc3']) { MT[k].bumpMap = fuzzTex; MT[k].bumpScale = k === 'wall' ? .5 : .8; MT[k].roughness = 1; }
const plushCache = new Map();
function PL(color) { let m = plushCache.get(color); if (!m) { m = new THREE.MeshPhysicalMaterial({ color, roughness: 1, bumpMap: fuzzTex, bumpScale: .9, sheen: .9, sheenRoughness: .55, sheenColor: new THREE.Color(color).lerp(new THREE.Color('#ffffff'), .55) }); plushCache.set(color, m); } return m; }
let themeIdx = 0;
function applyTheme(i, animate = true) {
  themeIdx = i; const c = THEMES[i].c, from = {}, to = {};
  for (const k in c) { from[k] = MT[k].color.clone(); to[k] = new THREE.Color(c[k]); }
  const step = t => { for (const k in c) MT[k].color.lerpColors(from[k], to[k], t); };
  if (!animate || REDUCED) step(1); else { const o = { t: 0 }; new TWEEN.Tween(o).to({ t: 1 }, 900).easing(TWEEN.Easing.Cubic.InOut).onUpdate(() => step(o.t)).start(); }
  const r = document.documentElement.style; r.setProperty('--acc', c.acc); r.setProperty('--acc2', c.acc2); r.setProperty('--acc3', c.acc3);
}
const matCache = new Map();
function M(color, o) { const k = color + (o ? JSON.stringify(o) : ''); let m = matCache.get(k); if (!m) { m = new THREE.MeshStandardMaterial({ color, roughness: .82, ...o }); matCache.set(k, m); } return m; }
const WHITE = '#fbf8f1', INK = '#4c443c', LEAF = '#8fb08a', LEAF2 = '#6f9670', POT = '#c9907a', STEEL = '#b9bdb8';
const BRASS = M('#cfae78', { metalness: .5, roughness: .38 });
const MIRROR = M('#eef5f6', { metalness: .55, roughness: .08, emissive: '#b9cfd4', emissiveIntensity: .28 });
const GLASS = new THREE.MeshStandardMaterial({ color: '#dfeef2', transparent: true, opacity: .32, roughness: .08, depthWrite: false });
function boxUV(geo) {
  const p = geo.attributes.position, n = geo.attributes.normal, uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i)); let u, v;
    if (ax >= ay && ax >= az) { u = p.getZ(i); v = p.getY(i); } else if (ay >= az) { u = p.getX(i); v = p.getZ(i); } else { u = p.getX(i); v = p.getY(i); }
    uv[i * 2] = u; uv[i * 2 + 1] = v;
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); return geo;
}

/* ═════════════ builder: soft primitives ═════════════ */
const gcache = new Map();
const G = (k, f) => { let g = gcache.get(k); if (!g) { g = f(); gcache.set(k, g); } return g; };
class Builder {
  constructor() { this.g = new THREE.Group(); this.glows = []; this.light = null; this.own = []; }
  m(x) { return x.isMaterial ? x : MT[x] || M(x); }
  put(geo, mat, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(geo, this.m(mat)); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; this.g.add(m); return m; }
  box(w, h, d, mat, x = 0, y = 0, z = 0, r) { r = r ?? Math.min(.03, Math.min(w, h, d) * .3); return this.put(G(`b${w},${h},${d},${r}`, () => new RoundedBoxGeometry(w, h, d, 3, r)), mat, x, y + h / 2, z); }
  cyl(rt, rb, h, mat, x = 0, y = 0, z = 0, seg = 26) { return this.put(G(`c${rt},${rb},${h},${seg}`, () => new THREE.CylinderGeometry(rt, rb, h, seg)), mat, x, y + h / 2, z); }
  cone(r, h, mat, x = 0, y = 0, z = 0, seg = 22) { return this.put(G(`k${r},${h},${seg}`, () => new THREE.ConeGeometry(r, h, seg)), mat, x, y + h / 2, z); }
  sph(r, mat, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) { const m = this.put(G('sph', () => new THREE.SphereGeometry(1, 26, 18)), mat, x, y, z); m.scale.set(r * sx, r * sy, r * sz); return m; }
  tor(R, r, mat, x = 0, y = 0, z = 0, arc = PI * 2) { return this.put(G(`t${R},${r},${arc}`, () => new THREE.TorusGeometry(R, r, 10, 36, arc)), mat, x, y, z); }
  cap(r, len, mat, x = 0, y = 0, z = 0) { return this.put(G(`p${r},${len}`, () => new THREE.CapsuleGeometry(r, len, 6, 14)), mat, x, y, z); }
  disc(r, mat, x = 0, y = 0, z = 0) { return this.put(G(`d${r}`, () => new THREE.CircleGeometry(r, 36)), mat, x, y, z); }
  glow(color, k = 2) { const col = new THREE.Color(color), m = new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0, roughness: .5 }); m.userData.glow = k; this.glows.push(m); glowMats.add(m); return m; }
  lamp(x, y, z, color = '#ffd9a0') { this.light = { p: new THREE.Vector3(x, y, z), color }; }
  legs(xs, zs, h, r = .022, mat = 'wood2') { for (const x of xs) for (const z of zs) this.cyl(r, r * .8, h, mat, x, 0, z, 10); }
  ns(m) { m.castShadow = false; return m; }
  plant(x, y, z, k = 1, pot = POT) { this.cyl(.07 * k, .055 * k, .1 * k, pot, x, y, z, 14); for (let i = 0; i < 6; i++) { const a = i * 2.4, r = .03 * k + (i % 3) * .018 * k; const l = this.sph(.06 * k, i % 2 ? LEAF : LEAF2, x + Math.cos(a) * r, y + .15 * k + (i % 3) * .035 * k, z + Math.sin(a) * r, 1, .35, .7); l.rotation.set(Math.sin(a) * .7, -a, .5); } }
}

/* ═════════════ sky: time of day, clouds, stars, drifting particles ═════════════ */
const TIMES = {
  morning: { n: '清晨', top: '#f4c9bd', bot: '#fbecd8', sun: '#ffe6c8', si: 2.6, hs: '#fff6ee', hg: '#ecd9c6', hi: .82, night: .1 },
  day: { n: '白天', top: '#86bdea', bot: '#e6f1f8', sun: '#fff1dc', si: 3.0, hs: '#ffffff', hg: '#f1dcc6', hi: .78, night: 0 },
  dusk: { n: '黄昏', top: '#a99cc4', bot: '#f2c2a0', sun: '#ffb98c', si: 2.2, hs: '#ffdccb', hg: '#c9a9a6', hi: .62, night: .55 },
  night: { n: '夜晚', top: '#23284e', bot: '#5a5486', sun: '#a9b6f2', si: .5, hs: '#a39fd6', hg: '#4a4266', hi: .5, night: 1 },
};
const env = { top: new THREE.Color(), bot: new THREE.Color(), sun: new THREE.Color(), hs: new THREE.Color(), hg: new THREE.Color(), si: 3, hi: .8, night: 0, key: '' };
function autoTime() { const h = new Date().getHours() + new Date().getMinutes() / 60; return h >= 5.5 && h < 9 ? 'morning' : h >= 9 && h < 17 ? 'day' : h >= 17 && h < 19.5 ? 'dusk' : 'night'; }
const lampI = () => 2.4 * lights.k;
function applyEnv() {
  const g = skyX.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#' + env.top.getHexString()); g.addColorStop(.8, '#' + env.bot.getHexString()); g.addColorStop(1, '#' + env.bot.getHexString());
  skyX.fillStyle = g; skyX.fillRect(0, 0, 4, 256); skyTex.needsUpdate = true;
  sun.color.copy(env.sun); sun.intensity = env.si; hemi.color.copy(env.hs); hemi.groundColor.copy(env.hg); hemi.intensity = env.hi;
  scene.environmentIntensity = .36 - .24 * env.night; stars.material.opacity = clamp(env.night * 1.6 - .5, 0, 1);
  moon.material.color.setRGB(1, .97, .86).multiplyScalar(1.3 + env.night * 1.3); bloom.strength = .22 + .2 * env.night;
  applyLights();
}
function applyLights() {
  for (const m of glowMats) m.emissiveIntensity = m.userData.glow * (m.userData.always ? 1 : m.userData.sw != null ? m.userData.sw : lights.k) * (.45 + .55 * Math.max(env.night, .3));
  for (const l of lampPool) l.intensity = l.userData.on ? lampI() * (l.userData.gain ?? 1) : 0;
}
let envTween = null;
function setTime(key, animate = true) {
  if (env.key === key && animate) return; const P = TIMES[key], cs = ['top', 'bot', 'sun', 'hs', 'hg'];
  const to = Object.fromEntries(cs.map(c => [c, new THREE.Color(P[c])])), from = Object.fromEntries(cs.map(c => [c, env[c].clone()])), f = { si: env.si, hi: env.hi, night: env.night };
  env.key = key; const step = k => { for (const c of cs) env[c].lerpColors(from[c], to[c], k); for (const n of ['si', 'hi', 'night']) env[n] = lerp(f[n], P[n], k); applyEnv(); };
  envTween?.stop(); if (!animate || REDUCED) return step(1);
  const o = { k: 0 }; envTween = new TWEEN.Tween(o).to({ k: 1 }, 1800).easing(TWEEN.Easing.Cubic.InOut).onUpdate(() => step(o.k)).start();
}
const clouds = [];
{
  const puff = new THREE.SphereGeometry(1, 16, 12), cm = M('#ffffff', { roughness: 1 });
  for (let i = 0; i < 16; i++) {
    const g = new THREE.Group(), k = 1.1 + (i % 5) * .55;
    for (const [x, y, r] of [[0, 0, 1], [1.05, -.12, .72], [-1.05, -.15, .68], [.45, .38, .7], [-.5, .3, .6]]) { const m = new THREE.Mesh(puff, cm); m.position.set(x * k, y * k, 0); m.scale.set(r * k, r * k * .78, r * k * .8); g.add(m); }
    const back = i % 2 === 0; g.position.set(back ? -24 + i * 3.4 : -8 - (i % 4) * 3.5, -5 + (i * 2.9) % 13, back ? -7 - (i % 4) * 3.4 : -18 + i * 2.6); g.rotation.y = back ? 0 : PI / 2;
    g.userData = { back, v: .06 + (i % 3) * .035 }; scene.add(g); clouds.push(g);
  }
}
const stars = (() => {
  const n = 340, p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { let v; do { v = new THREE.Vector3(rnd(-1, 1), rnd(-.15, 1), rnd(-1, 1)).normalize(); } while (v.x + v.z > .2); p.set([v.x * 80, v.y * 80, v.z * 80], i * 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const m = new THREE.Points(g, new THREE.PointsMaterial({ color: new THREE.Color(2.4, 2.3, 1.9), size: 2.1, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false })); scene.add(m); return m;
})();
const moon = new THREE.Mesh(new THREE.SphereGeometry(2.2, 32, 20), new THREE.MeshBasicMaterial({ color: '#ffffff' })); moon.position.set(-22, 20, -34); scene.add(moon);
const AMB = { none: { n: '安静' }, petal: { n: '花瓣', col: '#f3b9c4', size: .13, fall: .4 }, snow: { n: '小雪', col: '#ffffff', size: .1, fall: .55 }, rain: { n: '小雨', col: '#d5e6f6', size: .06, fall: 4.2 }, firefly: { n: '萤火', col: [2.4, 2.2, .9], size: .09, fall: -.06 } };
const drift = (() => {
  const n = 130, p = new Float32Array(n * 3), sp = [];
  for (let i = 0; i < n; i++) { p.set([rnd(-5, HX + 5), rnd(-1, 8), rnd(-5, HZ + 5)], i * 3); sp.push(rnd(.6, 1.3)); }
  const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.beginPath(); x.ellipse(16, 16, 12, 9, .6, 0, 7); x.fill();
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const m = new THREE.Points(g, new THREE.PointsMaterial({ map: new THREE.CanvasTexture(c), size: .12, transparent: true, depthWrite: false })); m.frustumCulled = false; m.visible = false; scene.add(m);
  return { m, p, sp, fall: .4 };
})();
function setAmbience(k) { const a = AMB[k]; drift.m.visible = k !== 'none'; if (!a.col) return; Array.isArray(a.col) ? drift.m.material.color.setRGB(...a.col) : drift.m.material.color.set(a.col); drift.m.material.size = a.size; drift.fall = a.fall; }
function tickDrift(dt, time) {
  if (!drift.m.visible) return; const { p, sp } = drift;
  for (let i = 0; i < sp.length; i++) { p[i * 3 + 1] -= sp[i] * drift.fall * dt; p[i * 3] += Math.sin(time * .7 + i) * .22 * dt; p[i * 3 + 2] += Math.cos(time * .5 + i * 2) * .22 * dt; if (p[i * 3 + 1] < -1.5) p[i * 3 + 1] = 8; if (p[i * 3 + 1] > 8.2) p[i * 3 + 1] = -1; }
  drift.m.geometry.attributes.position.needsUpdate = true;
}

/* ═════════════ adaptive quality ═════════════ */
const perf = { ema: 16, n: 0, level: 0 };
function watchPerf(dt) {
  perf.ema += (dt * 1000 - perf.ema) * .05; if (++perf.n < 120) return;
  if (perf.ema > 36 && perf.level < 3) {
    perf.level++; perf.n = 0; perf.ema = 20; const pr = perf.level === 1 ? Math.min(DPR, 1.25) : 1; renderer.setPixelRatio(pr); composer.setPixelRatio(pr);
    if (perf.level >= 2 && gtao) gtao.enabled = false; if (perf.level >= 3) { sun.shadow.mapSize.set(1024, 1024); sun.shadow.map?.dispose(); sun.shadow.map = null; }
    renderer.setSize(innerWidth, innerHeight, false); composer.setSize(innerWidth, innerHeight);
  } else perf.n = 60;
}
