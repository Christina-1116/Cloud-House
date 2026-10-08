
/* ═════════════ the apartment shell ═════════════ */
const houseRoot = new THREE.Group(); scene.add(houseRoot);
const staticBlocks = [], REF = {};
function slab(w, h, d, cx, cy, cz, mat, cast = true) {
  const g = new THREE.BoxGeometry(w, h, d); g.translate(cx, cy, cz); boxUV(g);
  const m = new THREE.Mesh(g, MT[mat] || (mat.isMaterial ? mat : M(mat))); m.castShadow = cast; m.receiveShadow = true; houseRoot.add(m); return m;
}
function soft(w, h, d, cx, cy, cz, mat, r = .06) { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2 - .001, h / 2 - .001, d / 2 - .001)), MT[mat] || mat); m.position.set(cx, cy, cz); m.castShadow = m.receiveShadow = true; houseRoot.add(m); return m; }
function windowAt(axis, h) {
  const P = (u, y, d) => axis === 'x' ? [u, y, d] : [d, y, u], S = (lu, ly, ld) => axis === 'x' ? [lu, ly, ld] : [ld, ly, lu];
  const piece = (lu, ly, ld, u, y, d, mat = 'cream') => slab(...S(lu, ly, ld), ...P(u, y, d), mat);
  const uc = (h.a0 + h.a1) / 2, uw = h.a1 - h.a0, yc = (h.y0 + h.y1) / 2, yh = h.y1 - h.y0, f = .05;
  piece(uw + .1, f, T + .05, uc, h.y1 + f / 2, -T / 2); piece(uw + .24, f, T + .2, uc, h.y0 - f / 2, -T / 2 + .06, 'wood');
  piece(f, yh, T + .05, h.a0 - f / 2, yc, -T / 2); piece(f, yh, T + .05, h.a1 + f / 2, yc, -T / 2); piece(.04, yh, .04, uc, yc, -T / 2); piece(uw, .04, .04, uc, yc + yh * .12, -T / 2);
  const gl = piece(uw, yh, .01, uc, yc, -T / 2 - .03, GLASS); gl.castShadow = false;
  { const b = new Builder(); b.plant(0, 0, 0, 1.1, '#f6ecd9'); b.g.position.set(...P(uc + uw * .25, h.y0, .05)); houseRoot.add(b.g); }
  if (h.curtain) {
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(.014, .014, uw + .7, 8), MT.wood2); rod.rotation[axis === 'x' ? 'z' : 'x'] = PI / 2; rod.position.set(...P(uc, h.y1 + .16, .07)); houseRoot.add(rod);
    for (const u of [h.a0 - .1, h.a1 + .1]) {
      const g = new THREE.PlaneGeometry(.42, yh + .42, 30, 1), p = g.attributes.position;
      for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), w = .03 * Math.sin(x / .42 * PI * 5) + .012; axis === 'x' ? p.setXYZ(i, x, y, w) : p.setXYZ(i, w, y, x); }
      g.computeVertexNormals(); g.translate(...P(u, h.y1 + .15 - (yh + .42) / 2, .07)); houseRoot.add(new THREE.Mesh(g, M('#fbf3e6', { side: THREE.DoubleSide, roughness: 1 })));
    }
  }
}
function tall(axis, a0, a1, holes = [], mat = 'wall') {
  const seg = (u0, u1, y0, y1) => { if (u1 - u0 < .001 || y1 - y0 < .001) return; axis === 'x' ? slab(u1 - u0, y1 - y0, T, (u0 + u1) / 2, (y0 + y1) / 2, -T / 2, mat) : slab(T, y1 - y0, u1 - u0, -T / 2, (y0 + y1) / 2, (u0 + u1) / 2, mat); };
  let u = a0; for (const h of holes) { seg(u, h.a0, 0, WH); seg(h.a0, h.a1, 0, h.y0); seg(h.a0, h.a1, h.y1, WH); windowAt(axis, h); u = h.a1; } seg(u, a1, 0, WH);
}
function partition(x0, x1, z0, z1, h = PH) { soft(x1 - x0 + .04, h, z1 - z0 + .04, (x0 + x1) / 2, h / 2, (z0 + z1) / 2, 'wall', .06); soft(x1 - x0 + .07, .05, z1 - z0 + .07, (x0 + x1) / 2, h + .01, (z0 + z1) / 2, 'wood', .02); staticBlocks.push({ x0, x1, z0, z1 }); }
{
  slab(HX, .04, HZ, HX / 2, -.02, HZ / 2, 'floor', false);
  slab(3, .012, 2.6, 1.5, .006, 1.3, 'tile', false); slab(3.4, .012, 2.6, 4.7, .006, 1.3, 'tile', false); slab(3, .012, 2.6, 1.5, .006, 6.7, 'deck', false);
  const base = new THREE.Mesh(new RoundedBoxGeometry(HX + T + .7, .5, HZ + T + .7, 5, .22), MT.cream); base.position.set(HX / 2 - T / 2, -.29, HZ / 2 - T / 2); base.receiveShadow = true; houseRoot.add(base);
  tall('x', -T, 3, [{ a0: 1.45, a1: 2.45, y0: 1.3, y1: 2.05, curtain: 1 }], 'back'); tall('x', 3, 6.4, [], 'back');
  tall('x', 6.4, HX + T, [{ a0: 6.72, a1: 7.72, y0: 1.0, y1: 2.05, curtain: 1 }]);
  tall('z', 0, 2.6, [], 'back'); tall('z', 2.6, 5.4 + T / 2, [{ a0: 3.55, a1: 4.85, y0: 1.05, y1: 2.05, curtain: 1 }]);
  soft(HX + T * 2 + .1, .12, T + .1, HX / 2, WH + .04, -T / 2, 'cream', .06); soft(T + .1, .12, 5.4 + T / 2 + .06, -T / 2, WH + .04, 2.7 + T / 4, 'cream', .06);
  slab(HX, .09, .02, HX / 2, .045, .01, 'cream', false); slab(.02, .09, 5.4, .01, .045, 2.7, 'cream', false);
  partition(3 - T / 2, 3 + T / 2, 0, 2.6); partition(0, 1.9, 2.6 - T / 2, 2.6 + T / 2); partition(6.4 - T / 2, 6.4 + T / 2, 0, 2.3);
  partition(6.4 - T / 2, HX, 3.4 - T / 2, 3.4 + T / 2); partition(3 - T / 2, 3 + T / 2, 3.7, 5.4); partition(0, 1.7, 5.4 - T / 2, 5.4 + T / 2);
  soft(HX - 3 + T + .04, .34, T + .06, 3 + (HX - 3 + T) / 2, .15, HZ + T / 2, 'wall', .07); soft(T + .06, .34, HZ + T + .04, HX + T / 2, .15, HZ / 2 + T / 2, 'wall', .07);
  slab(HX - 3 + T, .03, T + .03, 3 + (HX - 3 + T) / 2, .335, HZ + T / 2, 'wood'); slab(T + .03, .03, HZ + T, HX + T / 2, .335, HZ / 2 + T / 2, 'wood'); slab(T, WH, T, HX + T / 2, WH / 2, -T / 2, 'wall');
  const post = new THREE.CylinderGeometry(.02, .02, .7, 8);
  for (let x = .12; x < 3; x += .2) { const m = new THREE.Mesh(post, MT.wood); m.position.set(x, .35, HZ + T / 2); m.castShadow = true; houseRoot.add(m); }
  for (let z = 5.6; z < HZ + .1; z += .2) { const m = new THREE.Mesh(post, MT.wood); m.position.set(-T / 2, .35, z); m.castShadow = true; houseRoot.add(m); }
  soft(3 + T, .06, .1, 1.5 - T / 2, .72, HZ + T / 2, 'wood', .025); soft(.1, .06, HZ - 5.4 + T, -T / 2, .72, (5.4 + HZ + T) / 2, 'wood', .025); slab(3 + T, .06, T, 1.5 - T / 2, .03, HZ + T / 2, 'cream'); slab(T, .06, HZ - 5.4, -T / 2, .03, (5.4 + HZ) / 2, 'cream');
  // doorstep, rope ladder, and the cloud the house rides on
  soft(.6, .12, .3, 4.9, -.1, HZ + T + .16, 'cream', .04); soft(.5, .1, .26, 4.9, -.24, HZ + T + .4, 'cream', .04);
  for (const [lx, lz, n] of [[2.2, HZ + .9, 5], [HX - .6, HZ + 1.0, 4]]) for (let i = 0; i < n; i++) { const r = new THREE.Mesh(new THREE.CylinderGeometry(.022, .022, .34, 8), MT.wood); r.rotation.z = PI / 2; r.position.set(lx, -1.0 - i * .22, lz + i * .05); houseRoot.add(r); for (const s of [-1, 1]) { const rope = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .24, 6), MT.wood2); rope.position.set(lx + s * .15, -.9 - i * .22, lz + i * .05); houseRoot.add(rope); } }
  const cm = M('#ffffff', { roughness: 1, bumpMap: fuzzTex, bumpScale: 1.2 }), puff = new THREE.SphereGeometry(1, 22, 16), cx = HX / 2 - T / 2, cz = HZ / 2 - T / 2, n = 40;
  for (let i = 0; i < n; i++) {
    const a = i / n * PI * 2, c = Math.cos(a), s = Math.sin(a), k = 1 / Math.max(Math.abs(c) / (HX / 2 + .45), Math.abs(s) / (HZ / 2 + .45)), near = c + s > .3, r = (near ? .55 : .8) + ((i * 7) % 5) * (near ? .08 : .14);
    const m = new THREE.Mesh(puff, cm); m.position.set(cx + c * k, (near ? -.95 : -.7) - ((i * 3) % 4) * .08, cz + s * k); m.scale.set(r, r * .74, r); m.receiveShadow = true; houseRoot.add(m);
  }
  for (const [x, y, z, r] of [[cx, -1.6, cz, 5.2], [-1.4, -.5, 4, 1.5], [-1.5, .1, 1.2, 1.1], [HX + 1.3, -.6, 2.5, 1.3], [3, -.9, -1.2, 1.4], [7, -.8, -1.1, 1.2]]) { const m = new THREE.Mesh(puff, cm); m.position.set(x, y, z); m.scale.set(r, r * (r > 3 ? .24 : .7), r > 3 ? r * .82 : r); houseRoot.add(m); }
  { const b = new Builder(); b.sph(.5, cm, 0, 0, 0, 1, .7, 1); b.sph(.34, cm, .4, -.05, .1, 1, .7, 1); b.plant(.05, .32, 0, 2.2); b.g.position.set(HX + .9, -1.5, HZ + .6); houseRoot.add(b.g); }
}

