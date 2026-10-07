
/* ═════════════ plush residents: felt dolls on a small jointed rig ═════════════ */
const HS = 1.3;   // doll scale: residents stand about 1.2 m, comfortably above the worktops
const CREAM = '#f6ecd9', SAGE = '#a9c097', BROWN = '#4a2f24';
const CHARS = [
  { id: 'yu', n: '阿屿', tag: '话少，爱发呆', he: '他', hair: BROWN, style: 'boy', eye: '#7a4a2c', mouth: 'smile', hat: 'beret', top: CREAM, ov: null, bot: SAGE, pom: SAGE, acc: 'pack', voice: '话不多，句子短，偶尔冷幽默，其实很在意对方' },
  { id: 'ju', n: '橘子', tag: '元气，爱打招呼', he: '她', hair: '#e8752c', style: 'bob', eye: '#8a4a20', mouth: 'open', hat: 'bucket', top: CREAM, ov: '#ee7a34', bot: '#ee7a34', pom: null, acc: null, voice: '爽朗直接，爱笑，喜欢给人打气' },
  { id: 'li', n: '栗子', tag: '慢性子，爱喝热的', he: '他', hair: BROWN, style: 'boy', eye: '#8a5a34', mouth: 'smile', hat: 'acorn', top: CREAM, ov: SAGE, bot: SAGE, pom: null, acc: null, voice: '慢悠悠的，爱喝热饮，说话像在烤火' },
  { id: 'man', n: '小满', tag: '爱做饭，爱云', he: '她', hair: BROWN, style: 'bun', eye: '#8a5236', mouth: 'open', hat: 'clip', top: CREAM, ov: SAGE, bot: SAGE, pom: null, acc: null, voice: '活泼爱笑，喜欢分享吃的，语气里带感叹' },
  { id: 'xia', n: '知夏', tag: '安静，爱看书', he: '她', hair: BROWN, style: 'neat', eye: '#6a4a34', mouth: 'smile', hat: 'bear', top: CREAM, ov: null, bot: '#d9c7a6', pom: null, acc: 'glasses', voice: '温柔安静，说话像写信，喜欢引用书里的句子' },
  { id: 'yun', n: '团团', tag: '一朵会走路的云', he: '它', body: 'cloud', hair: '#ffffff', eye: '#5a4030', mouth: 'w', hat: 'straw', top: '#ffffff', ov: null, bot: '#ffffff', acc: 'scarf', voice: '软乎乎的小云朵，说话很短，喜欢用“呼”“噗”这样的语气词' },
];
const HATS = [
  { id: 'none', n: '不戴', price: 0 }, { id: 'beret', n: '小芽贝雷帽', price: 0 }, { id: 'bucket', n: '橘子渔夫帽', price: 0 }, { id: 'acorn', n: '橡果毛线帽', price: 0 }, { id: 'clip', n: '云朵发夹', price: 0 }, { id: 'bear', n: '小熊贝雷帽', price: 0 }, { id: 'straw', n: '草编小帽', price: 0 },
  { id: 'crown', n: '小皇冠', price: 260 }, { id: 'cat', n: '猫耳发箍', price: 180 }, { id: 'chef', n: '厨师帽', price: 150 }, { id: 'wreath', n: '花环', price: 200 }, { id: 'sleep', n: '睡帽', price: 120 }, { id: 'frog', n: '青蛙帽', price: 240 },
];
const ACCS = [{ id: 'none', n: '不带', price: 0 }, { id: 'pack', n: '小背包', price: 0 }, { id: 'glasses', n: '圆眼镜', price: 0 }, { id: 'scarf', n: '绿围巾', price: 0 }, { id: 'bow', n: '蝴蝶结', price: 100 }, { id: 'wings', n: '小翅膀', price: 320 }, { id: 'balloon', n: '气球', price: 160 }];
const DYE = [CREAM, SAGE, '#ee7a34', '#e4a89c', '#a9cfd6', '#c9bfe6', '#f1d27a', '#b98d6f', '#8fb0c8', '#ffffff'];
const PETS = [
  { id: 'cat0', n: '奶盖', kind: 'cat', c: '#fbf3e6', c2: '#f1c9a6' }, { id: 'cat1', n: '橘座', kind: 'cat', c: '#f0a860', c2: '#fff3e2' }, { id: 'cat2', n: '煤球', kind: 'cat', c: '#6a6570', c2: '#f4f0ea' },
  { id: 'dog0', n: '豆包', kind: 'dog', c: '#e2b47a', c2: '#fbf3e6' }, { id: 'dog1', n: '汤圆', kind: 'dog', c: '#fbf7f0', c2: '#e9d9c4' },
];
const eyeCache = new Map();
function eyeMat(iris) {
  let m = eyeCache.get(iris); if (m) return m;
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), el = (cx, cy, rx, ry) => { x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, 7); x.fill(); };
  x.fillStyle = '#fffaf4'; el(64, 68, 52, 56);
  const g = x.createRadialGradient(64, 84, 4, 64, 70, 50); g.addColorStop(0, '#c98a4e'); g.addColorStop(.45, iris); g.addColorStop(1, '#2e180e'); x.fillStyle = g; el(64, 70, 45, 50);
  x.fillStyle = '#24120a'; el(64, 66, 21, 25); x.fillStyle = 'rgba(255,214,160,.45)'; el(64, 102, 24, 10);
  x.fillStyle = '#fff'; el(45, 44, 14, 15); el(86, 92, 6.5, 7);
  x.strokeStyle = '#3a1f12'; x.lineWidth = 9; x.lineCap = 'round'; x.beginPath(); x.ellipse(64, 68, 50, 54, 0, PI * 1.08, PI * 1.92); x.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = ANISO;
  m = new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: .35, roughness: .22 }); eyeCache.set(iris, m); return m;
}
function grp(parent, x, y, z) { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; }
const blushM = () => M('#f59a98', { transparent: true, opacity: .42, roughness: 1 });
function addFace(b, H, hc, o, z0 = .217, ex = .094, ey = -.03) {
  const hm = m => { H.add(m); return m; }, disc = G('eye', () => new THREE.CircleGeometry(.064, 28));
  const eyes = [-1, 1].map(s => { const e = hm(b.ns(b.put(disc, eyeMat(o.eye), s * ex, hc + ey, z0 + .006))); e.rotation.set(.13, s * .36, 0); e.receiveShadow = false; return e; });
  for (const s of [-1, 1]) { const bl = hm(b.ns(b.sph(.04, blushM(), s * (ex + .062), hc + ey - .072, z0 - .028, 1, .62, .25))); bl.rotation.y = s * .55; const br = hm(b.box(.04, .011, .008, o.body === 'cloud' ? '#c9b8a6' : o.hair, s * ex, hc + ey + .092, z0 + .004, .004)); br.rotation.set(0, s * .3, s * -.2); }
  hm(b.sph(.011, '#f29a94', 0, hc + ey - .028, z0 + .022, 1.2, .8, .6));
  if (o.mouth === 'open') { const mo = hm(b.sph(.03, '#d9605e', 0, hc + ey - .078, z0 + .005, 1.15, .95, .35)); hm(b.sph(.017, '#f7a6a0', 0, hc + ey - .09, z0 + .012, 1.1, .6, .3)); }
  else if (o.mouth === 'w') for (const s of [-1, 1]) hm(b.ns(b.tor(.014, .0045, '#a9735e', s * .014, hc + ey - .062, z0 + .02, PI))).rotation.z = PI;
  else hm(b.ns(b.tor(.022, .005, '#c0705e', 0, hc + ey - .052, z0 + .014, PI * .7))).rotation.z = PI * 1.15;
  return eyes;
}
function leaf(b, add, x, y, z, k, rz, col = '#8fb07a') { const l = add(b.sph(.06 * k, PL(col), x, y, z, 1, .22, .55)); l.rotation.set(.2, .3, rz); return l; }
function addHat(b, H, hc, kind, o) {
  const hm = m => { H.add(m); return m; }, top = hc + .21;
  if (kind === 'beret') { const h = hm(b.sph(.2, PL('#f3e8d2'), .06, top - .005, -.02, 1.05, .42, 1)); h.rotation.z = -.3; hm(b.cyl(.006, .006, .05, '#8fb07a', .12, top + .08, -.02, 5)); leaf(b, hm, .09, top + .135, -.02, .9, .5); leaf(b, hm, .16, top + .13, -.02, 1, -.5); for (const [dx, dy, r] of [[0, 0, .028], [.028, -.004, .022], [-.026, -.006, .02]]) hm(b.sph(r, PL(SAGE), .2 + dx, top - .07 + dy, .135, 1, 1, .35)); }
  if (kind === 'bucket') { const c = o.id === 'ju' ? '#ee7a34' : '#f1d27a'; hm(b.sph(.262, PL(c), 0, hc + .1, -.01, 1.03, .66, 1.03)); const br = hm(b.sph(.34, PL(c), 0, hc + .1, -.01, 1, .2, 1)); br.rotation.x = -.16; hm(b.cyl(.014, .018, .05, '#8a5a3a', .13, top + .06, -.02, 8)).rotation.z = -.5; leaf(b, hm, .06, top + .07, -.03, 1.5, .25, '#7fa868'); leaf(b, hm, .17, top + .04, .03, 1.3, -.55, '#7fa868'); hm(b.box(.06, .045, .01, '#fbf3e4', .2, hc + .2, .17, .004)).rotation.set(-.4, .6, -.3); }
  if (kind === 'acorn') { hm(b.sph(.256, PL('#a8623e'), 0, hc + .1, -.012, 1.04, .72, 1.04)); const band = hm(b.tor(.252, .036, PL('#e9cfa6'), 0, hc + .095, -.012)); band.rotation.x = PI / 2 - .08; hm(b.sph(.062, PL('#a8623e'), 0, top + .095, -.02)); leaf(b, hm, .2, hc + .2, .1, 1.25, -.6, '#7fa868'); }
  if (kind === 'clip') { for (const [dx, dy, r] of [[0, 0, .034], [.034, -.006, .026], [-.032, -.008, .026], [.006, .018, .024]]) hm(b.sph(r, PL('#f6e8cf'), .15 + dx, hc + .08 + dy, .19, 1, 1, .4)); }
  if (kind === 'bear') { const h = hm(b.sph(.258, PL('#f6ecd9'), 0, hc + .12, -.03, 1.05, .62, 1.05)); h.rotation.x = -.1; for (const s of [-1, 1]) hm(b.sph(.085, PL('#f6ecd9'), s * .17, top + .09, -.04)); for (let i = 0; i < 5; i++) { const a = i / 5 * PI * 2; hm(b.sph(.022, PL('#f5d8a8'), .21 + Math.cos(a) * .028, hc + .1 + Math.sin(a) * .028, .14)); } hm(b.sph(.014, '#e9a04a', .215, hc + .1, .156)); leaf(b, hm, .185, hc + .15, .13, .6, 1); }
  if (kind === 'straw') { const h = hm(b.sph(.15, PL('#e9c58a'), .08, top + .0, 0, 1.1, .5, 1)); h.rotation.z = -.35; leaf(b, hm, .2, top + .0, 0, .7, -.9); leaf(b, hm, .21, top - .03, .03, .6, -1.4); hm(b.sph(.025, PL('#ffffff'), .12, top + .02, .1, 1.2, .8, .4)); }
  if (kind === 'crown') { hm(b.cyl(.085, .075, .05, BRASS, 0, top - .0, 0, 16)); for (let i = 0; i < 6; i++) { const a = i / 6 * PI * 2; hm(b.cone(.022, .055, BRASS, Math.cos(a) * .075, top + .05, Math.sin(a) * .075, 6)); } hm(b.sph(.018, '#e4587f', 0, top + .03, .082)); }
  if (kind === 'cat') { hm(b.tor(.235, .014, '#5a4038', 0, hc + .03, -.01, PI)).rotation.y = 0; for (const s of [-1, 1]) { hm(b.cone(.06, .1, PL('#5a4038'), s * .12, top - .01, -.01, 4)).rotation.y = PI / 4; hm(b.cone(.034, .06, PL('#f5b6b0'), s * .12, top, .012, 4)).rotation.y = PI / 4; } }
  if (kind === 'chef') { hm(b.cyl(.13, .12, .09, PL('#ffffff'), 0, top - .03, 0, 20)); for (let i = 0; i < 6; i++) { const a = i / 6 * PI * 2; hm(b.sph(.085, PL('#ffffff'), Math.cos(a) * .08, top + .12, Math.sin(a) * .08)); } hm(b.sph(.09, PL('#ffffff'), 0, top + .16, 0)); }
  if (kind === 'wreath') for (let i = 0; i < 14; i++) { const a = i / 14 * PI * 2, c = ['#f5b6b0', '#fff3d6', '#8fb07a', '#f1d27a'][i % 4]; hm(b.sph(i % 2 ? .035 : .028, PL(c), Math.cos(a) * .2, hc + .15 + Math.sin(a * 2) * .008, -.01 + Math.sin(a) * .2)); }
  if (kind === 'sleep') { hm(b.sph(.25, PL('#bcd0e2'), 0, hc + .1, -.01, 1.03, .66, 1.03)); const t = hm(b.cone(.13, .3, PL('#bcd0e2'), .08, top + .0, -.02, 14)); t.rotation.z = -1.0; hm(b.sph(.045, PL('#ffffff'), .3, top + .02, -.02)); hm(b.tor(.25, .03, PL('#ffffff'), 0, hc + .07, -.01)).rotation.x = PI / 2; }
  if (kind === 'frog') { hm(b.sph(.262, PL('#9cc98a'), 0, hc + .1, -.01, 1.03, .68, 1.03)); for (const s of [-1, 1]) { hm(b.sph(.07, PL('#9cc98a'), s * .12, top + .06, .06)); hm(b.sph(.04, '#ffffff', s * .12, top + .07, .11)); hm(b.sph(.02, INK, s * .12, top + .072, .143)); } }
}
function buildChara(rig, def, outfitKey = 'home') {
  if (rig.b) rig.body.remove(rig.b.g);
  const o = def, b = rig.b = new Builder(), g = b.g, J = rig.j = {}, home = outfitKey === 'home'; rig.body.add(g); g.scale.setScalar(HS); rig.outfit = outfitKey; rig.def = def;
  const into = (p, m) => { p.add(m); return m; }, skin = PL('#fbe0cc');
  if (o.body === 'cloud') {   // a walking cloud
    rig.hipY = .1 * HS; const W = PL('#ffffff');
    J.hip = [-1, 1].map(s => grp(g, s * .09, .1, .02)); J.knee = J.hip.map(h => grp(h, 0, -.03, 0)); J.knee.forEach(k => into(k, b.sph(.075, W, 0, -.01, .02, 1, .8, 1.2)));
    J.sh = [-1, 1].map(s => grp(g, s * .24, .3, .04)); J.sh.forEach(sh => into(sh, b.sph(.07, W, 0, -.06, 0, .9, 1.2, .9)));
    const H = J.head = grp(g, 0, .1, 0), hc = .27, hm = m => into(H, m);
    hm(b.sph(.27, W, 0, hc, 0, 1.08, .92, .95)); for (let i = 0; i < 9; i++) { const a = i / 9 * PI * 2 + .3; hm(b.sph(.13 + (i % 3) * .018, W, Math.cos(a) * .24, hc + Math.sin(a) * .2 + .02, -.03 - (i % 2) * .04)); } hm(b.sph(.2, W, 0, hc - .03, -.14));
    rig.eyes = addFace(b, H, hc, o, .25, .1, -.02);
    if (home) { addHat(b, H, hc + .04, state.look?.[o.id]?.hat ?? o.hat, o); const ac = state.look?.[o.id]?.acc ?? o.acc; if (ac === 'scarf') { hm(b.tor(.215, .05, PL(SAGE), 0, hc - .2, .0)).rotation.x = PI / 2; for (let i = 0; i < 5; i++) { const a = i / 5 * PI * 2; hm(b.sph(.02, PL('#fbf3e4'), .08 + Math.cos(a) * .024, hc - .2 + Math.sin(a) * .024, .262)); } } addAcc(b, hm, hc, ac, o, true); }
    rig.prop = grp(g, 0, -.04, .06); return;
  }
  rig.hipY = .24 * HS;
  const L = state.look?.[o.id] || {}, top = outfitKey === 'robe' ? '#fffaf2' : outfitKey === 'pajama' ? '#bcd0e2' : L.top || o.top, ov = home ? (L.ov !== undefined ? L.ov : o.ov) : null, bot = outfitKey === 'pajama' ? '#bcd0e2' : ov || (home ? o.bot : null), T = PL(top);
  J.hip = [-1, 1].map(s => grp(g, s * .062, .24, 0)); J.knee = J.hip.map(h => grp(h, 0, -.1, 0));
  J.hip.forEach((h, i) => { into(h, b.cap(.052, .05, bot ? PL(bot) : skin, 0, -.05, 0)); into(J.knee[i], b.cap(.045, .04, outfitKey === 'pajama' ? PL(bot) : skin, 0, -.04, 0)); into(J.knee[i], b.sph(.062, PL(outfitKey === 'home' ? '#fbf3e4' : '#e9e2d6'), 0, -.095, .02, .9, .62, 1.3)); });
  // body
  b.sph(.142, T, 0, .335, 0, 1, .98, .9);
  if (outfitKey === 'robe') { b.cyl(.1, .165, .26, T, 0, .12, 0, 22); b.tor(.125, .022, PL('#e9dfcf'), 0, .29, 0).rotation.x = PI / 2; }
  else if (ov) { b.cyl(.128, .142, .13, PL(ov), 0, .2, 0, 22); b.box(.17, .12, .03, PL(ov), 0, .3, .118, .014); for (const s of [-1, 1]) { b.box(.035, .16, .025, PL(ov), s * .066, .37, .1, .01).rotation.x = -.35; b.sph(.02, '#e2c08a', s * .062, .395, .135, 1, 1, .5); } if (o.id === 'man') for (const [dx, r] of [[0, .022], [.022, .016], [-.02, .016]]) b.sph(r, PL('#f6ecd9'), dx, .3, .136, 1, 1, .35); }
  else if (bot) b.cyl(.13, .14, .11, PL(bot), 0, .2, 0, 22);
  const hood = b.tor(.105, .05, T, 0, .455, -.012); hood.rotation.x = PI / 2 - .25;
  if (home && o.pom) for (const s of [-1, 1]) { b.cyl(.006, .006, .09, '#fbf3e4', s * .035, .36, .128, 5); b.sph(.022, PL(o.pom), s * .035, .35, .132); }
  J.sh = [-1, 1].map(s => grp(g, s * .135, .415, 0));
  J.sh.forEach(sh => { into(sh, b.cap(.046, .075, T, 0, -.07, 0)); into(sh, b.sph(.052, T, 0, -.004, 0)); into(sh, b.sph(.047, skin, 0, -.158, 0)); });
  // head
  const H = J.head = grp(g, 0, .46, 0), hc = .215, hm = m => into(H, m), hair = PL(o.hair);
  hm(b.sph(.235, skin, 0, hc, 0, 1.08, .95, 1)); for (const s of [-1, 1]) hm(b.sph(.052, skin, s * .246, hc - .035, .0, .7, 1, .9));
  rig.eyes = addFace(b, H, hc, o);
  const cap = hm(b.put(G('hcap2', () => new THREE.SphereGeometry(.25, 30, 22, 0, PI * 2, 0, PI * .57)), hair, 0, hc + .004, -.012)); cap.rotation.x = -.5; cap.scale.set(1.1, 1, 1.02);
  hm(b.sph(.245, hair, 0, hc - .015, -.055, 1.08, 1, .95));
  const lock = (x, y, z, sx, sy, sz, rz = 0, rx = 0) => { const l = hm(b.sph(.1, hair, x, hc + y, z, sx, sy, sz)); l.rotation.set(rx, 0, rz); return l; };
  if (o.style === 'boy') { lock(0, .125, .195, 1.1, .7, .45, -.1); lock(-.12, .1, .17, .9, .55, .45, .7); lock(.125, .1, .17, .9, .55, .45, -.7); lock(-.2, .02, .09, .55, .95, .6, .25); lock(.2, .02, .09, .55, .95, .6, -.25); lock(-.06, .06, .21, .5, .5, .3, .5); lock(.07, .07, .21, .5, .45, .3, -.4); for (const s of [-1, 1]) lock(s * .245, -.1, -.02, .5, .8, .7, s * -.3); const t = lock(-.03, .27, -.01, .5, .75, .45, .5); }
  if (o.style === 'bun') { lock(-.05, .11, .2, 1.2, .78, .45, .25); lock(.12, .1, .17, .85, .6, .45, -.65); lock(-.19, .03, .1, .6, 1.0, .6, .3); lock(.2, .0, .09, .55, .9, .6, -.25); for (const s of [-1, 1]) lock(s * .23, -.13, .0, .7, .9, .8, s * -.2); hm(b.sph(.085, hair, .15, hc + .27, -.03)); hm(b.sph(.07, hair, .23, hc + .2, -.07)); }
  if (o.style === 'bob') { lock(0, .1, .2, .9, .75, .42); lock(-.13, .08, .17, .85, .7, .45, .5); lock(.13, .08, .17, .85, .7, .45, -.5); for (const s of [-1, 1]) { lock(s * .225, -.07, .04, .95, 1.5, 1.0, s * -.12); lock(s * .2, -.2, .02, .9, .7, .9); } }
  if (o.style === 'neat') { for (let i = 0; i < 5; i++) lock(-.14 + i * .07, .1 - Math.abs(i - 2) * .012, .195 - Math.abs(i - 2) * .012, .42, .78, .4, (2 - i) * .1); for (const s of [-1, 1]) { lock(s * .215, -.02, .06, .6, 1.25, .8, s * -.1); lock(s * .2, -.16, .02, .75, .6, .8); } lock(0, .27, -.02, .35, .4, .3); }
  if (home) { addHat(b, H, hc, L.hat ?? o.hat, o); addAcc(b, hm, hc, L.acc ?? o.acc, o, false); }
  rig.prop = grp(g, 0, 0, 0);
}
function addAcc(b, hm, hc, kind, o, cloud) {
  const g = b.g;
  if (kind === 'glasses') { for (const s of [-1, 1]) { const r = hm(b.ns(b.tor(.074, .009, '#8a5236', s * .096, hc - .03, .236))); r.rotation.y = s * .3; } hm(b.box(.05, .009, .009, '#8a5236', 0, hc - .02, .252, .004)); }
  if (kind === 'pack' && !cloud) { b.box(.2, .2, .1, PL('#d9bf94'), 0, .25, -.17, .04); const r = b.cyl(.055, .055, .24, PL(SAGE), 0, .46, -.17, 14); r.rotation.z = PI / 2; r.position.y = .47; for (const s of [-1, 1]) { b.box(.03, .2, .02, PL('#d9bf94'), s * .09, .3, .112, .008); b.box(.036, .03, .026, PL(SAGE), s * .09, .34, .118, .008); } }
  if (kind === 'scarf' && !cloud) { b.tor(.115, .04, PL(SAGE), 0, .455, .0).rotation.x = PI / 2; b.box(.07, .13, .03, PL(SAGE), .07, .33, .125, .012).rotation.z = .15; }
  if (kind === 'bow') { for (const s of [-1, 1]) b.sph(.045, PL('#e4a89c'), s * .045, cloud ? .2 : .43, cloud ? .26 : .135, 1.2, .8, .5); b.sph(.022, PL('#d98a84'), 0, cloud ? .2 : .43, cloud ? .27 : .145); }
  if (kind === 'wings') for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const f = b.sph(.09 - i * .015, PL('#ffffff'), s * (.12 + i * .05), (cloud ? .34 : .4) - i * .05, cloud ? -.26 : -.14, 1.2, .5, .25); f.rotation.z = s * (-.5 - i * .3); }
  if (kind === 'balloon') { b.ns(b.cyl(.003, .003, .5, '#ffffff', .2, .32, 0, 4)); b.sph(.11, M('#f5a6a0', { roughness: .25 }), .2, .92, 0, 1, 1.15, 1); }
}
function newRig(kind) { const root = new THREE.Group(), body = new THREE.Group(); root.add(body); root.userData.ent = kind; scene.add(root); return { root, body, j: {}, cur: { lie: 0, hip: [0, 0], knee: [0, 0], shx: [0, 0], shz: [.2, .2], hx: 0, hy: 0 }, b: null, hop: 0 }; }
const POSE = {
  stand: { lie: 0, hip: [0, 0], knee: [0, 0], shx: [0, 0], shz: [.2, .2], hx: 0 }, sit: { lie: 0, hip: [-1.5, -1.5], knee: [1.45, 1.45], shx: [-.25, -.25], shz: [.2, .2], hx: 0 },
  sitFloor: { lie: 0, hip: [-1.45, -1.45], knee: [.25, .25], shx: [-.5, -.5], shz: [.3, .3], hx: .1 }, lie: { lie: 1, hip: [0, 0], knee: [0, 0], shx: [0, 0], shz: [.3, .3], hx: 0 },
};
function poseRig(rig, dt, time, base, anim, walk) {
  const c = rig.cur, t = POSE[base] || POSE.stand, k = 1 - Math.exp(-dt * 9), mix = (a, b) => a + (b - a) * k; c.lie = mix(c.lie, t.lie);
  let hip = [...t.hip], knee = [...t.knee], shx = [...t.shx], shz = [...t.shz], hx = t.hx, hy = 0, by = 0, sway = 0; const s = Math.sin, br = s(time * 2.1) * .012;
  if (walk) { const w = s(walk); hip = [w * .65, -w * .65]; knee = [Math.max(0, -w) * .7, Math.max(0, w) * .7]; shx = [-w * .55, w * .55]; by = Math.abs(s(walk)) * .03; }
  switch (anim) {
    case 'type': shx = [-1.15 + s(time * 9) * .06, -1.15 + s(time * 9 + 2) * .06]; shz = [.05, .05]; hx = .12; break;
    case 'read': shx = [-1.05, -1.05]; shz = [-.25, -.25]; hx = .28 + s(time * .7) * .04; hy = s(time * .5) * .12; break;
    case 'eat': shx = [-.9, -1.0 - Math.max(0, s(time * 2.2)) * .9]; shz = [.1, 0]; hx = .1 + Math.max(0, s(time * 2.2)) * .12; break;
    case 'stir': shx = [-.5, -1.05 + s(time * 5) * .12]; shz = [.2, s(time * 5 + 1.5) * .2]; hx = .2; break;
    case 'wash': shx = [-1.0 + s(time * 6) * .1, -1.0 - s(time * 6) * .1]; shz = [-.1, -.1]; hx = .25; break;
    case 'water': shx = [-.2, -1.1]; shz = [.2, .1 + s(time * 1.5) * .1]; hx = .15; hy = -.2; break;
    case 'stretch': { const u = (s(time * 1.2) + 1) / 2; shz = [.3 + u * 2.5, .3 + u * 2.5]; by = u * .02; sway = s(time * .6) * .12 * u; hx = -u * .15; break; }
    case 'pet': shx = [-.9 + s(time * 4) * .25, -.5]; shz = [0, .3]; hx = .25; hy = -.15; break;
    case 'piano': shx = [-1.1 + s(time * 6) * .1, -1.1 + s(time * 6 + 2.4) * .1]; shz = [.15 + s(time * 1.3) * .15, .15 - s(time * 1.3) * .15]; hx = .1; hy = s(time * 1.3) * .12; break;
    case 'gaze': shx = [-.2, -.9]; shz = [.2, 0]; hx = -.28; break;
    case 'soak': shx = [-.6, -.6]; shz = [.9, .9]; hx = -.18 + s(time * .8) * .03; break;
    case 'makeup': shx = [-.3, -1.9 + s(time * 3) * .12]; shz = [.2, -.35]; hx = .05; hy = s(time * .9) * .1; break;
    case 'tv': shx = [-.45, -.45]; shz = [.1, .1]; hy = s(time * .4) * .06; break;
    case 'wave': shz = [.2, 2.5 + s(time * 12) * .3]; break;
    case 'swing': shx = [-.3, -.3]; sway = s(time * 1.4) * .08; break;
    case 'search': shx = [-1.6 + s(time * 2) * .3, -.3]; shz = [0, .2]; hx = -.12; hy = s(time * 1.1) * .2; break;
    case 'paint': shx = [-.3, -1.3 + s(time * 2.4) * .35]; shz = [.2, s(time * 1.7) * .25]; hy = s(time * .8) * .1; break;
    case 'dance': { const w = s(time * 7); hip = [w * .35, -w * .35]; shz = [1.4 + w * .7, 1.4 - w * .7]; by = Math.abs(s(time * 7)) * .07; sway = s(time * 3.5) * .16; hy = s(time * 3.5) * .3; break; }
    case 'run': { const w = s(time * 13); hip = [w * .9, -w * .9]; knee = [Math.max(0, -w) * 1.1, Math.max(0, w) * 1.1]; shx = [-w * .9, w * .9]; by = Math.abs(w) * .04; hx = .12; break; }
    case 'jump': { const u = Math.abs(s(time * 3.2)); by = u * .55; shz = [.3 + u * 2, .3 + u * 2]; knee = [(1 - u) * .7, (1 - u) * .7]; hip = [-(1 - u) * .5, -(1 - u) * .5]; break; }
    case 'hi5': shx = [0, -2.7]; shz = [.2, .15]; break;
    case 'hug': shx = [-1.35, -1.35]; shz = [-.35, -.35]; hx = .1; break;
    case 'write': shx = [-.5, -1.05 + s(time * 7) * .05]; shz = [.15, -.1 + s(time * 3.5) * .08]; hx = .32; hy = s(time * .6) * .08; break;
    case 'sip': shx = [-.9, -1.1 - Math.max(0, s(time * 1.3)) * .7]; shz = [-.2, -.2]; hx = Math.max(0, s(time * 1.3)) * -.12; break;
  }
  for (let i = 0; i < 2; i++) { c.hip[i] = mix(c.hip[i], hip[i]); c.knee[i] = mix(c.knee[i], knee[i]); c.shx[i] = mix(c.shx[i], shx[i]); c.shz[i] = mix(c.shz[i], shz[i]); }
  c.hy = mix(c.hy, hy); c.hx = mix(c.hx, hx); const j = rig.j;
  j.hip[0].rotation.x = c.hip[0]; j.hip[1].rotation.x = c.hip[1]; j.knee[0].rotation.x = c.knee[0]; j.knee[1].rotation.x = c.knee[1];
  j.sh[0].rotation.x = c.shx[0]; j.sh[1].rotation.x = c.shx[1]; j.sh[0].rotation.z = -c.shz[0]; j.sh[1].rotation.z = c.shz[1];
  j.head.rotation.set(c.hx, c.hy, sway * .5); rig.body.rotation.set(-c.lie * PI / 2, 0, sway); rig.body.position.y = by * HS + (c.lie < .5 ? br : 0) + (rig.hop > 0 ? Math.sin(Math.min(rig.hop, 1) * PI) * .18 : 0);
  if (rig.hop > 0) { rig.hop += dt * 4.2; if (rig.hop >= 1) rig.hop = 0; }
  const blink = (time % 3.3) > 3.16 || anim === 'sleep'; for (const e of rig.eyes) e.scale.y = blink ? .12 : 1;
}
function setProp(rig, kind) {
  const p = rig.prop; p.clear(); if (!kind) return; const b = new Builder();
  if (kind === 'paper') { b.box(.26, .2, .008, '#f4efe4', 0, .3, .23, .003).rotation.x = -.5; for (let i = 0; i < 4; i++) b.ns(b.box(.2, .008, .002, '#b9b2a6', 0, .345 + i * .03, .242 - i * .017, .001)).rotation.x = -.5; }
  if (kind === 'letter') { b.box(.15, .2, .006, '#fffaf0', 0, .31, .23, .002).rotation.x = -.5; b.ns(b.sph(.012, '#d9776e', 0, .34, .23)); }
  if (kind === 'book') { b.box(.2, .15, .025, PL(SAGE), 0, .3, .22, .008).rotation.x = -.6; b.box(.18, .13, .014, WHITE, 0, .308, .226, .003).rotation.x = -.6; }
  if (kind === 'bowl') b.cyl(.055, .035, .04, WHITE, 0, .2, .28, 16);
  if (kind === 'cup') { b.cyl(.05, .042, .07, PL('#f6ecd9'), 0, .26, .22, 16); b.sph(.014, '#c9a06a', 0, .3, .268, 1, 1.2, .3); }
  if (kind === 'can') { b.cyl(.05, .055, .09, 'acc3', .16, .29, .22, 14); b.cyl(.008, .012, .11, 'acc3', .16, .33, .3, 6).rotation.x = 1.1; }
  if (kind === 'ladle') b.cyl(.008, .008, .16, 'wood2', .15, .3, .22, 6).rotation.x = .9;
  if (kind === 'brush') { b.cyl(.007, .007, .16, 'wood2', .16, .3, .2, 6).rotation.x = 1.2; b.sph(.014, '#e4a89c', .16, .37, .28); }
  p.add(b.g);
}
function buildPet(rig, def) {
  if (rig.b) rig.body.remove(rig.b.g); const b = rig.b = new Builder(), g = b.g, c = PL(def.c), c2 = PL(def.c2), dog = def.kind === 'dog'; rig.body.add(g); g.scale.setScalar(1.15); rig.def = def;
  b.sph(.12, c, 0, .14, 0, .88, .82, 1.3); b.sph(.07, c2, 0, .11, .06, .8, .6, 1); const H = rig.head = grp(g, 0, .25, .15), hm = m => { H.add(m); m.position.sub(H.position); return m; };
  hm(b.sph(.105, c, 0, .25, .15, 1.05, .92, .95));
  for (const s of [-1, 1]) {
    if (dog) hm(b.sph(.048, def.id === 'dog0' ? PL('#b9854f') : c2, s * .09, .28, .13, .55, 1.2, .8)).rotation.z = s * .5; else { hm(b.cone(.045, .075, c, s * .062, .315, .14, 4)).rotation.y = PI / 4; hm(b.cone(.024, .042, '#f5b6b0', s * .062, .322, .153, 4)).rotation.y = PI / 4; }
    hm(b.sph(.017, INK, s * .044, .268, .24, 1, 1.25, .5)); hm(b.sph(.005, '#fff', s * .044 + .006, .275, .25)); hm(b.ns(b.sph(.018, blushM(), s * .072, .24, .225, 1, .6, .3))); for (const z of [-.1, .1]) b.cyl(.027, .024, .07, c, s * .06, 0, z, 10);
  }
  if (dog) { hm(b.sph(.045, c2, 0, .235, .245, 1, .75, .9)); hm(b.sph(.014, INK, 0, .25, .285)); } else { hm(b.sph(.03, c2, 0, .238, .24, 1.3, .7, .5)); hm(b.sph(.009, '#e79a94', 0, .246, .256)); }
  const tail = dog ? b.cap(.024, .06, c, 0, .25, -.19) : b.cap(.024, .1, c, 0, .27, -.21); tail.rotation.x = dog ? -.9 : -.6; rig.tail = grp(g, 0, .18, -.15); rig.tail.add(tail); tail.position.sub(rig.tail.position);
  if (dog) b.tor(.062, .012, 'acc2', 0, .2, .1).rotation.x = PI / 2 - .5;
}