/* ═════════════ furniture catalogue ═════════════ */
const F = {
  bed(b) {
    b.box(1.6, .2, 2.1, 'wood', 0, .1, 0, .05); b.legs([-.7, .7], [-.95, .95], .1, .04); b.box(1.5, .2, 2, WHITE, 0, .28, 0, .09);
    b.box(1.66, .75, .12, 'wood', 0, .1, -1.02, .05); b.box(1.5, .5, .1, 'acc2', 0, .42, -.94, .05);
    b.box(.6, .13, .4, WHITE, -.37, .47, -.68, .06); b.box(.6, .13, .4, WHITE, .37, .47, -.68, .06);
    b.box(1.56, .1, 1.2, 'acc', 0, .46, .22, .05); for (let i = 0; i < 5; i++) b.box(.02, .012, 1.15, 'cream', -.6 + i * .3, .555, .22, .004); b.box(1.56, .12, .5, 'acc2', 0, .47, .78, .06); b.box(1.56, .1, .2, WHITE, 0, .475, -.42, .05);
    for (let i = 0; i < 5; i++) { const a = i / 5 * PI * 2; b.sph(.075, PL('#f1b3a8'), Math.cos(a) * .08, .58, -.38 + Math.sin(a) * .08, 1, .5, 1); } b.sph(.045, PL('#f6dc9a'), 0, .6, -.38, 1, .6, 1);
    return [1.6, 2.1];
  },
  nightstand(b) { b.box(.5, .36, .44, 'cream', 0, .1, 0); b.box(.54, .03, .48, 'wood', 0, .46, 0, .012); b.legs([-.2, .2], [-.17, .17], .1); b.box(.36, .12, .02, WHITE, 0, .26, .22, .008); b.sph(.018, 'wood2', 0, .32, .235); b.cyl(.07, .08, .03, 'wood2', 0, .49, 0); b.cyl(.012, .012, .2, 'wood2', 0, .5, 0, 8); b.ns(b.cyl(.09, .14, .17, b.glow('#fff0d2', 1.8), 0, .68, 0)); b.lamp(0, .78, .25, '#ffdfae'); return [.5, .45]; },
  wardrobe(b) { b.box(1.2, 1.7, .58, 'cream', 0, .08, 0, .05); b.box(1.26, .05, .62, 'wood', 0, 1.78, 0, .02); b.box(1.24, .08, .6, 'wood', 0, 0, 0, .02); for (const s of [-1, 1]) { b.box(.56, 1.5, .03, 'acc', s * .295, .16, .29, .012); b.box(.03, .2, .03, 'wood2', s * .07, .85, .31, .01); } b.box(.5, .16, .36, 'acc2', -.25, 1.83, 0, .05); b.box(.4, .12, .3, 'wood2', .3, 1.83, 0, .04); return [1.2, .6]; },
  vanity(b) {
    b.box(1, .05, .48, 'wood', 0, .68, 0, .02); for (const s of [-1, 1]) { b.box(.3, .26, .42, 'cream', s * .33, .42, 0); b.sph(.016, 'wood2', s * .33, .55, .22); } b.legs([-.44, .44], [-.18, .18], .44, .02);
    b.box(.4, .08, .06, 'wood', 0, .73, -.18); b.tor(.27, .03, 'wood', 0, 1.12, -.19); b.disc(.26, MIRROR, 0, 1.12, -.186); const gm = b.glow('#fff1d6', 2); for (let i = 0; i < 8; i++) { const a = i / 8 * PI * 2 + .4; b.ns(b.sph(.024, gm, Math.cos(a) * .27, 1.12 + Math.sin(a) * .27, -.16)); }
    b.cyl(.028, .032, .07, 'acc2', -.36, .73, .02, 12); b.sph(.016, BRASS, -.36, .815, .02); b.box(.06, .09, .04, 'acc3', .36, .73, -.04, .012); b.cyl(.04, .04, .02, 'acc', .22, .73, .08, 14); b.lamp(0, 1.1, .3, '#ffe6c8');
    b.cyl(.17, .17, .07, 'acc2', 0, .37, .55); b.cyl(.16, .15, .03, 'wood', 0, .34, .55); for (const x of [-.1, .1]) for (const z of [.45, .65]) b.cyl(.018, .014, .34, 'wood2', x, 0, z, 8);
    return [1, .5];
  },
  bench(b) { b.box(.62, .05, .34, 'wood', 0, .37, 0, .02); b.legs([-.25, .25], [-.12, .12], .37, .024); return [.6, .34]; },
  tub(b) {
    b.box(1.7, .1, .8, 'cream', 0, 0, 0, .04); for (const z of [-.355, .355]) b.box(1.7, .52, .09, 'cream', 0, 0, z, .045); for (const x of [-.805, .805]) b.box(.09, .52, .68, 'cream', x, 0, 0, .045);
    b.ns(b.box(1.54, .3, .64, new THREE.MeshStandardMaterial({ color: '#bfe3ea', transparent: true, opacity: .72, roughness: .15 }), 0, .1, 0, .02)).receiveShadow = false;
    b.cyl(.018, .018, .22, 'wood2', .62, .5, -.36, 8); b.box(.03, .03, .16, 'wood2', .62, .7, -.29, .01); b.sph(.05, '#f4d27a', -.35, .43, .12, 1.1, .8, 1); b.sph(.032, '#f4d27a', -.31, .48, .12); b.cone(.012, .03, '#e8956a', -.275, .47, .12, 8).rotation.z = -PI / 2;
    return [1.7, .8];
  },
  sinkCab(b) { b.box(.9, .56, .46, 'acc', 0, .08, 0); b.box(.94, .04, .5, 'wood', 0, .64, 0, .015); b.box(.9, .08, .44, 'cream', 0, 0, 0, .02); for (const s of [-1, 1]) { b.box(.4, .42, .02, 'acc', s * .22, .16, .235, .008); b.box(.03, .1, .02, 'wood2', s * .06, .4, .25, .008); } b.sph(.2, WHITE, 0, .7, .02, 1.25, .3, .8); b.cyl(.014, .014, .16, 'wood2', 0, .68, -.2, 8); b.box(.025, .025, .12, 'wood2', 0, .83, -.15, .008); b.cyl(.03, .03, .08, 'acc2', .34, .68, -.12, 12); return [.9, .5]; },
  washer(b) { b.box(.6, .78, .58, WHITE, 0, .02, 0, .06); b.tor(.17, .03, 'cream', 0, .4, .295); b.ns(b.disc(.16, M('#a9c6cc', { roughness: .2 }), 0, .4, .3)); b.box(.3, .04, .02, 'acc3', -.1, .7, .295, .008); b.sph(.03, 'wood', .2, .72, .295, 1, 1, .4); b.box(.46, .08, .4, 'acc2', 0, .8, 0, .035); b.box(.44, .07, .38, 'acc', 0, .88, 0, .03); b.box(.42, .06, .36, 'cream', 0, .95, 0, .028); return [.6, .6]; },
  counter(b) {   // worktop at 0.76 m so the residents can see into the pot
    b.box(2.1, .62, .56, 'acc', 0, .08, 0, .03); b.box(2.14, .05, .62, 'wood', 0, .7, 0, .02); b.box(2.08, .08, .52, 'cream', 0, 0, 0, .02);
    for (let i = 0; i < 4; i++) { b.box(.48, .48, .02, 'acc', -.78 + i * .52, .15, .285, .01); b.box(.1, .025, .025, 'wood2', -.78 + i * .52 + (i % 2 ? -.14 : .14), .54, .3, .008); }
    b.box(.7, .02, .46, INK, -.5, .75, 0, .008); for (const [x, z] of [[-.67, -.1], [-.33, -.1], [-.67, .11], [-.33, .11]]) b.tor(.075, .012, '#e9e4da', x, .772, z).rotation.x = PI / 2;
    b.cyl(.1, .1, .1, 'cream', -.67, .77, -.1); b.cyl(.105, .105, .02, 'cream', -.67, .87, -.1); b.sph(.02, 'wood2', -.67, .9, -.1);
    b.box(.62, .02, .4, STEEL, .55, .74, .02, .008); b.box(.5, .02, .3, '#dfe8e8', .55, .745, .02, .008); b.cyl(.014, .014, .2, 'wood2', .55, .75, -.22, 8); b.box(.025, .025, .14, 'wood2', .55, .94, -.16, .008); b.lamp(0, 1.4, .5, '#ffe9c8');
    return [2.1, .6];
  },
  fridge(b) { b.box(.7, 1.5, .68, WHITE, 0, .04, 0, .1); b.box(.66, .012, .01, 'wood2', 0, 1.0, .342, .004); b.box(.035, .2, .035, 'wood2', -.25, 1.1, .355, .012); b.box(.035, .28, .035, 'wood2', -.25, .62, .355, .012); b.box(.14, .14, .008, 'acc', .12, 1.16, .344, .003).rotation.z = .12; b.box(.1, .12, .008, 'acc2', .2, .72, .344, .003).rotation.z = -.1; return [.7, .7]; },
  table(b) { b.box(1.5, .06, .9, 'wood', 0, .64, 0, .03); b.legs([-.64, .64], [-.36, .36], .64, .035, 'wood'); b.box(.42, .008, .92, 'cream', 0, .7, 0, .003); for (const [x, z] of [[-.4, -.2], [.42, .22]]) b.cyl(.13, .1, .02, WHITE, x, .7, z, 24); b.cyl(.04, .035, .07, 'acc2', -.52, .7, .2, 14); b.cyl(.04, .035, .07, 'acc', .3, .7, -.24, 14); b.cyl(.045, .06, .14, 'acc2', 0, .708, 0, 14); for (let i = 0; i < 3; i++) { b.cyl(.004, .004, .16, LEAF2, (i - 1) * .02, .84, 0, 5).rotation.z = (1 - i) * .2; b.sph(.022, WHITE, (i - 1) * .05, 1.01, 0, 1, 1.3, 1); } return [1.5, .9]; },
  chair(b, o) { b.box(.42, .05, .42, 'wood', 0, .36, 0, .02); b.box(.36, .06, .36, o.c || 'acc', 0, .4, 0, .028); b.legs([-.17, .17], [-.17, .17], .36, .024, 'wood'); for (const x of [-.17, .17]) b.box(.045, .5, .045, 'wood', x, .38, -.185, .015); b.box(.42, .2, .05, 'wood', 0, .66, -.185, .022); return [.44, .44]; },
  desk(b) {
    b.box(1.3, .05, .6, 'wood', 0, .64, 0, .02); b.box(.36, .52, .5, 'cream', .43, .1, 0, .02); for (let i = 0; i < 3; i++) { b.box(.3, .13, .02, WHITE, .43, .15 + i * .16, .255, .008); b.sph(.014, 'wood2', .43, .215 + i * .16, .27); } b.legs([-.58], [-.24, .24], .64, .026, 'wood'); b.box(.4, .1, .4, 'cream', .43, 0, 0, .02);
    b.box(.2, .02, .14, INK, -.1, .69, -.12, .008); b.box(.03, .14, .03, INK, -.1, .7, -.14, .01); b.box(.52, .34, .03, 'acc3', -.1, .82, -.15, .012); REF.monitor = b.glow('#dff1f4', 1.1); REF.monitor.userData.sw = 0; b.ns(b.put(G('mon', () => new THREE.PlaneGeometry(.46, .28)), REF.monitor, -.1, .99, -.133));
    b.box(.3, .015, .11, '#e9e4da', -.1, .69, .12, .005); b.sph(.03, '#e9e4da', .16, .7, .12, 1, .5, 1.4); b.cyl(.04, .035, .08, 'acc2', -.5, .69, .12, 14); b.cyl(.07, .08, .025, 'wood2', -.5, .69, -.16); b.cyl(.012, .012, .22, 'wood2', -.5, .71, -.16, 8); b.ns(b.cyl(.07, .12, .14, b.glow('#fff0d2', 1.8), -.5, .91, -.16)); b.lamp(-.4, 1.0, .2, '#ffe0b0');
    return [1.3, .6];
  },
  bookshelf(b) { b.box(1, 1.5, .03, 'cream', 0, 0, -.15, .01); for (const s of [-1, 1]) b.box(.04, 1.5, .34, 'wood', s * .48, 0, 0, .012); for (let i = 0; i < 5; i++) b.box(.96, .035, .34, 'wood', 0, .02 + i * .365, 0, .012); const cols = ['acc', 'acc2', 'acc3', 'cream', 'wood2', WHITE]; for (let r = 0; r < 4; r++) { let x = -.42, k = r * 5; while (x < (r === 2 ? .1 : .3)) { const w = .04 + ((k * 7) % 3) * .012, hh = .2 + ((k * 5) % 4) * .028; b.box(w, hh, .22, cols[k % 6], x + w / 2, .055 + r * .365, 0, .008); x += w + .004; k++; } } b.plant(.3, .055 + 2 * .365, 0, 1.2); b.cyl(.05, .05, .09, 'acc2', .36, .055 + 3 * .365, 0, 14); b.box(.3, .2, .22, 'wood2', -.2, 1.5, 0, .03); b.plant(.3, 1.5, 0, 1.3, 'cream'); return [1, .36]; },
  piano(b) {
    b.box(1.2, .9, .34, 'wood2', 0, .06, -.05, .03); b.box(1.24, .04, .38, 'wood', 0, .96, -.05, .015); b.box(1.2, .08, .22, 'wood2', 0, .58, .2, .02); b.box(1.12, .02, .15, WHITE, 0, .665, .21, .006); for (let i = 0; i < 18; i++) if (i % 7 !== 2 && i % 7 !== 6) b.box(.03, .02, .09, INK, -.52 + i * .061, .68, .18, .005);
    for (const s of [-1, 1]) { b.box(.07, .58, .2, 'wood2', s * .56, 0, .2, .02); b.box(.1, .06, .36, 'wood2', s * .5, 0, -.02, .02); } b.box(.4, .26, .015, 'cream', 0, .74, .08, .005).rotation.x = -.2; b.plant(-.42, 1.0, -.05, 1.1, 'acc2');
    b.cyl(.17, .17, .07, 'acc', 0, .37, .62); b.cyl(.16, .15, .03, 'wood', 0, .34, .62); for (const x of [-.1, .1]) for (const z of [.52, .72]) b.cyl(.018, .014, .34, 'wood2', x, 0, z, 8);
    return [1.2, .5];
  },
  storage(b) { for (const s of [-1, 1]) for (const z of [-.16, .16]) b.box(.04, .98, .04, 'wood', s * .47, 0, z, .012); for (let i = 0; i < 3; i++) b.box(1, .03, .38, 'wood', 0, .1 + i * .42, 0, .012); b.box(.4, .26, .3, 'wood2', -.24, .13, 0, .04); b.box(.4, .26, .3, 'wood2', .24, .13, 0, .04); b.box(.38, .2, .28, 'acc', -.24, .55, 0, .06); b.box(.34, .08, .26, 'cream', .24, .55, 0, .03); b.box(.34, .07, .26, 'acc2', .24, .63, 0, .03); b.box(.36, .07, .26, 'acc', .2, .97, 0, .03); b.plant(-.26, .97, 0, 1.5); return [1, .4]; },
  sofa(b) { b.box(2, .26, .86, 'fabric', 0, .1, 0, .12); b.box(2, .46, .22, 'fabric', 0, .3, -.32, .11); for (const s of [-1, 1]) { b.box(.22, .32, .86, 'fabric', s * .89, .26, 0, .11); b.box(.76, .13, .52, 'fabric', s * .39, .34, .08, .065); } for (const x of [-.85, .85]) for (const z of [-.33, .33]) b.cyl(.03, .022, .1, 'wood2', x, 0, z, 10); b.box(.32, .28, .12, 'acc2', -.62, .47, -.12, .055).rotation.set(-.3, .2, 0); b.box(.3, .26, .12, 'acc', .6, .47, -.12, .055).rotation.set(-.3, -.25, 0); b.box(.28, .24, .1, 'acc2', .36, .47, -.14, .05).rotation.set(-.3, .1, 0); return [2, .9]; },
  coffee(b) { b.box(1.1, .05, .6, 'wood', 0, .33, 0, .022); b.legs([-.46, .46], [-.22, .22], .33, .028, 'wood'); b.box(.9, .03, .44, 'wood', 0, .12, 0, .012); b.cyl(.04, .035, .07, 'acc2', .3, .38, .1, 14); b.box(.26, .012, .19, 'cream', -.25, .38, -.05, .004).rotation.y = .3; b.box(.24, .012, .18, 'acc3', -.24, .392, -.05, .004).rotation.y = .1; b.cyl(.04, .05, .06, 'cream', .05, .38, -.12, 12); b.sph(.03, PL('#f1b3a8'), .05, .47, -.12); return [1.1, .6]; },
  tv(b) { b.box(1.7, .36, .4, 'wood', 0, .1, 0, .025); b.legs([-.75, .75], [-.14, .14], .1, .026); for (const s of [-1, 1]) { b.box(.76, .22, .02, 'wood', s * .41, .17, .2, .01); b.box(.14, .02, .02, 'wood2', s * .41, .32, .212, .006); } b.box(.3, .03, .16, INK, .1, .46, 0, .01); b.box(.05, .1, .04, INK, .1, .48, -.02, .012); b.box(1.02, .6, .04, INK, .1, .56, -.03, .02); REF.tv = b.glow('#cfe6c8', 1.3); REF.tv.userData.sw = 0; b.ns(b.put(G('tvs', () => new THREE.PlaneGeometry(.94, .52)), REF.tv, .1, .86, -.008)); b.ns(b.disc(.07, M('#fff3c8', { emissive: '#fff3c8', emissiveIntensity: .3 }), .34, .96, -.006)); b.ns(b.disc(.34, M('#8fb88a'), -.02, .66, -.005)).scale.y = .3; b.plant(-.68, .46, 0, 1.4); return [1.7, .42]; },
  rug(b, o) { const [w, d] = o.s; b.box(w, .014, d, 'rug', 0, 0, 0, .006); b.box(w - .3, .016, d - .3, o.c || 'cream', 0, 0, 0, .006); for (let x = -w / 2 + .06; x < w / 2; x += .12) for (const s of [-1, 1]) b.ns(b.box(.02, .01, .09, 'rug', x, 0, s * (d / 2 + .04), .003)); return [w, d]; },
  mat(b, o) { b.box(o.s[0], .016, o.s[1], o.c || 'acc3', 0, 0, 0, .007); for (let i = 0; i < 5; i++) b.ns(b.box(o.s[0] - .08, .018, .02, WHITE, 0, 0, -o.s[1] / 2 + (i + .5) * o.s[1] / 5, .004)); return [...o.s]; },
  roundRug(b, o) { for (let i = 0; i < 5; i++) b.ns(b.cyl(.6 - i * .11, .6 - i * .11, .012 + i * .002, i % 2 ? 'cream' : (o.c || 'acc2'), 0, 0, 0, 40)); return [1.2, 1.2]; },
  sideTable(b) { b.box(.5, .4, .44, 'cream', 0, .08, 0); b.box(.54, .03, .48, 'wood', 0, .48, 0, .012); b.legs([-.2, .2], [-.17, .17], .08); for (const s of [-1, 1]) { b.box(.21, .26, .02, WHITE, s * .115, .15, .22, .008); b.sph(.014, 'wood2', s * .04, .3, .235); } b.plant(0, .51, 0, 1.5); return [.5, .45]; },
  bigPlant(b) { b.cyl(.2, .15, .34, POT, 0, 0, 0); b.cyl(.18, .18, .02, '#6f5a4b', 0, .33, 0); for (let i = 0; i < 9; i++) { const a = i * 2.4, r = .1 + (i % 3) * .08, y = .6 + (i % 4) * .18; b.cyl(.01, .012, y - .33, LEAF2, Math.cos(a) * r * .4, .33, Math.sin(a) * r * .4, 6); const l = b.sph(.19, i % 2 ? LEAF : LEAF2, Math.cos(a) * r, y, Math.sin(a) * r, 1, .13, .72); l.rotation.set(Math.sin(a) * .5, -a, Math.cos(a) * .5 - .3); } return [.44, .44]; },
  floorLamp(b) { b.cyl(.15, .17, .03, 'wood2', 0, 0, 0); b.cyl(.012, .012, 1.3, 'wood2', 0, .03, 0, 8); b.ns(b.cyl(.13, .2, .26, b.glow('#fff0d2', 1.8), 0, 1.3, 0)); b.lamp(0, 1.25, .1, '#ffdcae'); return [.34, .34]; },
  petBed(b) { b.box(.9, .16, .7, 'acc2', 0, 0, 0, .07); b.box(.9, .14, .14, 'acc2', 0, .12, -.28, .06); for (const s of [-1, 1]) b.box(.14, .14, .5, 'acc2', s * .38, .12, 0, .06); b.box(.62, .05, .46, 'cream', 0, .14, .05, .022); b.cyl(.08, .06, .05, 'acc3', .62, 0, .28, 16); b.cyl(.08, .06, .05, 'wood', .62, 0, .08, 16); return [.9, .7]; },
  planters(b) { b.box(.34, .22, 1.3, 'wood', 0, 0, 0, .03); for (let i = 0; i < 5; i++) { const z = -.5 + i * .25; b.cyl(.006, .006, .16, LEAF2, 0, .22, z, 5); b.sph(.07, i % 2 ? LEAF : LEAF2, 0, .34, z, 1, .8, 1); b.sph(.03, ['#f1c8c0', '#f4e3a8', WHITE, '#d8c8ec', '#f1c8c0'][i], .02, .4, z + .02); } b.cyl(.07, .08, .14, 'acc3', .32, 0, -.5, 16); b.tor(.05, .01, 'acc3', .24, .09, -.5); return [.34, 1.3]; },
  telescope(b) { for (let i = 0; i < 3; i++) { const a = i / 3 * PI * 2; b.cyl(.012, .012, .8, 'wood2', Math.cos(a) * .12, 0, Math.sin(a) * .12, 6).rotation.set(Math.sin(a) * -.3, 0, Math.cos(a) * .3); } b.cyl(.05, .035, .5, 'cream', 0, .72, .05, 14).rotation.x = -1.0; b.cyl(.056, .056, .05, BRASS, 0, .93, .26, 14).rotation.x = -1.0; return [.3, .3]; },
  hangChair(b) { b.cyl(.34, .36, .04, 'cream', 0, 0, 0, 30); b.cyl(.026, .026, 1.95, 'cream', 0, .04, -.42, 10); b.box(.05, .05, .62, 'cream', 0, 1.96, -.13, .016); b.cyl(.004, .004, .42, INK, 0, 1.54, .14, 5); const e = b.put(G('egg2', () => new THREE.SphereGeometry(.47, 30, 22, PI / 2 + PI / 3.2, PI * 2 - PI / 1.6)), M('#f1e2c6', { side: THREE.DoubleSide, bumpMap: fuzzTex, bumpScale: 1 }), 0, 1.02, .14); e.scale.y = 1.12; b.sph(.32, 'acc', 0, .6, .14, 1, .34, 1); return [.75, .75]; },
  /* things sold in the shop */
  armchair(b) { b.box(.8, .28, .76, 'acc2', 0, .1, 0, .12); b.box(.8, .5, .2, 'acc2', 0, .3, -.28, .1); for (const s of [-1, 1]) b.box(.18, .3, .76, 'acc2', s * .32, .28, 0, .09); b.box(.44, .1, .44, 'cream', 0, .36, .06, .05); for (const x of [-.3, .3]) for (const z of [-.28, .28]) b.cyl(.028, .02, .1, 'wood2', x, 0, z, 8); return [.8, .8]; },
  beanbag(b) { b.sph(.38, 'acc', 0, .2, 0, 1, .56, 1); b.sph(.28, 'acc', 0, .38, -.1, 1, .7, .8); return [.76, .76]; },
  easel(b) { for (const s of [-1, 1]) b.box(.035, 1.3, .035, 'wood2', s * .18, 0, .1, .01).rotation.set(-.14, 0, -s * .1); b.box(.035, 1.2, .035, 'wood2', 0, 0, -.16, .01).rotation.x = .2; b.box(.46, .03, .08, 'wood2', 0, .48, .12, .01); b.box(.44, .52, .03, WHITE, 0, .52, .1, .008).rotation.x = -.14; b.ns(b.disc(.1, 'acc2', -.06, .84, .1)).rotation.x = -.14; b.ns(b.disc(.07, '#f4d27a', .09, .76, .11)).rotation.x = -.14; b.ns(b.disc(.05, LEAF, .02, .66, .125)).rotation.x = -.14; return [.5, .5]; },
  record(b) { b.box(.7, .32, .44, 'wood', 0, .2, 0); b.legs([-.28, .28], [-.16, .16], .2, .02); for (const s of [-1, 1]) b.box(.3, .24, .02, 'acc', s * .17, .24, .22, .008); b.box(.5, .06, .4, 'acc', 0, .52, 0, .02); b.cyl(.16, .16, .012, INK, -.04, .58, 0, 36); b.cyl(.05, .05, .014, 'acc2', -.04, .582, 0, 20); const horn = b.cone(.16, .26, BRASS, .2, .66, -.08, 20); horn.rotation.set(.9, 0, -.5); return [.7, .46]; },
  treadmill(b) { b.box(.6, .1, 1.3, INK, 0, .04, 0, .03); b.box(.5, .02, 1.1, '#6b6259', 0, .14, 0, .008); for (const s of [-1, 1]) { b.box(.04, .9, .04, 'cream', s * .27, .1, -.55, .012).rotation.x = .12; b.box(.04, .04, .5, 'cream', s * .27, .92, -.42, .012); } b.box(.56, .14, .06, 'acc3', 0, .9, -.64, .02); b.ns(b.box(.3, .08, .01, b.glow('#cfeedd', 1.2), 0, .93, -.605, .004)); return [.62, 1.3]; },
  arcade(b) { b.box(.62, 1.5, .56, 'acc3', 0, 0, 0, .05); b.box(.5, .4, .02, INK, 0, .92, .285, .01).rotation.x = -.2; b.ns(b.box(.44, .34, .01, b.glow('#f6c8d8', 1.4), 0, .93, .3, .004)).rotation.x = -.2; b.box(.62, .08, .3, 'cream', 0, .72, .36, .02); b.cyl(.012, .012, .08, INK, -.14, .8, .38, 6); b.sph(.03, '#e4587f', -.14, .9, .38); for (const [x, c] of [[.08, '#f4d27a'], [.18, '#8fdcc3']]) b.cyl(.025, .025, .02, c, x, .8, .38, 12); b.box(.56, .16, .02, 'acc2', 0, 1.3, .29, .01); b.lamp(0, 1.0, .5, '#f6c8d8'); return [.64, .7]; },
  teaset(b) { b.cyl(.38, .38, .04, 'wood', 0, .26, 0, 36); b.cyl(.06, .08, .26, 'wood2', 0, 0, 0, 12); b.sph(.07, WHITE, -.06, .37, 0, 1, .85, 1); b.cyl(.02, .03, .03, WHITE, -.06, .42, 0, 12); for (const [x, z] of [[.12, .08], [.1, -.12]]) b.cyl(.03, .022, .04, WHITE, x, .3, z, 14); b.cyl(.09, .08, .014, 'acc2', -.2, .3, .12, 16); for (const [x, z] of [[0, .62], [0, -.62]]) b.cyl(.2, .2, .06, 'acc', x, 0, z, 24); return [.8, .8]; },
  trampoline(b) { b.tor(.52, .05, 'acc3', 0, .26, 0).rotation.x = PI / 2; b.cyl(.5, .5, .02, INK, 0, .25, 0, 36); for (let i = 0; i < 6; i++) { const a = i / 6 * PI * 2; b.cyl(.02, .02, .26, 'cream', Math.cos(a) * .5, 0, Math.sin(a) * .5, 8); } return [1.1, 1.1]; },
  tent(b) { b.ns(b.put(G('tent', () => new THREE.ConeGeometry(.82, 1.4, 6, 1, true, PI / 6 + PI / 3, PI * 2 - PI / 3)), M('#f1e2c6', { side: THREE.DoubleSide, bumpMap: fuzzTex, bumpScale: 1 }), 0, .7, 0)); b.cyl(.56, .56, .05, 'acc', 0, 0, 0, 6); b.sph(.2, WHITE, -.1, .12, -.1, 1, .5, 1); const gm = b.glow('#fff0b8', 2.6); for (let i = 0; i < 5; i++) { const a = PI / 2 + (i - 2) * .42; b.ns(b.sph(.03, gm, Math.cos(a) * .52, .8 - Math.abs(i - 2) * .2, Math.sin(a) * .5)); } b.lamp(0, .6, .3, '#ffe3b0'); return [1.2, 1.2]; },
  cattree(b) { b.box(.7, .06, .7, 'acc', 0, 0, 0, .025); b.cyl(.06, .06, .86, '#e9d6b8', -.12, .06, -.1, 16); b.cyl(.05, .05, .5, '#e9d6b8', .2, .06, .16, 16); b.box(.34, .05, .34, 'acc', .2, .56, .16, .02); b.cyl(.24, .24, .05, 'acc', -.12, .88, -.1); b.tor(.2, .045, 'cream', -.12, .95, -.1).rotation.x = PI / 2; b.sph(.04, 'acc2', .3, .32, .3); return [.72, .72]; },
  aquarium(b) { b.box(.8, .5, .44, 'cream', 0, 0, 0); b.box(.8, .05, .44, 'wood', 0, 1.0, 0, .02); const w = b.glow('#8fd8ff', .7); w.transparent = true; w.opacity = .55; w.userData.always = 1; b.ns(b.box(.72, .44, .36, w, 0, .52, 0, .02)); for (const [x, y, c] of [[-.2, .8, '#f59a4d'], [.14, .68, '#f4d27a'], [.22, .86, '#f59a4d']]) { b.ns(b.sph(.04, c, x, y, .02, 1.4, 1, .6)); } b.ns(b.box(.74, .48, .38, GLASS, 0, .5, 0, .02)); b.lamp(0, .8, .4, '#9fdcff'); return [.8, .46]; },
  lowShelf(b) { b.box(1.1, .7, .34, 'wood', 0, 0, 0, .02); b.box(1.0, .28, .3, 'cream', 0, .06, .03, .01); b.box(1.0, .28, .3, 'cream', 0, .38, .03, .01); for (let i = 0; i < 9; i++) b.box(.05, .2 + (i % 3) * .02, .2, ['acc', 'acc2', 'acc3', WHITE][i % 4], -.42 + i * .06, .4, .08, .008); b.plant(.3, .7, 0, 1.3); b.cyl(.06, .06, .12, 'acc2', -.3, .7, 0, 14); return [1.1, .36]; },
  plushBear(b) { const c = PL('#c99a72'); b.sph(.22, c, 0, .22, 0, 1, 1.05, .95); b.sph(.19, c, 0, .54, .02); for (const s of [-1, 1]) { b.sph(.07, c, s * .14, .7, 0); b.sph(.09, c, s * .2, .28, .1); b.sph(.1, c, s * .14, .06, .16, 1, .8, 1.2); b.sph(.022, INK, s * .07, .57, .19); } b.sph(.07, PL('#f6e6cf'), 0, .5, .17, 1, .8, .8); b.sph(.022, INK, 0, .525, .23); return [.5, .5]; },
  guitar(b) { b.box(.3, .04, .24, 'wood2', 0, 0, 0, .012); b.cyl(.012, .012, .5, 'wood2', 0, .04, -.08, 6); const g = b.sph(.17, 'wood', 0, .3, .02, 1, 1.2, .3); g.rotation.x = -.15; b.sph(.13, 'wood', 0, .52, .0, 1, 1, .3).rotation.x = -.15; b.box(.05, .5, .025, 'wood2', 0, .6, -.05, .008).rotation.x = -.15; b.ns(b.disc(.05, INK, 0, .34, .075)).rotation.x = -.15; return [.36, .3]; },
  cloudLamp(b) { b.cyl(.14, .16, .03, 'cream', 0, 0, 0); b.cyl(.012, .012, 1.0, 'cream', 0, .03, 0, 8); const gm = b.glow('#fff4dc', 1.6); for (const [x, y, r] of [[0, 1.2, .17], [-.17, 1.15, .12], [.17, 1.15, .12], [.06, 1.3, .12]]) b.ns(b.sph(r, gm, x, y, 0)); b.lamp(0, 1.15, .2, '#ffe9c8'); return [.36, .36]; },
  cactus(b) { b.cyl(.13, .1, .2, 'acc2', 0, 0, 0, 16); b.cap(.08, .3, LEAF2, 0, .42, 0); b.cap(.045, .12, LEAF2, .12, .44, 0).rotation.z = -.7; b.cap(.04, .1, LEAF2, -.11, .36, 0).rotation.z = .7; b.sph(.03, '#f1b3a8', 0, .66, 0); return [.3, .3]; },
  heartRug(b) { const sh = new THREE.Shape(); sh.moveTo(0, -.5); sh.bezierCurveTo(-.86, .06, -.46, .72, 0, .28); sh.bezierCurveTo(.46, .72, .86, .06, 0, -.5); b.ns(b.put(G('hrug', () => { const g = new THREE.ExtrudeGeometry(sh, { depth: .016, bevelEnabled: false, curveSegments: 20 }); g.rotateX(-PI / 2); return g; }), 'acc2', 0, 0, 0)); return [1.3, 1.2]; },
  swingHorse(b) { const c = PL('#f6ecd9'); b.tor(.42, .03, 'wood', 0, .42, 0, PI * .6).rotation.set(0, PI / 2, PI * 1.2); b.sph(.2, c, 0, .46, 0, .8, .8, 1.3); b.sph(.13, c, 0, .7, .26, .8, 1, 1); for (const s of [-1, 1]) { b.cone(.035, .08, c, s * .05, .82, .24, 6); b.sph(.014, INK, s * .06, .72, .36); } b.cyl(.012, .012, .3, 'wood2', 0, .62, .2, 6).rotation.z = PI / 2; b.sph(.05, 'acc2', 0, .5, -.28); for (const x of [-.1, .1]) for (const z of [-.14, .16]) b.cyl(.025, .025, .34, c, x, .1, z, 8); b.box(.1, .03, .9, 'wood', -.12, 0, 0, .012); b.box(.1, .03, .9, 'wood', .12, 0, 0, .012); return [.4, .95]; },
  /* fixed wall pieces */
  wallShelf(b) { b.box(1.9, .04, .24, 'wood', 0, 0, .13, .015); for (const x of [-.8, .8]) b.box(.03, .14, .2, 'wood2', x, -.14, .11, .01); [['acc2', -.75], [WHITE, -.55], ['acc2', -.35], [WHITE, -.15]].forEach(([c, x], i) => { b.cyl(.06, .06, .15 - (i % 2) * .03, c, x, .04, .13, 16); b.cyl(.063, .063, .02, 'wood', x, .19 - (i % 2) * .03, .13, 16); }); b.cyl(.045, .04, .08, 'acc', .1, .04, .13, 14); b.plant(.45, .04, .13, 1.4); b.plant(.72, .04, .13, 1); return [0, 0]; },
  frame(b, o) { b.box(.5, .62, .03, 'wood', 0, -.31, .015, .01); b.box(.42, .54, .01, 'cream', 0, -.27, .033, .004); b.ns(b.disc(.1, o.c || 'acc', -.04, -.06, .04)).scale.y = .7; b.ns(b.disc(.06, 'acc2', .08, .08, .04)); b.ns(b.box(.012, .16, .004, LEAF2, -.04, -.22, .04, .002)); return [0, 0]; },
  mirror(b) { b.box(.56, .7, .03, 'wood', 0, -.35, .015, .03); b.box(.48, .62, .012, MIRROR, 0, -.31, .03, .02); const gm = b.glow('#fff4de', 1.6); b.ns(b.box(.5, .04, .05, gm, 0, .38, .04, .015)); b.lamp(0, .3, .45, '#fff0d6'); return [0, 0]; },
  // keepsakes: each sits on a little display stand
  ped(b) { b.cyl(.15, .17, .32, 'wood', 0, 0, 0, 20); b.cyl(.18, .18, .03, 'cream', 0, .32, 0, 20); return .35; },
  memBook(b) { const y = F.ped(b); b.box(.26, .05, .19, 'acc3', 0, y, 0, .012).rotation.y = .2; b.box(.23, .045, .17, 'cream', 0, y + .05, 0, .012).rotation.y = -.25; for (let i = 0; i < 5; i++) { const a = i * 1.257; b.sph(.022, '#f3b9c4', Math.cos(a) * .03, y + .1, Math.sin(a) * .03, 1, .4, 1); } b.sph(.015, '#f4d27a', 0, y + .105, 0); return [.4, .4]; },
  memVase(b) { const y = F.ped(b); const v = b.cyl(.05, .075, .2, 'acc2', -.02, y + .01, 0, 16); v.rotation.z = 1.35; v.position.y = y + .075; for (const [x, c] of [[.14, '#f3b9c4'], [.17, '#f4d27a']]) { const s = b.cyl(.006, .006, .14, LEAF, x - .05, y + .05, x - .14, 5); s.rotation.z = 1.4; b.sph(.028, c, x + .03, y + .06, x - .14); } b.ns(b.disc(.06, GLASS, .1, y + .004, .06)).rotation.x = -PI / 2; return [.4, .4]; },
  memJar(b) { const y = F.ped(b), gm = b.glow('#ffffff', .9); gm.userData.always = 1; for (const [x, yy, r] of [[0, .09, .05], [-.04, .075, .035], [.04, .08, .038]]) b.ns(b.sph(r, gm, x, y + yy, 0)); b.ns(b.cyl(.085, .085, .19, GLASS, 0, y, 0, 20)); b.cyl(.05, .055, .035, 'wood2', 0, y + .19, 0, 14); return [.4, .4]; },
  memNest(b) { const y = F.ped(b); const t = b.tor(.085, .035, 'wood2', 0, y + .035, 0); t.rotation.x = PI / 2; for (const [x, z] of [[-.03, 0], [.035, .02], [0, -.04]]) b.sph(.03, WHITE, x, y + .05, z, 1, 1.25, 1); const f = b.sph(.05, '#a9cfd6', .12, y + .09, .05, .3, 1.6, .12); f.rotation.z = -.7; return [.4, .4]; },
  memLetter(b) { const y = F.ped(b); for (let i = 0; i < 4; i++) b.box(.22, .012, .15, i % 2 ? '#f3e7d0' : '#efe0c4', (i % 2) * .012, y + i * .013, 0, .004).rotation.y = (i - 1.5) * .1; b.box(.24, .014, .02, 'acc', 0, y + .05, 0, .004); b.box(.02, .014, .17, 'acc', 0, y + .05, 0, .004); b.sph(.022, '#c8566a', .05, y + .062, .03, 1, .4, 1); return [.4, .4]; },
  memPaw(b) { b.cyl(.2, .2, .04, 'cream', 0, 0, 0, 24); b.cyl(.06, .06, .62, PL('#e8dcc6'), 0, .04, 0, 16); b.cyl(.075, .075, .14, 'wood2', 0, .3, 0, 16); b.cyl(.13, .13, .04, 'acc', 0, .66, 0, 20); const s = b.sph(.035, '#f5a6a0', .09, .74, 0); for (const a of [-.5, 0, .5]) b.sph(.014, '#f5a6a0', .09 + Math.sin(a) * .05, .78, Math.cos(a) * .05 - .03); return [.42, .42]; },
  memStar(b) { const y = F.ped(b), gm = b.glow('#ffe08a', 2.2); gm.userData.always = 1; const s = b.ns(b.sph(.045, gm, 0, y + .09, 0)); for (let i = 0; i < 5; i++) { const a = i * 1.257; b.ns(b.cone(.02, .05, gm, Math.cos(a) * .06, y + .065 + Math.sin(a) * .06, 0, 4)).rotation.z = a - PI / 2; } b.ns(b.cyl(.08, .08, .2, GLASS, 0, y, 0, 20)); b.cyl(.045, .05, .03, 'wood2', 0, y + .2, 0, 14); b.lamp(0, y + .1, .2, '#ffe9a8'); return [.4, .4]; },
  memFish(b) { const y = F.ped(b); b.box(.3, .22, .03, 'wood2', 0, y, -.02, .01); b.sph(.07, '#f5a6a0', 0, y + .12, .015, 1.5, .85, .45); const t = b.cone(.045, .07, '#a9cfd6', -.13, y + .085, .015, 3); t.rotation.z = -PI / 2; b.sph(.012, INK, .06, y + .135, .045); return [.4, .4]; },
  memLadle(b) { const y = F.ped(b); b.cyl(.06, .05, .1, 'cream', 0, y, 0, 16); const h = b.cyl(.01, .01, .3, BRASS, .02, y + .04, 0, 8); h.rotation.z = -.25; b.sph(.045, BRASS, .07, y + .35, 0, 1, .6, 1); return [.4, .4]; },
  memBox(b) { const y = F.ped(b); b.box(.2, .09, .15, 'wood', 0, y, 0, .012); const l = b.box(.2, .02, .15, 'wood', 0, y + .16, -.07, .008); l.rotation.x = -1.1; b.cyl(.03, .03, .1, BRASS, 0, y + .085, 0, 12).rotation.z = PI / 2; b.sph(.02, '#f5a6a0', .06, y + .15, .02); b.cyl(.004, .004, .06, BRASS, .06, y + .09, .02, 5); return [.4, .4]; },
  memCup(b) { const y = F.ped(b); b.cyl(.05, .06, .03, BRASS, 0, y, 0, 16); b.cyl(.014, .014, .07, BRASS, 0, y + .03, 0, 8); b.cyl(.075, .04, .12, BRASS, 0, y + .1, 0, 18); for (const s of [-1, 1]) { const t = b.tor(.035, .009, BRASS, s * .08, y + .16, 0); } b.sph(.02, '#f4d27a', 0, y + .24, 0); return [.4, .4]; },
  towelRack(b) { b.box(.6, .02, .02, 'wood2', 0, 0, .06, .008); b.box(.24, .34, .02, 'acc2', -.14, -.34, .07, .008); b.box(.24, .26, .02, 'cream', .14, -.26, .07, .008); return [0, 0]; },
  slippers(b) { for (const s of [-1, 1]) { b.sph(.05, 'acc', s * .07, .02, 0, .8, .4, 1.5); b.sph(.045, 'acc', s * .07, .045, .03, .8, .5, .8); } return [0, 0]; },
};
// key → { n, f (builder), o (builder opts), h (height), walk, price, lv, cat }
const CAT = {
  tub: { n: '浴缸', f: 'tub', h: .6, base: 1, price: 380 }, sinkCab: { n: '洗手台', f: 'sinkCab', h: .8, base: 1 }, washer: { n: '洗衣机', f: 'washer', h: 1, base: 1, price: 260 }, bench: { n: '小木凳', f: 'bench', h: .45, base: 1, price: 90 }, matBath: { n: '浴室地垫', f: 'mat', o: { s: [1, .42], c: 'acc3' }, h: .05, walk: 1, base: 1, price: 70 },
  counter: { n: '灶台', f: 'counter', h: .95, base: 1 }, fridge: { n: '冰箱', f: 'fridge', h: 1.6, base: 1 }, matKitchen: { n: '厨房地垫', f: 'mat', o: { s: [1.5, .5], c: 'acc' }, h: .05, walk: 1, base: 1, price: 70 },
  bed: { n: '床', f: 'bed', h: .9, base: 1 }, nightstand: { n: '床头柜', f: 'nightstand', h: .9, base: 1, price: 110 }, wardrobe: { n: '衣柜', f: 'wardrobe', h: 1.95, base: 1, price: 320 }, vanity: { n: '梳妆台', f: 'vanity', h: 1.45, base: 1, price: 300 }, rugBed: { n: '卧室圆毯', f: 'roundRug', o: { c: 'acc2' }, h: .05, walk: 1, base: 1, price: 120 },
  table: { n: '餐桌', f: 'table', h: 1.05, base: 1, price: 220 }, chairA: { n: '餐椅', f: 'chair', h: .9, base: 1, price: 80 }, chairB: { n: '餐椅', f: 'chair', h: .9, base: 1, price: 80, hide: 1 }, chairC: { n: '餐椅', f: 'chair', h: .9, base: 1, price: 80, hide: 1 }, chairD: { n: '餐椅', f: 'chair', h: .9, base: 1, price: 80, hide: 1 }, storage: { n: '收纳架', f: 'storage', h: 1.2, base: 1, price: 180 },
  desk: { n: '书桌', f: 'desk', h: 1.1, base: 1, price: 240 }, deskChair: { n: '书桌椅', f: 'chair', o: { c: 'acc2' }, h: .9, base: 1, price: 90 }, bookshelf: { n: '书架', f: 'bookshelf', h: 1.75, base: 1, price: 280 }, piano: { n: '钢琴', f: 'piano', h: 1.1, base: 1, price: 680 }, matStudy: { n: '书房地垫', f: 'mat', o: { s: [.9, 1.5], c: 'acc3' }, h: .05, walk: 1, base: 1, price: 80 },
  petBed: { n: '宠物窝', f: 'petBed', h: .35, base: 1, price: 100 }, planters: { n: '花槽', f: 'planters', h: .5, base: 1, price: 150 }, telescope: { n: '望远镜', f: 'telescope', h: 1, base: 1, price: 520 }, hangChair: { n: '吊椅', f: 'hangChair', h: 2, base: 1, price: 360 },
  rugLiving: { n: '客厅地毯', f: 'rug', o: { s: [3, 2.5] }, h: .05, walk: 1, base: 1, price: 260 }, tv: { n: '电视柜', f: 'tv', h: 1.2, base: 1, price: 420 }, coffee: { n: '茶几', f: 'coffee', h: .5, base: 1, price: 140 }, sofa: { n: '沙发', f: 'sofa', h: .8, base: 1, price: 380 }, sideTable: { n: '边柜', f: 'sideTable', h: .8, base: 1, price: 130 }, yoga: { n: '瑜伽垫', f: 'mat', o: { s: [.7, 1.7], c: 'acc' }, h: .05, walk: 1, base: 1, price: 80 },
  bigPlant: { n: '大绿植', f: 'bigPlant', h: 1.3, price: 120 }, floorLamp: { n: '落地灯', f: 'floorLamp', h: 1.6, price: 160 },
  armchair: { n: '单人沙发', f: 'armchair', h: .8, price: 260 }, beanbag: { n: '懒人豆袋', f: 'beanbag', h: .6, price: 180 }, lowShelf: { n: '矮书柜', f: 'lowShelf', h: .9, price: 220 }, cloudLamp: { n: '云朵灯', f: 'cloudLamp', h: 1.4, price: 240 },
  easel: { n: '画架', f: 'easel', h: 1.35, price: 280 }, record: { n: '唱片机', f: 'record', h: .9, price: 320 }, teaset: { n: '下午茶小桌', f: 'teaset', h: .5, price: 300 }, trampoline: { n: '蹦床', f: 'trampoline', h: .4, price: 420 },
  treadmill: { n: '跑步机', f: 'treadmill', h: 1.1, price: 460 }, arcade: { n: '街机', f: 'arcade', h: 1.55, price: 560 }, tent: { n: '小帐篷', f: 'tent', h: 1.4, price: 520 }, aquarium: { n: '鱼缸', f: 'aquarium', h: 1.1, price: 480 },
  cattree: { n: '猫爬架', f: 'cattree', h: 1.05, price: 300 }, plushBear: { n: '大熊玩偶', f: 'plushBear', h: .8, price: 200 }, guitar: { n: '吉他', f: 'guitar', h: .9, price: 180 }, cactus: { n: '仙人掌', f: 'cactus', h: .7, price: 80 }, swingHorse: { n: '摇摇马', f: 'swingHorse', h: .9, price: 340 },
  heartRug: { n: '爱心地毯', f: 'heartRug', h: .05, walk: 1, price: 150 }, roundRug2: { n: '编织圆毯', f: 'roundRug', o: { c: 'acc' }, h: .05, walk: 1, price: 130 }, yoga2: { n: '条纹地垫', f: 'mat', o: { s: [.8, 1.4], c: 'acc2' }, h: .05, walk: 1, price: 90 },
  memBook: { n: '压花的书', f: 'memBook', h: .7, memo: 1 }, memVase: { n: '歪倒的花瓶', f: 'memVase', h: .7, memo: 1 }, memJar: { n: '瓶中云', f: 'memJar', h: .8, memo: 1 }, memNest: { n: '小鸟留下的窝', f: 'memNest', h: .7, memo: 1 }, memLetter: { n: '磨旧的信封', f: 'memLetter', h: .7, memo: 1 }, memPaw: { n: '抓秃了的猫抓柱', f: 'memPaw', h: .8, memo: 1 },
  memStar: { n: '许愿瓶', f: 'memStar', h: .8, memo: 1 }, memFish: { n: '云鱼标本', f: 'memFish', h: .8, memo: 1 }, memLadle: { n: '金汤勺', f: 'memLadle', h: .8, memo: 1 }, memBox: { n: '八音盒', f: 'memBox', h: .7, memo: 1 }, memCup: { n: '街机奖杯', f: 'memCup', h: .8, memo: 1 },
};
const SHOP = Object.keys(CAT).filter(k => CAT[k].price && !CAT[k].hide), THUMBK = Object.keys(CAT).filter(k => CAT[k].price || CAT[k].memo);
// the starting layout: [uid, key, x, z, degrees]
const LAYOUT = [['bed', 'bed', 8.55, 1.12, 0], ['counter', 'counter', 4.35, .36, 0], ['fridge', 'fridge', 5.9, .42, 0], ['sink', 'sinkCab', .3, .75, 90]];
const furn = [];   // live instances: { uid, k, x, z, r, b, core }
function fixed(fn, x, z, deg = 0, o = {}) { const b = new Builder(); fn(b, o); b.g.position.set(x, o.y || 0, z); b.g.rotation.y = deg * D2R; houseRoot.add(b.g); if (b.light) { b.g.updateMatrixWorld(true); fixedLamps.push({ p: b.light.p.clone().applyMatrix4(b.g.matrixWorld), color: b.light.color }); } return b; }
const fixedLamps = [];
fixed(F.mirror, 0, .75, 90, { y: 1.5 }); fixed(F.towelRack, 2.93, 1.6, -90, { y: .82 }); fixed(F.slippers, 2.45, 2.2, 30); fixed(F.wallShelf, 4.35, 0, 0, { y: 1.42 }); fixed(F.frame, 8.55, 0, 0, { y: 1.9 }); fixed(F.frame, 0, 3.0, 90, { y: 1.85, c: 'acc3' }); fixed(F.slippers, 4.4, 7.7, -20);
function addFurn(uid, k, x, z, r, core) {
  const c = CAT[k], b = new Builder(); c.fp = F[c.f](b, c.o || {});compactFurniture(b); const f = { uid, k, x, z, r, b, core: !!core }; b.g.userData.furn = f; houseRoot.add(b.g); furn.push(f); syncFurn(f); return f;
}
function syncFurn(f) { f.b.g.position.set(f.x, homeGroundAt(f.x,f.z)+(CAT[f.k].walk ? .002 + (furn.indexOf(f) % 7) * .0016 : 0), f.z); f.b.g.rotation.y = f.r * D2R; f.b.g.updateMatrixWorld(true); }
function removeFurn(f) { f.b.g.removeFromParent(); for (const m of f.b.glows) glowMats.delete(m); for(const g of f.b.own)g.dispose();furn.splice(furn.indexOf(f), 1); }
const fpOf = f => { const [w, d] = CAT[f.k].fp, sw = Math.abs(Math.round(f.r / 90)) % 2; return sw ? [d, w] : [w, d]; };
const rectOf = (f, x = f.x, z = f.z) => { const [w, d] = fpOf(f); return { x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2 }; };
const hitR = (a, b, e = .02) => a.x0 < b.x1 - e && a.x1 > b.x0 + e && a.z0 < b.z1 - e && a.z1 > b.z0 + e;
function canPlace(f, x, z) {
  const r = rectOf(f, x, z); if (r.x0 < 0 || r.z0 < 0 || r.x1 > HX || r.z1 > HZ) return false; if (CAT[f.k].walk) return true;
  const elevation=homeGroundAt(x,z);if([[r.x0,r.z0],[r.x1,r.z0],[r.x0,r.z1],[r.x1,r.z1]].some(([X,Z])=>Math.abs(homeGroundAt(X,Z)-elevation)>.12))return false;
  for (const s of staticBlocks) if (hitR(r, s)) return false; for (const o of furn) if (o !== f && !CAT[o.k].walk && hitR(r, rectOf(o))) return false; return true;
}
const toWorld = (f, lx, lz) => { const a = f.r * D2R, c = Math.cos(a), s = Math.sin(a); return [f.x + lx * c + lz * s, f.z - lx * s + lz * c]; };
function refreshLamps() {
  const spots = [...fixedLamps]; for (const f of furn) if (f.b.light) spots.push({ p: f.b.light.p.clone().applyMatrix4(f.b.g.matrixWorld), color: f.b.light.color });
  lampPool.forEach((l, i) => { const s = spots[i]; l.userData.on = !!s; if (s) { l.position.copy(s.p); l.color.set(s.color); } else l.position.set(HX / 2, -40, HZ / 2); });   // an unused light must never sit on a surface: a zero-length light vector turns into NaN and bloom spreads it over the whole frame
  applyLights();
}

/* ═════════════ walk grid + path finding ═════════════ */
const CELL = .2, NX = Math.round(HX / CELL), NZ = Math.round(HZ / CELL), navB = new Uint8Array(NX * NZ);
function rebuildNav() {
  const blocks = staticBlocks.concat(furn.filter(f => !CAT[f.k].walk).map(f => rectOf(f)));
  for (let z = 0; z < NZ; z++) for (let x = 0; x < NX; x++) { const cx = (x + .5) * CELL, cz = (z + .5) * CELL; let v = cx < .14 || cz < .14 || cx > HX - .14 || cz > HZ - .14 ? 1 : 0; if (!v) for (const r of blocks) if (cx > r.x0 - .13 && cx < r.x1 + .13 && cz > r.z0 - .13 && cz < r.z1 + .13) { v = 1; break; } navB[z * NX + x] = v; }
}
const cellAt = (x, z) => [clamp(Math.floor(x / CELL), 0, NX - 1), clamp(Math.floor(z / CELL), 0, NZ - 1)];
const isFree = (x, z) => { const [cx, cz] = cellAt(x, z); return !navB[cz * NX + cx]; };
function nearestFree(x, z) {
  const [cx, cz] = cellAt(x, z); let best = null, bd = 1e9;
  for (let r = 0; r < 14 && !best; r++) for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) { const X = cx + dx, Z = cz + dz; if (X < 0 || Z < 0 || X >= NX || Z >= NZ || navB[Z * NX + X]) continue; const d = ((X + .5) * CELL - x) ** 2 + ((Z + .5) * CELL - z) ** 2; if (d < bd) { bd = d; best = [X, Z]; } }
  return best;
}
function los(ax,az,bx,bz){const n=Math.max(1,Math.ceil(Math.hypot(bx-ax,bz-az)/.07));let height=homeGroundAt(ax,az);for(let i=0;i<=n;i++){const t=i/n,x=ax+(bx-ax)*t,z=az+(bz-az)*t,y=homeGroundAt(x,z);if(!isFree(x,z)||Math.abs(y-height)>.15)return false;height=y;}return true;}
const homeCanStep=(x,z,X,Z)=>Math.abs(homeGroundAt((x+.5)*CELL,(z+.5)*CELL)-homeGroundAt((X+.5)*CELL,(Z+.5)*CELL))<=.16;
const D8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
function findPath(fx, fz, tx, tz) {
  const s = nearestFree(fx, fz), g = nearestFree(tx, tz); if (!s || !g) return null;
  const start = s[1] * NX + s[0], goal = g[1] * NX + g[0], prev = new Int32Array(NX * NZ).fill(-1), q = [start]; prev[start] = start;
  for (let h = 0; h < q.length; h++) { const c = q[h]; if (c === goal) break; const x = c % NX, z = c / NX | 0; for (const [dx, dz] of D8) { const X = x + dx, Z = z + dz; if (X < 0 || Z < 0 || X >= NX || Z >= NZ) continue; const k = Z * NX + X; if (prev[k] !== -1 || navB[k] || !homeCanStep(x,z,X,Z)) continue; if (dx && dz && (navB[z * NX + X] || navB[Z * NX + x] || !homeCanStep(x,z,X,z) || !homeCanStep(x,z,x,Z))) continue; prev[k] = c; q.push(k); } }
  if (prev[goal] === -1) return null;
  const pts = []; for (let k = goal; k !== start; k = prev[k]) pts.push([(k % NX + .5) * CELL, ((k / NX | 0) + .5) * CELL]); pts.push([(s[0] + .5) * CELL, (s[1] + .5) * CELL]); pts.reverse();
  const out = [pts[0]]; let i = 0; while (i < pts.length - 1) { let j = pts.length - 1; while (j > i + 1 && !los(pts[i][0], pts[i][1], pts[j][0], pts[j][1])) j--; out.push(pts[j]); i = j; }
  return out.slice(1);
}
