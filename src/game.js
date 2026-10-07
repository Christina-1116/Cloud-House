
/* ═════════════ save data ═════════════ */
const KEY = 'cloudhome.v3';
const p2 = n => String(n).padStart(2, '0');
const today = () => { const d = new Date(); return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`; };
const hm = (h = new Date().getHours() + new Date().getMinutes() / 60) => `${p2(Math.floor(h))}:${p2(Math.floor((h % 1) * 60 + .001))}`;
const newDay = () => ({ d: today(), letter: 0, pat: 0, watch: 0, bub: 0, duo: 0, play: 0, mg: {}, claimed: [] });
function fresh() { return { v: 3, chara: 0, pet: 0, theme: 0, time: 'auto', light: 'auto', amb: 'auto', sound: true, music: true, aff: 0, coins: 150, goal: 0, bought: 0, fish: {}, dishes: {}, mem: [], best: {}, plays: {}, pats: 0, perfect: 0, evDay: '', evLast: '', lastSeen: '', mailNew: false, saidHome: false, letters: [], foot: { d: '', list: [] }, day: { d: '' }, look: {}, ward: [], furn: null, bag: {}, uid: 1, mate: -1, diary: [], today: { d: '' }, first: true }; }
function loadState() { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.v === 3) return { ...fresh(), ...s, first: false }; } catch { } return null; }
let state = loadState() || fresh();
AU.on = state.sound !== false;
let saveT = 0;
function save() { clearTimeout(saveT); saveT = setTimeout(() => { state.furn = furn.map(f => ({ u: f.uid, k: f.k, x: +f.x.toFixed(3), z: +f.z.toFixed(3), r: f.r })); try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { if (!state.saveWarned) { state.saveWarned = true; toast("浏览器暂时无法保存进度，请允许本地存储或先保留这一页。"); } } }, 300); }
const LV = [0, 40, 120, 260, 480, 800, 1400, 2200], LVN = ['初识', '熟悉', '亲近', '默契', '家人', '挚友', '知己', '此生'];
const level = () => LV.filter(x => state.aff >= x).length;
function dayOf() { if (state.day.d !== today()) state.day = newDay(); return state.day; }
function count(kind, cap = 1e9) { const d = dayOf(); d[kind] ??= 0; if (d[kind] >= cap) return false; d[kind]++; if (sheetName === 'foot') renderSheet(); refreshDots(); return true; }
function addAff(n) {
  const l0 = level(); state.aff += n; const l1 = level();
  if (l1 > l0) { SFX.level(); const un = [...THEMES.filter(t => t.lv === l1).map(t => `配色「${t.n}」`), ...Object.values(ACTS).filter(a => a.lv === l1).map(a => `活动「${a.n}」`)]; modal(`<h2>更亲近了一点</h2><p>你和${CHARS[state.chara].n}现在是「${LVN[l1 - 1]}」，送你 100 星星币。${un.length ? '新解锁：' + un.join('、') + '。' : ''}</p><div class="acts"><button class="btn" data-close>好</button></div>`); state.coins += 100; renderChips(); }
  renderWho(); save();
}
function addCoins(n) { state.coins += n; renderWho(); save(); }

/* ═════════════ activities: each one belongs to a piece of furniture, so moving the furniture moves the activity ═════════════ */
const ACTS = {
  bath_rest: { n: '浴后休息', cap: '浴后坐着休息', host: 'bench', lp: [0, 0], lf: [0, .5], yr: 0, base: 'sit', seat: .42, outfit: 'robe', anim: 'tv', lines: ['头发还没干。', '水有点烫，脸都红了。', '(发了一会儿呆)', '明天也泡一会儿吧。'] },
  wash: { n: '洗漱', cap: '在水槽前洗漱', host: 'sinkCab', lp: [0, .62], yr: 180, anim: 'wash', lines: ['牙膏快用完了。', '(对着镜子理了理头发)', '水好凉。'] },
  bathe: { n: '泡澡', cap: '泡在浴缸里放空', host: 'tub', lp: [-.33, 0], lf: [-.33, .68], yr: 90, base: 'sit', seat: .13, outfit: 'robe', anim: 'soak', fx: 'steam', at: [0, .5, 0], lines: ['啊——活过来了。', '小黄鸭，你今天过得怎么样。', '(只露出一个脑袋)', '再泡五分钟。'] },
  sleep: { n: '睡觉', cap: '窝在床上睡着了', host: 'bed', lp: [0, .43], lf: [-1.05, .5], yr: 0, base: 'lie', y: .6, outfit: 'pajama', anim: 'sleep', fx: 'zzz', lines: ['……', '(翻了个身)', '呼……', '(梦里好像在笑)'] },
  eat: { n: '吃饭', cap: '坐在餐桌前吃饭', host: 'chairA', lp: [0, 0], lf: [0, -.42], yr: 0, base: 'sit', seat: .44, anim: 'eat', prop: 'bowl', lines: ['今天的汤刚刚好。', '一个人吃饭，也要摆好碗筷。', '(认真地嚼)', '给你留了一份。'] },
  letter: { n: '读你的信', cap: '在读你写的信', host: 'chairB', lp: [0, 0], lf: [0, -.42], yr: 0, base: 'sit', seat: .44, anim: 'read', prop: 'letter', lines: ['(读得很慢)', '(把信又折好)'] },
  sofa_read: { n: '看小报', cap: '坐在沙发上看小报', host: 'sofa', lp: [.4, .12], lf: [.4, .75], yr: 0, base: 'sit', seat: .41, anim: 'read', prop: 'paper', lines: ['(安静地翻了一页)', '今天的头条是猫。', '嗯……', '这一版的填字好难。'] },
  tv: { n: '看电视', cap: '窝在沙发里看电视', host: 'sofa', need: 'tv', lp: [-.4, .12], lf: [-.4, .75], yr: 0, base: 'sit', seat: .41, anim: 'tv', sw: 'tv', lines: ['这集看过了，再看一遍。', '(笑出了声)', '下一集，就一集。'] },
  computer: { n: '玩电脑', cap: '在电脑前玩一会儿', host: 'deskChair', need: 'desk', lp: [0, 0], lf: [0, -.43], yr: 0, base: 'sit', seat: .44, anim: 'type', sw: 'monitor', lines: ['再存个档。', '(键盘声噼里啪啦)', '这个 bug 是谁写的……哦，是我。', '休息一下眼睛。'] },
  cook: { n: '做饭', cap: '在灶台前煮点什么', host: 'counter', lp: [-.5, .64], yr: 180, anim: 'stir', prop: 'ladle', fx: 'steam', at: [-.67, 1.0, -.1], lines: ['盐，少许。少许是多少。', '好香。', '(尝了一口，点点头)', '今天做你爱吃的。'] },
  fridge: { n: '翻冰箱', cap: '打开冰箱找吃的', host: 'fridge', lp: [0, .7], yr: 180, anim: 'search', lines: ['明明昨天还有布丁的。', '(站着发呆，冷气往外跑)', '鸡蛋还剩三个。'] },
  books: { n: '找书', cap: '在书架前翻翻找找', host: 'bookshelf', lp: [0, .53], yr: 180, anim: 'search', lines: ['那本书放哪儿了。', '(抽出一本，又放回去)', '找到了，夹着一片叶子。'] },
  piano: { n: '弹琴', cap: '弹一首慢慢的曲子', host: 'piano', lp: [0, .62], lf: [.5, .62], yr: 180, base: 'sit', seat: .42, anim: 'piano', fx: 'note', lv: 2, lines: ['这首是弹给你听的。', '(弹错了一个音，笑了)', '再来一遍。'] },
  vanity: { n: '梳妆', cap: '在梳妆台前打理自己', host: 'vanity', lp: [0, .55], lf: [.55, .55], yr: 180, base: 'sit', seat: .42, anim: 'makeup', lines: ['今天气色不错。', '(对着镜子眨了眨眼)', '这个发型可以吗。'] },
  wardrobe: { n: '挑衣服', cap: '在衣柜前挑衣服', host: 'wardrobe', lp: [0, .62], yr: 180, anim: 'search', lines: ['穿哪件好呢。', '这件怎么样？', '(转了一圈)'] },
  water: { n: '浇花', cap: '给阳台的花浇水', host: 'planters', lp: [.58, 0], yr: -90, anim: 'water', prop: 'can', lines: ['喝饱了没有。', '长新叶子了。', '(哼着歌)'] },
  pet: { n: '陪它玩', cap: '蹲在窝边陪它玩', host: 'petBed', lp: [.87, 0], yr: -90, base: 'sitFloor', anim: 'pet', fx: 'heart', lines: ['乖。', '今天有没有想我。', '(被蹭了一手毛)'] },
  swing: { n: '吊椅', cap: '窝在吊椅里晃啊晃', host: 'hangChair', lp: [0, .14], lf: [0, .8], yr: 0, base: 'sit', seat: .6, anim: 'swing', prop: 'book', lines: ['风很舒服。', '(晃着晃着快睡着了)', '这一页看了三遍。'] },
  stargaze: { n: '看星星', cap: '在望远镜前看星星', host: 'telescope', lp: [0, -.42], yr: 0, anim: 'gaze', lv: 2, lines: ['那颗最亮的，分你一半。', '(仰着头很久)', '云上面的星星比较近。'] },
  stretch: { n: '伸懒腰', cap: '在垫子上伸个懒腰', host: 'yoga', lp: [0, 0], yr: 35, anim: 'stretch', lines: ['咔。', '舒服——', '(差点没站稳)'] },
  laundry: { n: '洗衣服', cap: '守着洗衣机转圈圈', host: 'washer', lp: [0, .62], yr: 180, anim: 'search', lines: ['袜子又少了一只。', '(盯着滚筒看)', '太阳好的话就晒出去。'] },
  diary: { n: '写日记', cap: '在书桌前写今天的日记', host: 'deskChair', need: 'desk', lp: [0, 0], lf: [0, -.43], yr: 0, base: 'sit', seat: .44, anim: 'write', lines: ['今天……', '(咬着笔头想了想)', '这一句划掉重写。'] },
  // unlocked by buying furniture
  paint: { n: '画画', cap: '在画架前涂涂抹抹', host: 'easel', lp: [0, .55], yr: 180, anim: 'paint', prop: 'brush', lines: ['今天画一朵云。', '(退后一步，歪头看)', '颜色调得刚刚好。'] },
  dance: { n: '听歌跳舞', cap: '跟着唱片扭起来', host: 'record', lp: [0, .8], yr: 0, anim: 'dance', fx: 'note', lines: ['这首我会！', '(转了个圈)', '音量再大一点。'] },
  laze: { n: '窝豆袋', cap: '陷在豆袋里不想动', host: 'beanbag', lp: [0, .05], lf: [0, .65], yr: 0, base: 'sit', seat: .34, anim: 'read', prop: 'book', lines: ['起不来了。', '(整个人陷进去)', '就这样待到晚饭吧。'] },
  run: { n: '跑步', cap: '在跑步机上慢跑', host: 'treadmill', lp: [0, .1], lf: [.6, .3], yr: 180, y: .15, anim: 'run', lines: ['呼、呼……', '再跑五分钟。', '(偷偷把速度调低)'] },
  arcade: { n: '打街机', cap: '在街机前搓摇杆', host: 'arcade', lp: [0, .62], yr: 180, anim: 'type', lines: ['新纪录！', '(疯狂按键)', '再来一局。'] },
  tea: { n: '下午茶', cap: '坐在小桌前喝茶', host: 'teaset', lp: [0, .62], lf: [.5, .62], yr: 180, base: 'sitFloor', y0: .06, anim: 'sip', prop: 'cup', lines: ['茶泡得刚好。', '(小口小口地喝)', '配一块饼干就完美了。'] },
  jump: { n: '蹦床', cap: '在蹦床上跳啊跳', host: 'trampoline', lp: [0, 0], lf: [0, .75], yr: 0, y: .27, anim: 'jump', lines: ['再高一点！', '呀呼——', '(头发都飞起来了)'] },
  camp: { n: '帐篷', cap: '躲进帐篷里看书', host: 'tent', lp: [0, .12], lf: [0, .85], yr: 0, base: 'sitFloor', y0: .05, anim: 'read', prop: 'book', lines: ['这里是秘密基地。', '(打着手电筒)', '外面下雨就更好了。'] },
  cocoa: { n: '喝热可可', cap: '窝在单人沙发里喝热可可', host: 'armchair', lp: [0, .06], lf: [0, .62], yr: 0, base: 'sit', seat: .46, anim: 'sip', prop: 'cup', lines: ['烫。', '(吹了吹)', '棉花糖化掉了。'] },
  horse: { n: '摇摇马', cap: '骑着摇摇马晃来晃去', host: 'swingHorse', lp: [0, 0], lf: [.55, 0], yr: 0, base: 'sit', seat: .62, anim: 'swing', lines: ['驾！', '(晃得很认真)', '我不是小孩子了……但是好玩。'] },
};
const ORDER = ['diary', 'bath_rest', 'wash', 'sleep', 'eat', 'letter', 'sofa_read', 'tv', 'computer', 'cook', 'bathe', 'paint', 'dance', 'jump', 'run', 'arcade', 'tea', 'cocoa', 'laze', 'camp', 'horse', 'fridge', 'books', 'piano', 'vanity', 'wardrobe', 'water', 'pet', 'swing', 'stargaze', 'stretch', 'laundry'];
const SCHED = [[0, ['sleep']], [7, ['wash']], [7.5, ['cook']], [8, ['eat']], [8.6, ['computer', 'books', 'paint']], [10.5, ['water', 'pet', 'swing', 'run']], [11.6, ['cook', 'fridge']], [12.3, ['eat']], [13, ['sofa_read', 'tv', 'stretch', 'tea', 'laze']], [14.5, ['piano', 'computer', 'books', 'arcade', 'dance']], [16.5, ['pet', 'water', 'laundry', 'jump', 'horse']], [18, ['cook']], [18.7, ['eat']], [19.3, ['tv', 'sofa_read', 'swing', 'cocoa', 'camp']], [20.6, ['bathe']], [21.2, ['bath_rest']], [21.6, ['vanity', 'wardrobe']], [22.2, ['stargaze', 'sofa_read']], [23, ['sleep']]];
const nowH = () => new Date().getHours() + new Date().getMinutes() / 60;
const blockAt = h => { let i = 0; for (let k = 0; k < SCHED.length; k++) if (SCHED[k][0] <= h) i = k; return i; };
const hostOf = a => furn.find(f => f.k === a.host);
const actOK = id => { const a = ACTS[id]; return !!hostOf(a) && (!a.need || furn.some(f => f.k === a.need)) && (!a.lv || level() >= a.lv); };

/* ═════════════ the resident ═════════════ */
const hero = newRig('hero'), petR = newRig('pet');
const H = { state: 'idle', act: null, next: null, base: 'stand', anim: null, path: [], walk: 0, t: 0, mode: 'auto', exit: null, mount: null, yaw: 0, fxT: 0, bubT: 3, paid: false };
const dress = k => { buildChara(hero, CHARS[state.chara], k); setProp(hero, H.act && ACTS[H.act].prop); };
function leaveSeat() {
  if (!H.act) return; if (H.exit) hero.root.position.set(H.exit[0], 0, H.exit[1]); hero.root.position.y = 0;
  H.act = null; H.base = 'stand'; H.anim = null; H.mount = null; setProp(hero, null); steam.visible = false; if (H.state === 'act') H.state = 'idle'; syncSw();
}
function goAct(id, mode = 'preview') {
  const a = ACTS[id]; if (!a || edit.on || social.on) return false;
  if (a.lv && level() < a.lv) { SFX.bad(); toast(`再亲近一点（${LVN[a.lv - 1]}）才会给你看`); return false; }
  const host = hostOf(a); if (!host || (a.need && !furn.some(f => f.k === a.need))) { SFX.bad(); toast(`需要先在商店买「${CAT[a.host].n}」`); return false; }
  if (H.act === id && H.state === 'act') { H.mode = mode; syncUI(); if (id === 'letter' && pendingLetter) deliverLetter(); if (id === 'diary') makeDiary(false); return true; }
  leaveSeat(); const from = toWorld(host, ...(a.lf || a.lp)), p = hero.root.position, path = findPath(p.x, p.z, from[0], from[1]);
  H.mode = mode; H.next = id; H.path = path || []; H.state = 'walk'; setCap('正走过去……'); hideBubble(); syncUI(); return true;
}
function arrive() {
  if (H.next === 'social') { H.state = 'social'; return; }
  const id = H.next, a = ACTS[id], host = hostOf(a), p = hero.root.position; if (!host) { H.state = 'idle'; return; }
  H.exit = [p.x, p.z]; H.act = id; H.state = 'act'; H.t = 0; H.bubT = rnd(2.2, 3.6); H.fxT = .5; H.paid = false;
  if ((a.outfit || 'home') !== hero.outfit) { dress(a.outfit || 'home'); floater(p.clone().setY(1.3), '✦'); SFX.spark(); }
  const base = a.base || 'stand', y = base === 'sit' ? a.seat + .045 - hero.hipY : base === 'lie' ? a.y : base === 'sitFloor' ? (a.y0 || 0) + .07 - hero.hipY : a.y || 0, w = toWorld(host, ...(id === 'sleep' && hasMate() ? [-.38, .43] : a.lp));
  H.mount = { fx: p.x, fz: p.z, t: 0, x: w[0], y, z: w[1] }; H.yaw = (host.r + a.yr) * D2R; H.base = base; H.anim = a.anim; setProp(hero, a.prop);
  syncSw();
  steam.visible = a.fx === 'steam'; if (a.at) steam.position.copy(new THREE.Vector3(...a.at).applyMatrix4(host.b.g.matrixWorld));
  { const ps = persOf(state.chara); H.first = H.mode === 'auto' ? null : ps.hate.includes(id) ? ps.no : ps.fav.includes(id) ? ps.yes : null; }
  setCap(a.cap); if (H.mode === 'auto') logFoot(id); else if (count('watch', 12)) addAff(1);
  if (id === 'letter' && pendingLetter) deliverLetter(); if (id === 'diary' && H.mode !== 'auto') makeDiary(false); syncUI(); if (hasMate()) MM.think = Math.min(MM.think, rnd(.6, 2));
}
function updateHero(dt, time) {
  const r = hero.root; let walking = 0;
  if (H.state === 'walk') {
    if (!H.path.length) arrive(); else {
      const [tx, tz] = H.path[0], dx = tx - r.position.x, dz = tz - r.position.z, d = Math.hypot(dx, dz);
      if (d < .05) H.path.shift(); else { const mv = Math.min(d, 1.05 * persOf(state.chara).speed * dt); r.position.x += dx / d * mv; r.position.z += dz / d * mv; H.yaw = Math.atan2(dx, dz); }
      H.walk += dt * 9.5; walking = H.walk;
    }
  } else if (H.state === 'act') {
    const a = ACTS[H.act], m = H.mount; H.t += dt;
    if (m && m.t < 1) { m.t = Math.min(1, m.t + dt / .38); const k = m.t * m.t * (3 - 2 * m.t); r.position.set(lerp(m.fx, m.x, k), m.y * k + Math.sin(k * PI) * .12, lerp(m.fz, m.z, k)); }
    H.fxT -= dt;
    if (H.fxT <= 0 && a.fx) {
      const top = r.position.clone(); top.y += a.base === 'lie' ? .5 : 1.4;
      if (a.fx === 'zzz') { floater(top, 'z'); H.fxT = 2.6; }
      if (a.fx === 'note') { floater(top, pick(['♪', '♫'])); tone(pick([523, 587, 659, 784, 880, 1047]), 0, .9, 'triangle', .1); H.fxT = .55; }
      if (a.fx === 'heart') { floater(petR.root.position.clone().setY(.65), '♥'); petR.hop = .01; H.fxT = 1.8; }
    }
    H.bubT -= dt; if (H.bubT <= 0 && !bubbleHold) { say(H.first || lineFor(state.chara, a, H.act), 4.2); H.first = null; H.bubT = rnd(10, 17) * persOf(state.chara).talk; }
    if (!H.paid && H.t > 14) { H.paid = true; spawnBubble(r.position.clone().setY(r.position.y + 1.75), 15, true); }
    if (H.mode !== 'auto' && H.mode !== 'letter' && H.t > (H.act === 'diary' ? 40 : 150)) backToNow();
  }
  let da = H.yaw - r.rotation.y; da = Math.atan2(Math.sin(da), Math.cos(da)); r.rotation.y += da * Math.min(1, dt * 9);
  poseRig(hero, dt, time, H.state === 'act' ? H.base : 'stand', H.state === 'act' ? H.anim : H.state === 'social' ? social.ha : edit.on ? 'wave' : null, walking);
}
function unstick(root) { if (isFree(root.position.x, root.position.z)) return; const c = nearestFree(root.position.x, root.position.z); if (c) root.position.set((c[0] + .5) * CELL, 0, (c[1] + .5) * CELL); }

/* ═════════════ the pet ═════════════ */
const P = { state: 'nap', path: [], t: 6, walk: 0, yaw: 1.2 };
const petBedF = () => furn.find(f => f.k === 'petBed');
function petHome() { const b = petBedF(); if (!b) { petR.root.position.y = 0; unstick(petR.root); P.state = 'nap'; P.t = rnd(10, 20); P.path = []; return; } const w = toWorld(b, 0, .04); petR.root.position.set(w[0], .2, w[1]); P.state = 'nap'; P.t = rnd(14, 30); P.yaw = b.r * D2R + 1.2; P.path = []; }
function petGo(x, z, then) { const p = petR.root.position, path = findPath(p.x, p.z, x, z); if (!path) { P.t = 2; return; } p.y = 0; P.path = path; P.state = 'walk'; P.then = then; }
function petToBed() { const b = petBedF(); if (!b) return petGo(rnd(.5, HX - .5), rnd(.5, HZ - .5)); const w = toWorld(b, 0, .6); petGo(w[0], w[1], 'bed'); }
function updatePet(dt, time) {
  const r = petR.root;
  if (P.state === 'walk') {
    if (!P.path.length) { if (P.then === 'bed') petHome(); else { P.state = 'idle'; P.t = rnd(3, 8); } }
    else { const [tx, tz] = P.path[0], dx = tx - r.position.x, dz = tz - r.position.z, d = Math.hypot(dx, dz); if (d < .06) P.path.shift(); else { const mv = Math.min(d, 1.15 * dt); r.position.x += dx / d * mv; r.position.z += dz / d * mv; P.yaw = Math.atan2(dx, dz); } P.walk += dt * 14; }
  } else if (!edit.on) {
    P.t -= dt;
    if (H.act === 'pet') { if (P.state !== 'nap') petToBed(); P.t = 5; }
    else if (P.t <= 0) { const q = Math.random(), hp = hero.root.position; if (q < .4) petGo(hp.x + rnd(-.7, .7), hp.z + rnd(-.7, .7)); else if (q < .7) petGo(rnd(.5, HX - .5), rnd(.5, HZ - .5)); else petToBed(); }
  }
  let da = P.yaw - r.rotation.y; da = Math.atan2(Math.sin(da), Math.cos(da)); r.rotation.y += da * Math.min(1, dt * 8);
  const nap = P.state === 'nap' && H.act !== 'pet'; petR.body.scale.y += ((nap ? .72 : 1) - petR.body.scale.y) * Math.min(1, dt * 5);
  petR.body.position.y = (P.state === 'walk' ? Math.abs(Math.sin(P.walk)) * .025 : 0) + (petR.hop > 0 ? Math.sin(Math.min(petR.hop, 1) * PI) * .16 : 0); if (petR.hop > 0) { petR.hop += dt * 4.5; if (petR.hop >= 1) petR.hop = 0; }
  petR.tail.rotation.z = Math.sin(time * (nap ? 1.2 : petR.def.kind === 'dog' ? 9 : 3.2)) * .5; petR.head.rotation.z = Math.sin(time * .9) * .06;
}
const steam = (() => {
  const n = 16, p = new Float32Array(n * 3), c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 2, 32, 32, 30); gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const m = new THREE.Points(g, new THREE.PointsMaterial({ map: new THREE.CanvasTexture(c), size: .26, transparent: true, opacity: .5, depthWrite: false })); m.frustumCulled = false; m.visible = false; scene.add(m); m.userData.p = p; return m;
})();
function tickSteam(time) { if (!steam.visible) return; const p = steam.userData.p, wide = H.act === 'bathe' ? 3.5 : 1; for (let i = 0; i < 16; i++) { const ph = (time * .35 + i / 16) % 1, a = i * 2.4; p[i * 3] = Math.cos(a) * .07 * (1 + ph) * wide + Math.sin(time + i) * .02; p[i * 3 + 1] = ph * .6; p[i * 3 + 2] = Math.sin(a) * .07 * (1 + ph) * wide * .4; } steam.geometry.attributes.position.needsUpdate = true; }

/* ═════════════ floating DOM: bubble, emotes, coin bubbles ═════════════ */
const layer = $('#layer'), _v = new THREE.Vector3();
const toScreen = p => { _v.copy(p).project(camera); return [(_v.x * .5 + .5) * innerWidth, (-_v.y * .5 + .5) * innerHeight]; };
const floaters = [], coinsB = [];
function floater(pos, text, cls = '') { const el = document.createElement('div'); el.className = 'emote ' + cls; el.textContent = text; layer.appendChild(el); floaters.push({ el, pos, t: 0 }); }
const bubble = document.createElement('div'); bubble.className = 'bubble glass'; layer.appendChild(bubble);
let bubT = 0, bubbleHold = false;
function say(text, dur = 4.5, hold = false) { bubble.textContent = text; bubble.style.opacity = 1; bubT = dur; bubbleHold = hold; }
function hideBubble() { bubble.style.opacity = 0; bubT = 0; bubbleHold = false; }
function spawnBubble(pos, val, heart = false, uid = null) {
  if (coinsB.length >= 7) return; const el = document.createElement('button'); el.className = 'coin' + (heart ? ' heart' : ''); el.textContent = heart ? '♥' : '★'; el.setAttribute('aria-label', `收集 ${val} 星星币`);
  const b = { el, pos, val, uid }; coinsB.push(b); layer.appendChild(el);
  el.addEventListener('click', () => { audioStart(); coinsB.splice(coinsB.indexOf(b), 1); el.classList.add('gone'); setTimeout(() => el.remove(), 360); floater(b.pos.clone(), '+' + val, 'gain'); SFX.coin(); count('bub'); addCoins(val); });
}
let coinT = 3;
function tickCoins(dt) {
  coinT -= dt; if (coinT > 0 || edit.on) return; coinT = rnd(7, 12);
  const c = furn.filter(f => !CAT[f.k].walk && !coinsB.some(b => b.uid === f.uid)); if (!c.length) return; const f = pick(c);
  spawnBubble(new THREE.Vector3(f.x, CAT[f.k].h + .3, f.z), Math.round(rnd(6, 11) + level() * 2 + 2 + Math.min(furn.length * .35, 6)), false, f.uid);
}
function updateFloating(dt) {
  for (let i = floaters.length - 1; i >= 0; i--) { const f = floaters[i]; f.t += dt; if (f.t > 1.5) { f.el.remove(); floaters.splice(i, 1); continue; } const [x, y] = toScreen(f.pos); f.el.style.transform = `translate(${x}px,${y - f.t * 42}px) translate(-50%,-50%) scale(${Math.min(1, f.t * 6)})`; f.el.style.opacity = f.t > 1.1 ? (1.5 - f.t) / .4 : 1; }
  for (const b of coinsB) { const [x, y] = toScreen(b.pos), tf = `translate(${x}px,${y}px)`; b.el.style.transform = tf; b.el.style.setProperty('--tf', tf); }
  if (bubT > 0) { bubT -= dt; if (bubT <= 0) hideBubble(); }
  if (bubMT > 0) { bubMT -= dt; if (bubMT <= 0) bubbleM.style.opacity = 0; } placeBubbles(dt);
}

/* ═════════════ auto mode, footprints, letters ═════════════ */
const auto = { block: -1, t: 0 };
function autoPick(force) {
  const b = blockAt(nowH()); if (!force && b === auto.block && auto.t > 0) return; const first = b !== auto.block; auto.block = b; auto.t = rnd(60, 95);
  let c = SCHED[b][1].filter(actOK), sched = c.length > 0; if (!sched) c = (SCHED[b][1][0] === 'sleep' ? ['sleep'] : ['cook', 'fridge', 'wash', 'books', 'sofa_read', 'laze', 'cocoa', 'water', 'pet', 'stretch', 'tea']).filter(actOK); if (!c.length) return;
  const opts = c.length > 1 ? c.filter(id => id !== H.act) : c; goAct(first && sched ? c[0] : weightedAct(opts), 'auto');
}
function backToNow() { if (social.on) return; H.mode = 'auto'; auto.block = -1; autoPick(true); }
function logFoot(id) { const f = state.foot, last = f.list[f.list.length - 1]; if (last && last.a === id) return; f.list.push({ t: hm(), a: id }); if (f.list.length > 80) f.list.shift(); save(); if (sheetName === 'foot') renderSheet(); }
function backfillFoot() {
  const f = state.foot, h = nowH(); let lastH = -1; if (f.d !== today()) { f.d = today(); f.list = []; } else if (f.list.length) { const [a, b] = f.list[f.list.length - 1].t.split(':').map(Number); lastH = a + b / 60; }
  for (const [s, c] of SCHED) if (s <= h && s > lastH && s < SCHED[blockAt(h)][0]) f.list.push({ t: hm(s), a: c[0] });
}
const REPLY = [
  [/晚安|睡了|睡觉/, ['晚安。灯给你留一盏。', '你也早点睡，被子我替你暖着。']], [/早上好|早安|起床|^早/, ['早。今天也慢慢来。', '早上好，粥还热着。']],
  [/累|辛苦|加班|好忙|忙死/, ['辛苦了。回来就什么都不用想。', '累了就来沙发上坐一会儿，不说话也行。']], [/想你|喜欢你|爱你|抱抱/, ['……我也是。', '收到了。会好好放在心里。']],
  [/吃|饿|饭|奶茶/, ['给你留了一份，在冰箱第二层。', '今天想吃什么？我去翻翻冰箱。']], [/难过|伤心|哭|烦|不开心|焦虑|压力/, ['不开心的事，先放在门口的鞋垫上吧。', '我在。你慢慢说，我听着。']],
  [/开心|高兴|哈哈|太棒|好耶/, ['那今天值得多煮一个蛋。', '听你这么说，我也跟着开心。']], [/下雨|好冷|好热|天气/, ['窗边的花今天长了新叶子。', '记得加件衣服，阳台风大。']], [/在吗|你好|嗨|hello|hi/i, ['在。一直在。', '嗯，我在家。']],
];
const REPLY_ANY = ['信收到了，读了两遍。', '嗯，知道了。', '谢谢你来看我。', '我把这张纸夹进书里了。', '今天也有好好生活。你呢。'];
const localReply = t => { for (const [re, a] of REPLY) if (re.test(t)) return pick(a); return pick(REPLY_ANY); };
let sampler, pendingLetter = null;
async function askClaude(text) {
  try {
    if (sampler === undefined) sampler = await Promise.race([window.claude?.use?.('sample') ?? null, new Promise(r => setTimeout(() => r(null), 4000))]);
    if (!sampler) return null; const c = CHARS[state.chara];
    const prompt = `你在扮演一款治愈系小屋游戏里的住客「${c.n}」。性格：${c.voice}。你住在云上的小公寓里，现在是${hm()}，你刚才在${ACTS[H.act]?.cap || '家里待着'}。和你关系是「${LVN[level() - 1]}」的朋友给你留了一张便条：\n「${text}」\n请用${c.n}的口吻回一句话：简体中文，口语，不超过 36 个字，真诚、具体、不说教、不用表情符号、不加引号，也不要提到自己是 AI 或游戏。只输出这句话。`;
    const r = await Promise.race([sampler(prompt, { modelTier: 'quick', cache: false }), new Promise(r => setTimeout(() => r(null), 25000))]);
    return r?.text?.trim().replace(/^[「“"']+|[」”"']+$/g, '').slice(0, 60) || null;
  } catch (e) { if (e?.code === 'not_granted') sampler = null; return null; }
}
function sendLetter(text) {
  if (edit.on) setEdit(false);
  const L = { t: hm(), d: today(), text, reply: '', who: CHARS[state.chara].n }; state.letters.push(L); if (state.letters.length > 40) state.letters.shift(); save();
  pendingLetter = { L, reply: askClaude(text).then(r => r || localReply(text)) }; SFX.paper(); toast(actOK('letter') ? '信放在餐桌上了' : '信递到手里了'); if (!actOK('letter') || !goAct('letter', 'letter')) { pendingLetter.reply.then(r => { L.reply = r; save(); say(r, 8); if (count('letter', 3)) addAff(10); else addAff(2); checkLetterMemo(); }); pendingLetter = null; }
}
async function deliverLetter() {
  const pl = pendingLetter; pendingLetter = null; say('(读得很慢……)', 30, true);
  const [reply] = await Promise.all([pl.reply, new Promise(r => setTimeout(r, 2600))]); pl.L.reply = reply; save();
  if (H.act === 'letter') { say(reply, 9, true); SFX.soft(); hero.hop = .01; setTimeout(() => { bubbleHold = false; }, 9000); } else toast(`${pl.L.who}回了信，在「今日足迹」里`);
  if (count('letter', 3)) addAff(10); else addAff(2); checkLetterMemo(); if (sheetName === 'foot') renderSheet(); setTimeout(() => { if (H.mode === 'letter') backToNow(); }, 18000);
}

/* ═════════════ arranging furniture ═════════════ */
const edit = { on: false, sel: null, drag: null };
const ring = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: '#e4a89c', transparent: true, opacity: .6, depthWrite: false, depthTest: false })); ring.rotation.x = -PI / 2; ring.visible = false; ring.renderOrder = 3; scene.add(ring);
function showRing(ok = true) { const f = edit.sel; ring.visible = !!f; if (!f) return; const [w, d] = fpOf(f); ring.scale.set(w + .22, d + .22, 1); ring.position.set(f.x, .03, f.z); ring.material.color.set(ok ? '#8fd0a0' : '#f0605e'); }
function selectF(f) { edit.sel = f; showRing(); renderEditBar(); if (f) SFX.click(); }
function renderEditBar() {
  const f = edit.sel; $('#editbar').innerHTML = f ? `<span><b>${CAT[f.k].n}</b> · 按住拖动</span><button class="mini" data-e="rot">旋转</button>${f.core ? '' : '<button class="mini" data-e="stash">收进背包</button>'}<button class="btn" data-e="done">完成</button>` : `<span>摆放模式：点一件家具选中，再按住拖动</span><button class="btn" data-e="done">完成</button>`;
}
function setEdit(on) {
  if (edit.on === on) return; edit.on = on; document.body.classList.toggle('editing', on); $('#editbar').hidden = !on; $('#btnEdit').setAttribute('aria-pressed', on);
  if (on) { if (sheetName) closeSheet(); if (social.on) { social.on = false; confetti.visible = false; lampPool.forEach(l => l.userData.gain = 1); } leaveSeat(); H.state = 'idle'; H.path = []; hideBubble(); mateLeave(); MM.path = []; bubbleM.style.opacity = 0; P.path = []; if (P.state === 'walk') P.state = 'idle'; for (const b of coinsB.splice(0)) b.el.remove(); selectF(null); if (!view.wide) $('#btnView').click(); }
  else { selectF(null); rebuildNav(); refreshLamps(); unstick(hero.root); unstick(mateR.root); MM.think = 1.5; if (P.state === 'nap') petHome(); else unstick(petR.root); renderChips(); save(); backToNow(); if (state.bought >= 1 && !state.saidHome) { state.saidHome = true; setTimeout(() => say(persOf(state.chara).home, 6), 900); } checkGoals(); }
}
$('#editbar').addEventListener('click', e => {
  const k = e.target.closest('[data-e]')?.dataset.e, f = edit.sel; if (!k) return; audioStart();
  if (k === 'done') return setEdit(false);
  if (k === 'rot' && f) { const old = f.r; f.r = (f.r + 90) % 360; if (!canPlace(f, f.x, f.z)) { f.r = old; SFX.bad(); return toast('这里转不开，先挪到空一点的地方'); } syncFurn(f); showRing(); SFX.click(); }
  if (k === 'stash' && f && !f.core) { removeFurn(f); state.bag[f.k] = (state.bag[f.k] || 0) + 1; selectF(null); SFX.whoosh?.(); toast(`${CAT[f.k].n}收进背包了，在商店的“背包”里`); }
});
function placeNew(k) {
  const tmp = addFurn('b' + state.uid++, k, 0, 0, 0, false), cx = clamp(controls.target.x, .6, HX - .6), cz = clamp(controls.target.z, .6, HZ - .6); let best = null;
  for (let r = 0; r < 60 && !best; r++) for (let i = 0; i < Math.max(1, r * 6); i++) { const a = i / Math.max(1, r * 6) * PI * 2, x = Math.round((cx + Math.cos(a) * r * .2) * 10) / 10, z = Math.round((cz + Math.sin(a) * r * .2) * 10) / 10; if (canPlace(tmp, x, z)) { best = [x, z]; break; } }
  if (!best) { removeFurn(tmp); return null; } tmp.x = best[0]; tmp.z = best[1]; syncFurn(tmp);
  if (!REDUCED) { const g = tmp.b.g, o = { k: .2 }; g.scale.setScalar(.2); new TWEEN.Tween(o).to({ k: 1 }, 450).easing(TWEEN.Easing.Back.Out).onUpdate(() => g.scale.setScalar(o.k)).start(); }
  return tmp;
}
function getItem(k, fromBag) {
  if (k === 'chairA' && !fromBag) k = ['chairA', 'chairB', 'chairC', 'chairD'].find(x => !furn.some(f => f.k === x) && !state.bag[x]) || 'chairC';
  const c = CAT[k]; if (!fromBag && state.coins < c.price) { SFX.bad(); return toast('星星币不够，点小屋里的泡泡攒一点'); }
  const f = placeNew(k); if (!f) { SFX.bad(); return toast('附近没有空位了，先挪开或收起几件家具'); }
  if (fromBag) state.bag[k]--; else { state.coins -= c.price; state.bought++; todayOf().buys.push(c.n); renderWho(); } SFX.place(); closeSheet(); setEdit(true); selectF(f); save();
  const act = Object.values(ACTS).find(a => a.host === k); if (act && !fromBag) toast(`买到了！摆好后，住客就会来「${act.n}」`);
}

/* ═════════════ a roommate: a second resident with a mind of their own ═════════════ */
const mateR = newRig('mate'); mateR.root.visible = false;
const MM = { state: 'idle', spec: null, id: null, path: [], walk: 0, t: 0, exit: null, mount: null, yaw: 0, base: 'stand', anim: null, fxT: 1, bubT: 6, think: 2 };
const hasMate = () => state.mate >= 0 && state.mate !== state.chara && !!CHARS[state.mate];
const swOn = k => (H.state === 'act' && ACTS[H.act]?.sw === k) || (MM.state === 'act' && MM.spec?.sw === k);
function syncSw() { REF.tv.userData.sw = swOn('tv') ? 1 : 0; REF.monitor.userData.sw = swOn('monitor') ? 1 : 0; applyLights(); }
const SIT = { lf: [0, -.42], lp: [0, 0], yr: 0, base: 'sit', seat: .44 };
const PAIR = {
  eat: { host: 'chairB', ...SIT, anim: 'eat', prop: 'bowl', lines: ['好吃。', '再来一碗。', '(夹走了最后一块)'] }, cook: { host: 'chairA', ...SIT, anim: 'tv', lines: ['好了没——', '闻到香味了。', '(敲碗)'] },
  letter: { host: 'chairA', ...SIT, anim: 'tv', lines: ['信上写了什么？', '(偷偷凑过去看)'] }, sofa_read: 'tv', tv: { host: 'sofa', lp: [.4, .12], lf: [.4, .75], yr: 0, base: 'sit', seat: .41, anim: 'tv', lines: ['换个台好不好。', '(靠过来一点)', '零食分我一半。'] },
  sleep: { host: 'bed', lp: [.38, .43], lf: [-1.05, .95], yr: 0, base: 'lie', y: .6, outfit: 'pajama', anim: 'sleep', fx: 'zzz' }, bathe: 'wash',
  piano: { host: 'piano', lp: [-.8, .95], yr: 160, anim: 'dance', lines: ['再弹一首！', '(跟着节奏晃)'] }, dance: { host: 'record', lp: [.8, .85], yr: -20, anim: 'dance', lines: ['这首我也会！'] },
};
const SOLO = ['books', 'water', 'stretch', 'swing', 'sofa_read', 'wash', 'fridge', 'laundry', 'vanity', 'piano', 'paint', 'laze', 'cocoa', 'tea', 'arcade', 'run', 'jump', 'horse', 'camp', 'computer', 'pet'];
const mateDress = (k = 'home') => buildChara(mateR, CHARS[state.mate], k);
function mateLeave() { if (MM.state === 'act' && MM.exit) mateR.root.position.set(MM.exit[0], 0, MM.exit[1]); mateR.root.position.y = 0; MM.base = 'stand'; MM.anim = null; MM.mount = null; if (mateR.prop) setProp(mateR, null); MM.spec = null; MM.id = null; MM.state = 'idle'; syncSw(); }
function mateGo(spec, id) { const host = hostOf(spec); if (!host) return false; mateLeave(); const from = toWorld(host, ...(spec.lf || spec.lp)), p = mateR.root.position; MM.path = findPath(p.x, p.z, from[0], from[1]) || []; MM.spec = spec; MM.id = id || null; MM.state = 'walk'; return true; }
function mateArrive() {
  const a = MM.spec, host = hostOf(a), p = mateR.root.position; if (!host) { MM.state = 'idle'; MM.spec = null; return; } MM.exit = [p.x, p.z]; MM.state = 'act'; MM.t = 0; MM.fxT = 1; MM.bubT = rnd(5, 9);
  if ((a.outfit || 'home') !== mateR.outfit) mateDress(a.outfit || 'home');
  const base = a.base || 'stand'; let w = toWorld(host, ...a.lp); if (base === 'stand' && !a.y) { const c = nearestFree(w[0], w[1]); if (c) w = [(c[0] + .5) * CELL, (c[1] + .5) * CELL]; }
  const y = base === 'sit' ? a.seat + .045 - mateR.hipY : base === 'lie' ? a.y : base === 'sitFloor' ? (a.y0 || 0) + .07 - mateR.hipY : a.y || 0;
  MM.mount = { fx: p.x, fz: p.z, t: 0, x: w[0], y, z: w[1] }; MM.yaw = (host.r + a.yr) * D2R; MM.base = base; MM.anim = a.anim; setProp(mateR, a.prop); syncSw();
}
function mateThink() {
  if (!hasMate() || edit.on || social.on) return; MM.think = rnd(55, 95);
  const ha = H.state === 'act' || H.state === 'walk' ? H.next : null; let p = PAIR[ha], id = null; if (typeof p === 'string') { id = p; p = ACTS[p]; }
  if (!p || !hostOf(p) || (id && !actOK(id))) { const pool = SOLO.filter(k => actOK(k) && k !== ha && ACTS[k].host !== ACTS[ha]?.host); if (!pool.length) return; id = pick(pool); p = ACTS[id]; }
  if (MM.spec === p && MM.state !== 'idle') return; mateGo(p, id);
}
function setMate(i) {
  state.mate = i; mateLeave(); mateR.root.visible = hasMate();
  if (hasMate()) { mateDress('home'); const c = nearestFree(hero.root.position.x + .8, hero.root.position.z + .3) || [28, 30]; mateR.root.position.set((c[0] + .5) * CELL, 0, (c[1] + .5) * CELL); mateR.hop = .01; MM.think = 2.5; sayM(pick(['我搬进来啦。', '以后请多关照。', '哪张床是我的？']), 3.5); SFX.spark(); }
  renderChips(); save(); setTimeout(checkGoals, 400);
}
function updateMate(dt, time) {
  if (!hasMate()) return; const r = mateR.root; let walking = 0;
  if (MM.state === 'walk') {
    if (!MM.path.length) { if (MM.spec === 'social') MM.state = 'social'; else mateArrive(); }
    else { const [tx, tz] = MM.path[0], dx = tx - r.position.x, dz = tz - r.position.z, d = Math.hypot(dx, dz); if (d < .05) MM.path.shift(); else { const mv = Math.min(d, 1.1 * persOf(state.mate).speed * dt); r.position.x += dx / d * mv; r.position.z += dz / d * mv; MM.yaw = Math.atan2(dx, dz); } MM.walk += dt * 9.5; walking = MM.walk; }
  } else if (MM.state === 'act') {
    const a = MM.spec, m = MM.mount; MM.t += dt; if (m && m.t < 1) { m.t = Math.min(1, m.t + dt / .38); const k = m.t * m.t * (3 - 2 * m.t); r.position.set(lerp(m.fx, m.x, k), m.y * k + Math.sin(k * PI) * .12, lerp(m.fz, m.z, k)); }
    MM.fxT -= dt; if (MM.fxT <= 0 && a.fx === 'zzz') { floater(r.position.clone().setY(r.position.y + .5), 'z'); MM.fxT = 2.9; }
    MM.bubT -= dt; if (MM.bubT <= 0 && a.lines && bubMT <= 0) { sayM(MM.id ? lineFor(state.mate, a, MM.id) : pick(a.lines), 3.8); MM.bubT = rnd(14, 24) * persOf(state.mate).talk; }
  }
  if (MM.state !== 'social' && !social.on && !edit.on) { MM.think -= dt; if (MM.think <= 0) mateThink(); }
  let da = MM.yaw - r.rotation.y; da = Math.atan2(Math.sin(da), Math.cos(da)); r.rotation.y += da * Math.min(1, dt * 9);
  poseRig(mateR, dt, time, MM.state === 'act' ? MM.base : 'stand', MM.state === 'act' ? MM.anim : MM.state === 'social' ? social.ma : edit.on ? 'wave' : null, walking);
}
const bubbleM = document.createElement('div'); bubbleM.className = 'bubble glass mate'; layer.appendChild(bubbleM); let bubMT = 0;
function sayM(text, dur = 4) { bubbleM.textContent = text; bubbleM.style.opacity = 1; bubMT = dur; }

/* ═════════════ things the two of them do together ═════════════ */
const social = { on: false, kind: null, t: 0, phase: '', ha: null, ma: null, step: 0, data: null };
const SOC = { chat: { n: '聊聊天', cap: '两个人聊了起来' }, hi5: { n: '击掌', cap: '来，击个掌' }, hug: { n: '抱一下', cap: '抱一下' }, dance: { n: '一起跳舞', cap: '一起跳舞' }, rps: { n: '猜拳', cap: '石头、剪刀、布！' }, party: { n: '开派对', cap: '小屋派对！' } };
const CHAT = [
  ['今天的云好软。', '嗯，像刚晒过的被子。', '那晚饭吃什么？', '……云吞。'], ['你看见我的袜子了吗？', '洗衣机里有一只。', '另一只呢？', '那是洗衣机的秘密。'],
  ['周末做什么？', '什么都不做。', '好主意。', '我也这么觉得。'], ['冰箱里的布丁是谁吃的？', '……不是我。', '你嘴角有焦糖。', '那是口红。'],
  ['外面起风了。', '把窗帘拉上吧。', '顺便把灯也打开。', '好，再泡壶茶。'], ['我刚学了一首新曲子。', '弹给我听。', '还不太熟。', '那我先假装鼓掌。'],
  ['有人给我们写信了。', '写了什么？', '问我们过得好不好。', '告诉他：很好，就是有点想他。'],
];
function startSocial(kind) {
  if (social.on || edit.on || !SOC[kind]) return; if (kind !== 'party' && !hasMate()) { SFX.bad(); return toast('先在“住客 → 室友”里请一位室友来住'); }
  if (kind === 'party' && performance.now() < partyCd) { SFX.bad(); return toast('刚开完一场，歇一会儿再来'); }
  leaveSeat(); hideBubble(); H.mode = 'social'; const hp = hero.root.position, c = kind === 'party' ? nearestFree(5.4, 6.0) : nearestFree(hp.x, hp.z), hx = (c[0] + .5) * CELL, hz = (c[1] + .5) * CELL;
  H.path = findPath(hp.x, hp.z, hx, hz) || []; H.next = 'social'; H.state = 'walk';
  if (hasMate()) { mateLeave(); let best = null; for (let i = 0; i < 8 && !best; i++) { const a = -PI / 4 + [0, 4, 1, 7, 3, 5, 2, 6][i] * PI / 4, x = hx + Math.cos(a) * .8, z = hz + Math.sin(a) * .8; if (isFree(x, z) && los(hx, hz, x, z)) best = [x, z]; } best ||= [hx, hz]; const mp = mateR.root.position; MM.path = findPath(mp.x, mp.z, best[0], best[1]) || []; MM.spec = 'social'; MM.state = 'walk'; }
  Object.assign(social, { on: true, kind, t: 0, phase: 'gather', ha: null, ma: null, step: 0, data: null }); setCap(SOC[kind].cap); syncUI();
}
function endSocial() {
  const k = social.kind, hp = hero.root.position, mp = hasMate() ? mateR.root.position : hp; social.on = false; social.ha = social.ma = null; H.state = 'idle'; if (hasMate()) { MM.state = 'idle'; MM.spec = null; MM.think = 1.2; }
  spawnBubble(new THREE.Vector3((hp.x + mp.x) / 2, 1.8, (hp.z + mp.z) / 2), k === 'party' ? 30 : 12, true); todayOf().duo++; dayOf().duo ??= 0; if (k !== 'party' && count('duo', 8)) addAff(1);
  if (k === 'party') { confetti.visible = false; partyCd = performance.now() + 120000; todayOf().party++; lampPool.forEach(l => l.userData.gain = 1); refreshLamps(); for (let i = 0; i < 2; i++) spawnBubble(new THREE.Vector3(hp.x + rnd(-1, 1), 2, hp.z + rnd(-1, 1)), 20); }
  save(); backToNow();
}
let partyCd = 0;
function tickSocial(dt, time) {
  if (!social.on) return; social.t += dt; const S = social, hp = hero.root.position, mp = mateR.root.position, two = hasMate(), top = p => p.clone().setY(p.y + 1.55), mid = () => new THREE.Vector3((hp.x + (two ? mp.x : hp.x)) / 2, 1.5, (hp.z + (two ? mp.z : hp.z)) / 2);
  if (S.phase === 'gather') {
    if ((H.state === 'social' && (!two || MM.state === 'social')) || S.t > 14) { H.state = 'social'; H.path = []; if (two) { MM.state = 'social'; MM.path = []; } S.phase = 'play'; S.t = 0; if (S.kind === 'party') { H.yaw = .8; MM.yaw = .8; confetti.visible = true; SFX.level(); } else { H.yaw = Math.atan2(mp.x - hp.x, mp.z - hp.z); MM.yaw = H.yaw + PI; } }
    return;
  }
  const t = S.t, once = n => { if (S.step < n) { S.step = n; return true; } return false; };
  if (S.kind === 'chat') { S.data ||= pick(CHAT); const i = Math.floor(t / 2.4); if (i < S.data.length && once(i + 1)) { if (i % 2) { sayM(S.data[i], 2.2); S.ma = 'wave'; S.ha = null; } else { say(S.data[i], 2.2); S.ha = 'wave'; S.ma = null; } SFX.pop(); } if (t > S.data.length * 2.4 + .4) endSocial(); }
  if (S.kind === 'hi5') { S.ha = S.ma = 'hi5'; if (t > .9 && once(1)) { hero.hop = mateR.hop = .01; floater(mid(), '✦'); SFX.spark(); tone(180, 0, .08, 'square', .12); } if (t > 2.4) endSocial(); }
  if (S.kind === 'hug') { S.ha = S.ma = 'hug'; if (once(1)) { const m = mid(); S.data = [hp.clone(), mp.clone(), m]; } const k = Math.min(1, t / .6), a = S.data; for (const [p, o] of [[hp, a[0]], [mp, a[1]]]) { const d = Math.hypot(o.x - a[2].x, o.z - a[2].z) || 1, f = lerp(1, .26 / d, k); p.x = a[2].x + (o.x - a[2].x) * f; p.z = a[2].z + (o.z - a[2].z) * f; } if (Math.floor(t / .8) + 2 > S.step) { S.step = Math.floor(t / .8) + 2; floater(mid().setY(1.75), '♥'); } if (t > 3.6) endSocial(); }
  if (S.kind === 'dance' || S.kind === 'party') {
    S.ha = S.ma = 'dance'; if (Math.floor(t / .42) + 1 > S.step) { S.step = Math.floor(t / .42) + 1; tone(pick([523, 587, 659, 784, 880, 1047]), 0, .5, 'triangle', .1); if (S.step % 2) floater(top(S.step % 4 === 1 || !two ? hp : mp), pick(['♪', '♫'])); if (S.kind === 'party') { petR.hop = .01; if (S.step % 4 === 0) tone(110, 0, .2, 'sine', .25, 55); } }
    if (S.kind === 'party') { lampPool.forEach((l, i) => { if (l.userData.on) { l.color.setHSL((time * .5 + i * .17) % 1, .8, .6); l.userData.gain = 1.6 / Math.max(lights.k, .25); l.intensity = 4; } }); tickConfetti(dt, hp); }
    if (t > (S.kind === 'party' ? 15 : 7.5)) endSocial();
  }
  if (S.kind === 'rps') { const N = ['石头', '剪刀', '布']; if (t < 1.3) S.ha = S.ma = 'wave'; else { S.ha = S.ma = 'hi5'; if (once(1)) { const a = Math.random() * 3 | 0, b = Math.random() * 3 | 0; S.data = [a, b]; floater(top(hp), N[a]); floater(top(mp), N[b]); SFX.pop(); } if (t > 2.3 && once(2)) { const [a, b] = S.data, w = (b - a + 3) % 3; if (w === 0) { say('平手！', 2); sayM('再来！', 2); } else if (w === 1) { say('赢了！', 2); sayM('不算不算。', 2); hero.hop = .01; } else { sayM('赢了！', 2); say('……再来一局。', 2); mateR.hop = .01; } } } if (t > 4.6) endSocial(); }
}
const confetti = (() => {
  const n = 160, p = new Float32Array(n * 3), c = new Float32Array(n * 3), col = new THREE.Color(), cs = ['#f5a6a0', '#f4d27a', '#a9c097', '#a9cfd6', '#c9bfe6', '#ffffff'];
  for (let i = 0; i < n; i++) { p.set([rnd(-2.5, 2.5), rnd(0, 4), rnd(-2.5, 2.5)], i * 3); col.set(cs[i % 6]); c.set([col.r, col.g, col.b], i * 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('color', new THREE.BufferAttribute(c, 3));
  const m = new THREE.Points(g, new THREE.PointsMaterial({ size: .09, vertexColors: true, transparent: true, depthWrite: false })); m.frustumCulled = false; m.visible = false; scene.add(m); m.userData.p = p; return m;
})();
function tickConfetti(dt, at) { const p = confetti.userData.p; confetti.position.set(at.x, 0, at.z); for (let i = 0; i < p.length; i += 3) { p[i + 1] -= dt * (1.1 + (i % 7) * .12); p[i] += Math.sin(i + p[i + 1] * 3) * dt * .5; if (p[i + 1] < 0) p[i + 1] = 4; } confetti.geometry.attributes.position.needsUpdate = true; }

/* ═════════════ the diary: tonight's page, written from what actually happened today ═════════════ */
function todayOf() { if (!state.today || state.today.d !== today()) state.today = { d: today(), duo: 0, party: 0, gifts: 0, buys: [], ev: [], fish: [], dish: [] }; return state.today; }
function diaryFacts() {
  const c = CHARS[state.chara], T = todayOf(), acts = [...new Set(state.foot.list.map(f => ACTS[f.a]?.cap).filter(Boolean))], letters = state.letters.filter(l => l.d === today() && !l.from);
  return { c, T, acts, letters, mate: hasMate() ? CHARS[state.mate].n : null, pet: PETS[state.pet].n, sky: TIMES[env.key || 'day'].n };
}
function localDiary() {
  const f = diaryFacts(), a = f.acts, s = [];
  s.push(a.length ? `今天${a.slice(-4).join('，')}。` : '今天过得很慢，慢到几乎没做什么。');
  if (f.letters.length) { const l = f.letters[f.letters.length - 1]; s.push(`收到一张便条，上面写着“${l.text.slice(0, 24)}”。${l.reply ? `我回了一句：${l.reply}` : '我看了好几遍。'}`); } else s.push('今天没有人给我写信，信箱空空的。');
  if (f.mate) s.push(f.T.duo ? `和${f.mate}闹了 ${f.T.duo} 回，屋子里一下子热闹起来。` : `${f.mate}也在家，各忙各的，但知道有人在，就很安心。`);
  if (f.T.dish.length) s.push(`下厨做了${[...new Set(f.T.dish)].slice(-2).join('和')}。`); if (f.T.fish.length) s.push(`去云边钓鱼，钓到了${[...new Set(f.T.fish)].slice(-3).join('、')}。`); for (const e of f.T.ev.slice(-3)) s.push(e + '。');
  if (f.T.party) s.push('晚上还开了派对，彩纸到现在都没扫完。'); if (f.T.buys.length) s.push(`家里新添了${f.T.buys.slice(-2).join('和')}，得想想摆哪儿。`); if (f.T.gifts) s.push('还收到了云朵快递，拆礼物的时候手都在抖。');
  s.push(pick([`${f.pet}一直在脚边打转。`, `睡前摸了摸${f.pet}的头。`, `${f.pet}今天也很乖。`])); s.push(f.c.body === 'cloud' ? '呼——晚安。' : pick(['明天也慢慢来。', '就这样，晚安。', '希望明天云也这么软。']));
  return s.join('');
}
async function writeDiary() {
  const f = diaryFacts(), c = f.c; let text = null;
  try {
    if (sampler === undefined) sampler = await Promise.race([window.claude?.use?.('sample') ?? null, new Promise(r => setTimeout(() => r(null), 4000))]);
    if (sampler) {
      const prompt = `你在扮演治愈系小屋游戏里的住客「${c.n}」，性格：${c.voice}。请以第一人称写今天的日记，只根据下面这些今天真实发生的事来写，不要编造没有的事件：\n- 今天做过的事：${f.acts.join('；') || '几乎什么都没做'}\n- 收到的便条和我的回复：${f.letters.map(l => `「${l.text}」→「${l.reply || '还没回'}」`).join('；') || '今天没有便条'}\n- 室友：${f.mate ? f.mate + '，今天一起互动了 ' + f.T.duo + ' 次' : '一个人住'}${f.T.party ? '，还开了派对' : ''}\n- 宠物：${f.pet}\n- 新添的家具：${f.T.buys.join('、') || '没有'}\n- 下厨做的菜：${f.T.dish.join('、') || '没有'}\n- 钓到的鱼：${f.T.fish.join('、') || '没有'}\n- 今天的小事：${f.T.ev.join('；') || '没有'}\n- 今天的天气：${WX[wx].n}\n- 收到云朵快递：${f.T.gifts} 次\n- 现在是${hm()}，天色${f.sky}\n要求：简体中文，90 到 150 个字，口语、具体、有一个小小的情绪落点；写便条的人称为“你”；不要标题和日期，不用表情符号，不要提到游戏或 AI。只输出日记正文。`;
      const r = await Promise.race([sampler(prompt, { modelTier: 'default', cache: false }), new Promise(r => setTimeout(() => r(null), 30000))]); text = r?.text?.trim().slice(0, 260) || null;
    }
  } catch (e) { if (e?.code === 'not_granted') sampler = null; }
  return text || localDiary();
}
let diaryBusy = false;
async function makeDiary(redo) {
  if (diaryBusy) return; diaryBusy = true; const c = CHARS[state.chara], had = state.diary.some(x => x.d === today() && x.who === c.n);
  const [text] = await Promise.all([writeDiary(), new Promise(r => setTimeout(r, redo ? 600 : 3800))]); diaryBusy = false;
  state.diary = state.diary.filter(x => !(x.d === today() && x.who === c.n)); state.diary.push({ d: today(), t: hm(), who: c.n, id: c.id, text }); if (state.diary.length > 60) state.diary.shift();
  if (!had) { addCoins(20); addAff(5); } save(); SFX.paper(); openDiary(state.diary.length - 1); checkGoals();
}
function openDiary(i) {
  const e = state.diary[i]; if (!e) return; const isToday = e.d === today() && e.who === CHARS[state.chara].n;
  const html = `<div class="diary"><header><img src="${ART[e.id] || ART.yu}" alt=""><div><b>${e.who}的日记</b><span>${e.d.replace(/-/g, ' . ')} · ${e.t}</span></div><i>第 ${i + 1} 页</i></header><p>${esc(e.text)}</p></div><div class="acts"><button class="btn alt" data-dg="${i - 1}" ${i > 0 ? '' : 'disabled'}>上一页</button><button class="btn alt" data-dg="${i + 1}" ${i < state.diary.length - 1 ? '' : 'disabled'}>下一页</button>${isToday ? '<button class="btn alt" data-dredo>重写</button>' : ''}<button class="btn" data-close>合上</button></div>`;
  if (!$('#veil').hidden && $('#modal .diary')) { $('#modal').innerHTML = html; bindDiary($('#modal')); } else modal(html, bindDiary);
}
function bindDiary(m) { m.onclick = e => { const g = e.target.closest('[data-dg]'); if (g && !g.disabled) { SFX.paper(); openDiary(+g.dataset.dg); } if (e.target.closest('[data-dredo]')) { e.target.closest('[data-dredo]').textContent = '正在重写……'; makeDiary(true); } }; }

/* ═════════════ sky visitors: the delivery balloon and shooting stars ═════════════ */
const gift = (() => { const b = new Builder(); b.sph(.42, M('#f5a6a0', { roughness: .3, emissive: '#f5a6a0', emissiveIntensity: .3 }), 0, 1.5, 0, 1, 1.12, 1); b.cone(.06, .08, '#e58f8a', 0, .98, 0, 8).rotation.x = PI; b.ns(b.cyl(.006, .006, .7, '#ffffff', 0, .3, 0, 4)); b.box(.36, .3, .36, PL('#fbf3e4'), 0, 0, 0, .05); b.box(.38, .06, .08, PL('#a9c097'), 0, .12, 0, .02); b.box(.08, .06, .38, PL('#a9c097'), 0, .12, 0, .02); for (const s of [-1, 1]) b.sph(.07, PL('#a9c097'), s * .07, .34, 0, 1.2, .7, .6); b.g.userData.ent = 'gift'; b.g.visible = false; scene.add(b.g); return b.g; })();
const G_ = { t: 22, on: false, k: 0 };
function tickGift(dt, time) {
  if (!G_.on) { if (edit.on || social.on) return; G_.t -= dt; if (G_.t <= 0) { G_.on = true; G_.k = 0; gift.visible = true; toast('云朵快递飘过来了，点气球收下'); SFX.soft(); } return; }
  G_.k += dt / 30; const k = G_.k; gift.position.set(lerp(-3, HX + 4, k), 2.6 + Math.sin(time * 1.1) * .25 + Math.sin(k * PI) * .5, lerp(HZ + 1.5, HZ - 2.5, k)); gift.rotation.z = Math.sin(time * 1.3) * .08; gift.rotation.y = time * .3;
  if (k >= 1) { G_.on = false; gift.visible = false; G_.t = rnd(80, 140); }
}
function openGift() {
  if (!G_.on) return; G_.on = false; gift.visible = false; G_.t = rnd(90, 150); SFX.level(); floater(gift.position.clone(), '✦'); todayOf().gifts++; const r = Math.random();
  const hats = HATS.concat(ACCS).filter(x => x.price && !state.ward.includes(x.id));
  if (r < .16 && hats.length) { const x = pick(hats); state.ward.push(x.id); modal(`<h2>云朵快递</h2><p>盒子里是一件装扮：<b>${x.n}</b>。去“住客 → 装扮”里戴上吧。</p><div class="acts"><button class="btn" data-close>收下</button></div>`); }
  else if (r < .3) { const k = pick(SHOP.filter(k => CAT[k].price <= 300)); state.bag[k] = (state.bag[k] || 0) + 1; modal(`<h2>云朵快递</h2><img class="giftimg" src="${CAT[k].thumb}" alt=""><p>盒子里是一件<b>${CAT[k].n}</b>，已经放进商店的“背包”里了。</p><div class="acts"><button class="btn" data-close>收下</button></div>`); }
  else { const n = Math.round(rnd(30, 80) / 5) * 5; addCoins(n); toast(`拆开快递：★ +${n}`); }
  save();
}
const meteor = new THREE.Mesh(new THREE.CylinderGeometry(.02, .12, 5, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.8, 2.2), transparent: true, opacity: 0, depthWrite: false })); meteor.frustumCulled = false; scene.add(meteor);
const MT_ = { t: 6, k: 1, a: new THREE.Vector3(), b: new THREE.Vector3(), wished: false };
function tickMeteor(dt) {
  if (env.night < .7) { meteor.material.opacity = 0; return; }
  if (MT_.k >= 1) { MT_.t -= dt; if (MT_.t <= 0) { MT_.k = 0; MT_.t = rnd(7, 16); MT_.a.set(rnd(-30, 0), rnd(16, 24), rnd(-40, -22)); MT_.b.copy(MT_.a).add(new THREE.Vector3(rnd(10, 16), rnd(-8, -5), rnd(2, 6))); if (H.act === 'stargaze' && !MT_.wished) { MT_.wished = true; say('看到流星了！许个愿。', 3.5); addCoins(20); grantMemo('memStar'); floater(hero.root.position.clone().setY(1.9), '+20', 'gain'); } } return; }
  MT_.k = Math.min(1, MT_.k + dt / .7); meteor.position.lerpVectors(MT_.a, MT_.b, MT_.k); meteor.lookAt(MT_.b); meteor.rotateX(PI / 2); meteor.material.opacity = Math.sin(MT_.k * PI);
}

/*__PLAY__*/
/* ═════════════ camera ═════════════ */
const view = { follow: true, wide: false, pause: 0, off: 0 };
const closeDist = () => innerWidth / innerHeight < .8 ? 14 : 12;
function wideDist() { const vf = camera.fov * D2R, hf = 2 * Math.atan(Math.tan(vf / 2) * camera.aspect); return Math.min(46, Math.max((HX * 1.25 + 2) / (2 * Math.tan(hf / 2)), (HZ + 6.5) / (2 * Math.tan(vf / 2)))); }
function resize() { const w = innerWidth, h = innerHeight; camera.aspect = w / h; camera.setViewOffset(w, h, 0, view.off, w, h); camera.updateProjectionMatrix(); renderer.setSize(w, h, false); composer.setSize(w, h); }
function camDist(d, ms = 900) { const o = { d: camera.position.distanceTo(controls.target) }; new TWEEN.Tween(o).to({ d }, REDUCED ? 1 : ms).easing(TWEEN.Easing.Cubic.InOut).onUpdate(() => { const dir = camera.position.clone().sub(controls.target).normalize(); camera.position.copy(controls.target).addScaledVector(dir, o.d); }).start(); }
function setViewOff(px) { const o = { v: view.off }; new TWEEN.Tween(o).to({ v: px }, REDUCED ? 1 : 350).easing(TWEEN.Easing.Cubic.Out).onUpdate(() => { view.off = o.v; camera.setViewOffset(innerWidth, innerHeight, 0, view.off, innerWidth, innerHeight); camera.updateProjectionMatrix(); }).start(); }
const baseOff = () => innerWidth < 760 ? 95 : 70;
controls.addEventListener('start', () => { view.pause = 1e12; }); controls.addEventListener('end', () => { view.pause = performance.now() + (edit.on ? 1e9 : 4500); });
function followCam(dt) {
  if (performance.now() < view.pause) { controls.target.x = clamp(controls.target.x, -.5, HX + .5); controls.target.z = clamp(controls.target.z, -.5, HZ + .5); controls.target.y = clamp(controls.target.y, 0, 1.5); return; }
  const hp = hero.root.position, want = view.wide ? _v.set(HX / 2 - .3, .3, HZ / 2 - .2) : _v.set(hp.x, .7, hp.z), k = 1 - Math.exp(-dt * 2.6);
  const dx = (want.x - controls.target.x) * k, dy = (want.y - controls.target.y) * k, dz = (want.z - controls.target.z) * k; controls.target.x += dx; controls.target.y += dy; controls.target.z += dz; camera.position.x += dx; camera.position.y += dy; camera.position.z += dz;
}

/* ═════════════ UI ═════════════ */
const setCap = t => { $('#cap').textContent = t; };
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function renderChips() { $('#chips').innerHTML = Object.entries(SOC).filter(([k]) => k === 'party' || hasMate()).map(([k, s]) => `<button class="glass duo" data-duo="${k}">${s.n}</button>`).join('') + ORDER.filter(id => hostOf(ACTS[id]) && (!ACTS[id].need || furn.some(f => f.k === ACTS[id].need))).map(id => { const a = ACTS[id], lock = a.lv && level() < a.lv; return `<button class="glass${lock ? ' lock' : ''}" data-act="${id}" aria-pressed="${H.next === id && H.mode !== 'auto'}">${a.n}${lock ? ' · 未解锁' : ''}</button>`; }).join(''); }
function syncUI() {
  document.querySelectorAll('#chips button').forEach(b => b.setAttribute('aria-pressed', b.dataset.act === H.next && H.mode !== 'auto'));
  const n = $('#now'); n.hidden = H.mode === 'auto' || H.mode === 'social' || edit.on; n.textContent = H.mode === 'replay' ? '正在回看 · 回到现在' : H.mode === 'letter' ? '读信中 · 回到现在' : '正在试看 · 回到现在';
}
function renderWho() { const c = CHARS[state.chara], l = level(), a = LV[l - 1], b = LV[l] ?? a + 1; $('#who').innerHTML = `<img src="${ART[c.id]}" alt=""><b>${c.n}</b><i>♥ ${LVN[l - 1]}</i><span class="bar"><u style="width:${clamp((state.aff - a) / (b - a) * 100, 4, 100)}%"></u></span>`; $('#coins').textContent = state.coins; }
const TASKS = [{ k: 'bub', n: 8, txt: '收集 8 个泡泡', c: 60 }, { k: 'letter', n: 1, txt: '给住客写一封信', c: 60 }, { k: 'watch', n: 3, txt: '试看 3 次活动', c: 50 }, { k: 'pat', n: 3, txt: '摸摸住客或宠物 3 次', c: 40 }, { k: 'duo', n: 2, txt: '让两位住客互动 2 次（先请一位室友）', c: 60 }, { k: 'play', n: 2, txt: '玩 2 局小游戏', c: 50 }];
function refreshDots() { const d = dayOf(); $('#dotFoot').hidden = !state.mailNew && !TASKS.some(t => d[t.k] >= t.n && !d.claimed.includes(t.k)); }
let toastT = 0;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; t.style.opacity = 1; clearTimeout(toastT); toastT = setTimeout(() => { t.style.opacity = 0; setTimeout(() => t.hidden = true, 300); }, 2600); }
const modalQ = [];
function modal(html, onMount) { modalQ.push([html, onMount]); if ($('#veil').hidden) nextModal(); }
function nextModal() { const m = modalQ.shift(); if (!m) { $('#veil').hidden = true; return; } $('#modal').innerHTML = m[0]; $('#veil').hidden = false; m[1]?.($('#modal')); }
$('#veil').addEventListener('click', e => { if (e.target.closest('[data-close]')) nextModal(); });
let sheetName = null; const sheetTab = { char: 'c', style: 's', foot: 'f', shop: 'f', play: 'm' };
const SHEETS = { char: { t: '住客', tabs: [['c', '人物'], ['m', '室友'], ['d', '装扮'], ['p', '宠物']] }, style: { t: '风格', tabs: [] }, foot: { t: '今日', tabs: [['f', '足迹'], ['j', '日记'], ['t', '心愿'], ['l', '信件'], ['a', '亲密度']] }, shop: { t: '商店', tabs: [['f', '基础款'], ['d', '珍藏款'], ['b', '背包']] }, play: { t: '玩乐', tabs: [['m', '小游戏'], ['g', '安家手册'], ['f', '鱼图鉴'], ['r', '菜谱'], ['k', '纪念品']] } };
function openSheet(n) { audioStart(); SFX.click(); if (edit.on) setEdit(false); sheetName = n; $('#sheet').hidden = false; $('#low').hidden = true; renderSheet(); setViewOff(Math.min(innerHeight * .26, 230)); }
function closeSheet() { sheetName = null; $('#sheet').hidden = true; $('#low').hidden = false; setViewOff(baseOff()); }
const optRow = (key, list, cur) => `<div class="opts">${list.map(([k, n]) => `<button data-opt="${key}" data-v="${k}" aria-pressed="${k === cur}">${n}</button>`).join('')}</div>`;
const lookOf = () => state.look[CHARS[state.chara].id] || {};
const owns = id => { const all = HATS.concat(ACCS).find(x => x.id === id); return !all || !all.price || state.ward.includes(id); };
function renderSheet() {
  const sh = SHEETS[sheetName], tab = sheetTab[sheetName]; $('#sheetT').textContent = sh.t; $('#sheetTabs').innerHTML = sh.tabs.map(([k, n]) => `<button role="tab" data-tab="${k}" aria-selected="${k === tab}">${n}</button>`).join(''); let h = '';
  if (sheetName === 'char') {
    const c = CHARS[state.chara], L = lookOf();
    if (tab === 'c') h = `<div class="cards">${CHARS.map((c, i) => `<button class="card" data-chara="${i}" aria-pressed="${i === state.chara}"><img src="${ART[c.id]}" alt=""><b>${c.n}</b><span>${c.tag}</span></button>`).join('')}</div>`;
    if (tab === 'm' && !mateOK()) h = `<p class="note">家里现在只住得下一个人。把安家手册做到“家具达到 10 件”，就能请室友来同住了（现在 ${furn.length} 件）。</p>`;
    else if (tab === 'm') h = `<p class="note" style="margin:0 0 8px">请一位室友来同住。两个人会一起吃饭、看电视、睡一张床，还能聊天、击掌、猜拳、跳舞。</p><div class="cards"><button class="card" data-mate="-1" aria-pressed="${!hasMate()}"><span class="solo">一个人</span><b>一个人住</b><span>安安静静</span></button>${CHARS.map((c, i) => i === state.chara ? '' : `<button class="card" data-mate="${i}" aria-pressed="${hasMate() && i === state.mate}"><img src="${ART[c.id]}" alt=""><b>${c.n}</b><span>${c.tag}</span></button>`).join('')}</div>`;
    if (tab === 'p') h = `<div class="cards">${PETS.map((c, i) => `<button class="card" data-pet="${i}" aria-pressed="${i === state.pet}"><img src="${c.thumb}" alt=""><b>${c.n}</b><span>${c.kind === 'cat' ? '小猫' : '小狗'}</span></button>`).join('')}</div>`;
    if (tab === 'd') {
      const item = (kind, x, cur) => `<button data-wear="${kind}" data-v="${x.id}" aria-pressed="${cur === x.id}">${x.n}${owns(x.id) ? '' : ` <em>★${x.price}</em>`}</button>`, sw = (kind, cur, none) => `<div class="dyes">${none ? `<button data-dye="${kind}" data-v="" aria-pressed="${cur == null}" class="none">无</button>` : ''}${DYE.map(d => `<button data-dye="${kind}" data-v="${d}" aria-pressed="${cur === d}" style="background:${d}" aria-label="颜色"></button>`).join('')}</div>`;
      h = `<p class="note" style="margin:0 0 4px">给${c.n}换装。带 ★ 的要用星星币买，买一次所有住客都能戴。</p><div class="sec">帽子</div><div class="opts">${HATS.map(x => item('hat', x, L.hat ?? c.hat)).join('')}</div><div class="sec">配饰</div><div class="opts">${ACCS.map(x => item('acc', x, L.acc ?? c.acc ?? 'none')).join('')}</div>${c.body === 'cloud' ? '' : `<div class="sec">上衣颜色</div>${sw('top', L.top || c.top)}<div class="sec">背带裤</div>${sw('ov', L.ov !== undefined ? L.ov : c.ov, true)}`}<div class="sec"></div><button class="btn alt" data-wear="reset">恢复${c.n}原本的样子</button>`;
    }
  }
  if (sheetName === 'shop') {
    const card = (k, bag) => { const c = CAT[k], act = Object.values(ACTS).find(a => a.host === k), own = furn.filter(f => f.k === k || (k === 'chairA' && /^chair[B-D]$/.test(f.k))).length; return `<button class="card" data-buy="${k}" data-bag="${bag ? 1 : ''}"><img class="sq" src="${c.thumb}" alt=""><b>${c.n}</b><span>${c.memo ? '纪念品' : (act ? '可以' + act.n : c.walk ? '地毯' : '摆件') + (own && !bag ? ' · 已有 ' + own : '')}</span><span class="price${bag ? ' have' : state.coins < c.price ? ' poor' : ''}">${bag ? '摆出来 ×' + state.bag[k] : '★ ' + c.price}</span></button>`; };
    if (tab === 'b') { const ks = Object.keys(state.bag).filter(k => state.bag[k] > 0); h = ks.length ? `<div class="cards">${ks.map(k => card(k, true)).join('')}</div>` : '<p class="note">背包是空的。在“摆放”模式里选中买来的家具，可以把它收进这里。</p>'; }
    else { const ks = SHOP.filter(k => (tab === 'f') === !!CAT[k].base).sort((a, b) => CAT[a].price - CAT[b].price); h = `<p class="note" style="margin:0 0 8px">你有 <b>★ ${state.coins}</b>，家里现在 ${furn.length} 件家具。${tab === 'f' ? '过日子用的家具。每添一件，住客就多一件事可做。' : '好玩的和好看的。有些还能解锁小游戏。'}</p><div class="cards">${ks.map(k => card(k)).join('')}</div>`; }
  }
  if (sheetName === 'style') h = `<div class="sec">配色</div><div class="cards">${THEMES.map((t, i) => { const lock = level() < t.lv; return `<button class="card${lock ? ' lock' : ''}" data-theme="${i}" aria-pressed="${i === state.theme}"><span class="sw">${['wall', 'acc', 'acc2', 'acc3', 'wood'].map(k => `<i style="background:${t.c[k]}"></i>`).join('')}</span><b>${t.n}</b><span>${lock ? `「${LVN[t.lv - 1]}」解锁` : i === state.theme ? '使用中' : '换上'}</span></button>`; }).join('')}</div>
    <div class="sec">天色</div>${optRow('time', [['auto', '跟随现实'], ['morning', '清晨'], ['day', '白天'], ['dusk', '黄昏'], ['night', '夜晚']], state.time)}<div class="sec">灯光</div>${optRow('light', [['auto', '天黑自动开'], ['on', '开灯'], ['off', '关灯']], state.light)}
    <div class="sec">窗外</div>${optRow('amb', [['auto', '跟随天气']].concat(Object.entries(AMB).map(([k, a]) => [k, a.n])), state.amb)}<div class="sec">声音</div>${optRow('music', [['1', '背景音乐开'], ['0', '背景音乐关']], state.music ? '1' : '0')}`;
  if (sheetName === 'foot') {
    if (tab === 'f') { const l = state.foot.list; h = `<p class="note" style="margin:0 0 6px">${CHARS[state.chara].n}今天做过的事。点“回看”可以再看一遍。</p><div class="tl">${l.slice().reverse().map((f, i) => `<div class="tl-i${i === 0 ? ' cur' : ''}"><time>${f.t}</time><u></u><span>${ACTS[f.a]?.cap || ''}</span><button class="mini" data-replay="${f.a}">回看</button></div>`).join('') || '<p class="note">今天还没有足迹。</p>'}</div>`; }
    if (tab === 'j') h = `<p class="note" style="margin:0 0 8px">点活动里的“写日记”，${CHARS[state.chara].n}会走到书桌前，把今天真的发生过的事写下来。每天第一篇送 ★ 20。</p>${state.diary.length ? state.diary.map((e, i) => `<button class="letter dj" data-diary="${i}"><small>${e.d} · ${e.who}</small><p>${esc(e.text.slice(0, 44))}……</p></button>`).reverse().join('') : '<p class="note">日记本还是空的。</p>'}<div class="sec"></div><button class="btn" data-diarygo>现在去写今天的日记</button>`;
    if (tab === 't') { const d = dayOf(); h = `<p class="note" style="margin:0 0 8px">每天几个小心愿，做完领星星币。零点刷新。</p>${TASKS.map(t => { const p = Math.min(d[t.k], t.n), done = d.claimed.includes(t.k); return `<div class="task"><div><b>${t.txt}</b><div class="lvbar"><i style="width:${p / t.n * 100}%"></i></div></div><button class="btn${p >= t.n && !done ? '' : ' alt'}" data-claim="${t.k}" ${p >= t.n && !done ? '' : 'disabled'}>${done ? '已领取' : p >= t.n ? '领 ★' + t.c : p + ' / ' + t.n}</button></div>`; }).join('')}`; }
    if (tab === 'l') { if (state.mailNew) { state.mailNew = false; refreshDots(); save(); } }
    if (tab === 'l') h = state.letters.length ? state.letters.slice().reverse().map(L => `<div class="letter${L.from ? ' from' : ''}"><small>${L.d} ${L.t} · ${L.from ? L.who + '留给你的' : '写给' + L.who}</small><p>${esc(L.text)}</p>${L.reply ? `<p>${esc(L.reply)}</p>` : ''}</div>`).join('') : '<p class="note">还没有写过信。在底部的“说点什么…”里写一句，住客会走到餐桌前读它，然后回你。</p>';
    if (tab === 'a') { const l = level(), a = LV[l - 1], b = LV[l]; h = `<div class="sec">和${CHARS[state.chara].n}的关系 · ${LVN[l - 1]}</div><div class="lvbar"><i style="width:${b ? clamp((state.aff - a) / (b - a) * 100, 3, 100) : 100}%"></i></div><p class="note" style="margin-top:0">${b ? `还差 ${b - state.aff} 点到「${LVN[l]}」。` : '已经走到「此生」了。'}写信每天前 3 封各 +10；摸摸住客 +2（每天 10 次）；试看活动 +1（每天 12 次）；每天来看一眼 +15。每升一级送 100 星星币。</p><div class="sec">会解锁的东西</div><p class="note" style="margin-top:0">「熟悉」：薰衣草配色、弹琴、看星星。「亲近」：焦糖可可配色。之后还有「默契」「家人」「挚友」「知己」「此生」。</p><div class="sec">存档</div><p class="note" style="margin:0 0 8px">存档只保存在这台设备的浏览器里。</p><button class="btn alt" data-reset>${resetArm ? '再点一次确认清空' : '清空存档，重新开始'}</button>`; }
  }
  if (sheetName === 'play') h = playSheet(tab);
  $('#sheetB').innerHTML = h;
}
let resetArm = false;
$('#sheetTabs').addEventListener('click', e => { const t = e.target.closest('[data-tab]'); if (!t) return; sheetTab[sheetName] = t.dataset.tab; SFX.click(); renderSheet(); });
$('#sheetX').onclick = closeSheet;
function wear(kind, v) {
  const c = CHARS[state.chara], L = state.look[c.id] ||= {};
  if (kind === 'reset') delete state.look[c.id];
  else if (kind === 'hat' || kind === 'acc') { const x = (kind === 'hat' ? HATS : ACCS).find(i => i.id === v); if (!owns(v)) { if (state.coins < x.price) { SFX.bad(); return toast('星星币不够，点泡泡攒一点'); } state.coins -= x.price; state.ward.push(v); toast(`买到了「${x.n}」`); } L[kind] = v; }
  else L[kind] = v === '' ? null : v;
  if (hero.outfit !== 'home') { leaveSeat(); H.state = 'idle'; } dress('home'); hero.hop = .01; SFX.spark(); floater(hero.root.position.clone().setY(hero.root.position.y + 1.5), '✦'); renderWho(); save(); renderSheet();
}
$('#sheetB').addEventListener('click', e => {
  let t; audioStart();
  if ((t = e.target.closest('[data-chara]'))) { setChara(+t.dataset.chara); renderSheet(); return; }
  if ((t = e.target.closest('[data-game]'))) return startMini(t.dataset.game);
  if ((t = e.target.closest('[data-mate]'))) { setMate(+t.dataset.mate); renderSheet(); return; }
  if ((t = e.target.closest('[data-diary]'))) return openDiary(+t.dataset.diary);
  if (e.target.closest('[data-diarygo]')) { closeSheet(); if (!goAct('diary', 'preview')) makeDiary(false); return; }
  if ((t = e.target.closest('[data-pet]'))) { state.pet = +t.dataset.pet; buildPet(petR, PETS[state.pet]); petR.hop = .01; PETS[state.pet].kind === 'dog' ? SFX.woof() : SFX.meow(); save(); renderSheet(); return; }
  if ((t = e.target.closest('[data-wear]'))) return wear(t.dataset.wear, t.dataset.v);
  if ((t = e.target.closest('[data-dye]'))) return wear(t.dataset.dye, t.dataset.v);
  if ((t = e.target.closest('[data-buy]'))) return getItem(t.dataset.buy, !!t.dataset.bag);
  if ((t = e.target.closest('[data-claim]')) && !t.disabled) { const k = t.dataset.claim, task = TASKS.find(x => x.k === k), d = dayOf(); if (d[k] >= task.n && !d.claimed.includes(k)) { d.claimed.push(k); SFX.coin(); addCoins(task.c); toast(`领到 ★ ${task.c}`); refreshDots(); renderSheet(); } return; }
  if ((t = e.target.closest('[data-theme]'))) { const i = +t.dataset.theme; if (level() < THEMES[i].lv) { SFX.bad(); return toast(`关系到「${LVN[THEMES[i].lv - 1]}」后解锁`); } state.theme = i; applyTheme(i); SFX.soft(); save(); renderSheet(); return; }
  if ((t = e.target.closest('[data-opt]'))) { const k = t.dataset.opt, v = t.dataset.v; if (k === 'music') state.music = v === '1'; else state[k] = v; if (k === 'time') setTime(timeKey()); if (k === 'amb' || k === 'time') applyWeather(); SFX.click(); save(); renderSheet(); return; }
  if ((t = e.target.closest('[data-replay]'))) { closeSheet(); goAct(t.dataset.replay, 'replay'); return; }
  if (e.target.closest('[data-reset]')) { if (!resetArm) { resetArm = true; renderSheet(); setTimeout(() => { resetArm = false; if (sheetName === 'foot') renderSheet(); }, 4000); return; } clearTimeout(saveT); try { localStorage.removeItem(KEY); } catch { } location.reload(); }
});
function setChara(i) { if (hasMate() && i === state.mate) { state.mate = state.chara; state.chara = i; mateDress(mateR.outfit || 'home'); } state.chara = i; const o = hero.outfit || 'home'; dress(o); if (H.state === 'act') { const a = ACTS[H.act]; if (a.base === 'sit') hero.root.position.y = a.seat + .045 - hero.hipY; } hero.hop = .01; SFX.spark(); renderWho(); say(CHARS[i].body === 'cloud' ? '噗。' : pick(['你好呀。', '嗯，我住这儿。', '今天也请多关照。']), 3.5); save(); }
const timeKey = () => state.time === 'auto' ? autoTime() : state.time;
$('#btnSound').onclick = () => { state.sound = !AU.on; AU.on = state.sound; if (AU.on) { audioStart(); SFX.pop(); } $('#btnSound').classList.toggle('off', !AU.on); save(); };
$('#btnView').onclick = () => { audioStart(); SFX.click(); view.wide = !view.wide; view.pause = 0; camDist(view.wide ? wideDist() : closeDist()); if (!edit.on) toast(view.wide ? '全景' : '跟着住客'); };
$('#btnFoot').onclick = () => { sheetTab.foot = state.mailNew ? 'l' : $('#dotFoot').hidden ? 'f' : 't'; openSheet('foot'); }; $('#btnPlay').onclick = () => openSheet('play'); $('#goal').onclick = () => { sheetTab.play = 'g'; openSheet('play'); }; $('#who').onclick = () => { sheetTab.foot = 'a'; openSheet('foot'); }; $('#coinChip').onclick = () => { sheetTab.shop = 'f'; openSheet('shop'); };
$('#btnChar').onclick = () => openSheet('char'); $('#btnStyle').onclick = () => openSheet('style'); $('#btnShop').onclick = () => openSheet('shop'); $('#btnEdit').onclick = () => { audioStart(); SFX.click(); setEdit(!edit.on); };
$('#now').onclick = () => { SFX.click(); backToNow(); };
$('#chips').addEventListener('click', e => { const du = e.target.closest('[data-duo]'); if (du) { audioStart(); SFX.click(); return startSocial(du.dataset.duo); } const b = e.target.closest('[data-act]'); if (!b) return; audioStart(); SFX.click(); const id = b.dataset.act; if (id === 'letter' && !state.letters.length) return toast('先在下面写一句话，再来看读信'); goAct(id, 'preview'); });
$('#say').addEventListener('submit', e => { e.preventDefault(); audioStart(); const v = $('#sayIn').value.trim(); if (!v) return toast('写点什么再寄出'); $('#sayIn').value = ''; $('#sayIn').blur(); sendLetter(v); });
function photo() { ring.visible = false; composer.render(); let url = ''; try { url = canvas.toDataURL('image/jpeg', .9); } catch { } const d = new Date(); SFX.shutter(); showRing(); modal(`<figure class="polaroid"><img src="${url}" alt="小屋的照片"><figcaption>${CHARS[state.chara].n}的小屋<span>${d.getMonth() + 1}.${d.getDate()} ${hm()}</span></figcaption></figure><p>长按或右键这张照片就能保存。</p><div class="acts"><button class="btn" data-close>收好了</button></div>`); }
$('#btnPhoto').onclick = () => { audioStart(); photo(); };
addEventListener('keydown', e => { if (e.key === 'Escape') { if (!$('#veil').hidden) nextModal(); else if (sheetName) closeSheet(); else if (edit.on) setEdit(false); } if (edit.on && edit.sel && (e.key === 'r' || e.key === 'R')) $('#editbar [data-e="rot"]')?.click(); });
addEventListener('resize', resize);
document.addEventListener('visibilitychange', () => { if (document.hidden) { state.furn = furn.map(f => ({ u: f.uid, k: f.k, x: f.x, z: f.z, r: f.r })); try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { } } });

/* pointer: taps pat or send the resident somewhere; in arrange mode they select and drag furniture */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(); let tap = null;
function pick3(x, y) { ndc.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera); const hit = ray.intersectObjects(edit.on ? [houseRoot] : [...(G_.on ? [gift] : []), hero.root, ...(hasMate() ? [mateR.root] : []), petR.root, houseRoot], true)[0]; if (!hit) return null; let o = hit.object; while (o && !o.userData.ent && !o.userData.furn) o = o.parent; return o ? (o.userData.ent || o.userData.furn) : null; }
function pickFurn(x, y) {   // in arrange mode a tap anywhere on a footprint counts, so thin pieces are easy to grab
  const o = pick3(x, y); if (o && o.k && !CAT[o.k].walk) return o; const p = floorAt(x, y); if (!p) return o && o.k ? o : null;
  const inside = furn.filter(f => { const r = rectOf(f); return p[0] > r.x0 - .1 && p[0] < r.x1 + .1 && p[1] > r.z0 - .1 && p[1] < r.z1 + .1; }).sort((a, b) => (CAT[a.k].walk ? 1 : 0) - (CAT[b.k].walk ? 1 : 0) || fpOf(a)[0] * fpOf(a)[1] - fpOf(b)[0] * fpOf(b)[1]);
  return inside[0] || (o && o.k ? o : null);
}
function overSel(x, y) { const f = edit.sel; if (!f) return false; if (pick3(x, y) === f) return true; const p = floorAt(x, y), r = rectOf(f); return !!p && p[0] > r.x0 - .15 && p[0] < r.x1 + .15 && p[1] > r.z0 - .15 && p[1] < r.z1 + .15; }
function floorAt(x, y) { ndc.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera); const o = ray.ray.origin, d = ray.ray.direction; if (Math.abs(d.y) < 1e-5) return null; const t = -o.y / d.y; return t > 0 ? [o.x + d.x * t, o.z + d.z * t] : null; }
handlers.down = e => {
  audioStart(); tap = { x: e.clientX, y: e.clientY, t: e.timeStamp, id: e.pointerId };
  if (edit.on && overSel(e.clientX, e.clientY)) { const p = floorAt(e.clientX, e.clientY), f = edit.sel; controls.enabled = false; try { canvas.setPointerCapture(e.pointerId); } catch { } edit.drag = { f, x0: f.x, z0: f.z, ox: p ? p[0] - f.x : 0, oz: p ? p[1] - f.z : 0, ok: true, moved: false, id: e.pointerId }; }
};
canvas.addEventListener('pointermove', e => {
  const d = edit.drag; if (!d || e.pointerId !== d.id) return; if (!d.moved && Math.hypot(e.clientX - tap.x, e.clientY - tap.y) < 5) return; d.moved = true;
  const p = floorAt(e.clientX, e.clientY); if (!p) return; const [w, dd] = fpOf(d.f), f = d.f; f.x = clamp(Math.round((p[0] - d.ox) * 20) / 20, w / 2, HX - w / 2); f.z = clamp(Math.round((p[1] - d.oz) * 20) / 20, dd / 2, HZ - dd / 2); d.ok = canPlace(f, f.x, f.z); syncFurn(f); showRing(d.ok);
});
function endPointer(e) {
  const d = edit.drag;
  if (d && e.pointerId === d.id) { edit.drag = null; controls.enabled = true; if (d.moved) { if (!d.ok) { d.f.x = d.x0; d.f.z = d.z0; syncFurn(d.f); SFX.bad(); toast('这里放不下，换个位置'); } else { SFX.place(); rebuildNav(); refreshLamps(); save(); } showRing(); tap = null; return; } }
  if (!tap || e.pointerId !== tap.id) return; const t = tap; tap = null; if (e.type !== 'pointerup' || Math.hypot(e.clientX - t.x, e.clientY - t.y) > 7 || e.timeStamp - t.t > 600) return;
  if (edit.on) return selectF(pickFurn(e.clientX, e.clientY));
  const o = pick3(e.clientX, e.clientY);
  if (o === 'hero' && evPend) return openEvent();
  if (o === 'hero') { hero.hop = .01; SFX.pop(); floater(hero.root.position.clone().setY(hero.root.position.y + 1.5), '♥'); if (H.act !== 'sleep') say(CHARS[state.chara].body === 'cloud' ? pick(['噗？', '呼——', '(软软地晃了晃)']) : pick(['嗯？', '(抬头看了你一眼)', '在呢。', '别闹。', '(笑了一下)']), 3); if (count('pat', 10)) addAff(2); return; }
  if (o === 'gift') return openGift();
  if (o === 'mate') { mateR.hop = .01; SFX.pop(); floater(mateR.root.position.clone().setY(mateR.root.position.y + 1.5), '♥'); if (MM.spec?.anim !== 'sleep') sayM(pick(['嗯？', '叫我吗。', '(挥挥手)', '在呢在呢。']), 2.6); count('pat', 10); return; }
  if (o === 'pet') { petR.hop = .01; PETS[state.pet].kind === 'dog' ? SFX.woof() : SFX.meow(); floater(petR.root.position.clone().setY(.6), '♥'); count('pat', 10); state.pats = (state.pats || 0) + 1; if (state.pats >= 50) grantMemo('memPaw'); save(); return; }
  if (o && o.k) { const id = Object.keys(ACTS).find(k => ACTS[k].host === o.k && actOK(k)); if (id) { SFX.click(); goAct(id === 'sofa_read' && Math.random() < .5 && actOK('tv') ? 'tv' : id, 'preview'); } }
}
canvas.addEventListener('pointerup', endPointer); canvas.addEventListener('pointercancel', endPointer);

/* ═════════════ boot ═════════════ */
const nextFrame = () => new Promise(r => requestAnimationFrame(() => r()));
async function thumbs(progress) {
  const R = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); R.setSize(170, 170); R.toneMapping = THREE.NeutralToneMapping;
  const Sc = new THREE.Scene(), Pm = new THREE.PMREMGenerator(R); Sc.environment = Pm.fromScene(new RoomEnvironment(R), .04).texture; Sc.environmentIntensity = .5;
  const key = new THREE.DirectionalLight('#fff6ea', 2.4); key.position.set(2, 3, 4); Sc.add(key, new THREE.HemisphereLight('#ffffff', '#ead9c8', 1.1)); const cam = new THREE.PerspectiveCamera(24, 1, .05, 30), box = new THREE.Box3(), c = new THREE.Vector3();
  for (let i = 0; i < PETS.length; i++) { const r = { body: new THREE.Group() }; buildPet(r, PETS[i]); r.body.rotation.y = -.6; Sc.add(r.body); cam.position.set(.1, .46, 1.4); cam.lookAt(0, .2, .04); R.render(Sc, cam); PETS[i].thumb = R.domElement.toDataURL('image/png'); Sc.remove(r.body); }
  for (let i = 0; i < THUMBK.length; i++) { const k = THUMBK[i], cc = CAT[k], b = new Builder(); F[cc.f](b, cc.o || {}); for (const m of b.glows) { m.emissiveIntensity = m.userData.glow * .5; glowMats.delete(m); } b.g.rotation.y = cc.walk ? .3 : -.6; Sc.add(b.g); box.setFromObject(b.g); box.getCenter(c); const sz = box.getSize(new THREE.Vector3()).length(); cam.position.copy(c).add(new THREE.Vector3(0, cc.walk ? 1 : .5, 1).normalize().multiplyScalar(sz * 2.1)); cam.lookAt(c); R.render(Sc, cam); cc.thumb = R.domElement.toDataURL('image/png'); Sc.remove(b.g); if (i % 6 === 0) { progress(i / THUMBK.length); await nextFrame(); } }
  Pm.dispose(); R.dispose(); R.forceContextLoss();
}
async function boot() {
  const bar = $('#loadBar'); $('#loader').style.backgroundImage = `linear-gradient(rgba(250,244,234,.25),rgba(250,244,234,.7)),url(${ART.scene})`; applyTheme(state.theme, false); bar.style.width = '12%'; await nextFrame();
  await thumbs(k => { bar.style.width = 12 + k * 60 + '%'; });
  const coreIds = new Set(LAYOUT.map(l => l[0]));
  if (state.furn && state.furn.length) { for (const s of state.furn) if (CAT[s.k]) addFurn(s.u, s.k, s.x, s.z, s.r, coreIds.has(s.u)); for (const l of LAYOUT) if (!furn.some(f => f.uid === l[0])) addFurn(l[0], l[1], l[2], l[3], l[4], true); } else for (const l of LAYOUT) addFurn(l[0], l[1], l[2], l[3], l[4], true);
  rebuildNav();
  buildChara(hero, CHARS[state.chara], 'home'); buildPet(petR, PETS[state.pet]); hero.root.position.set(5.6, 0, 5.9); unstick(hero.root); petR.root.position.set(4.6, 0, 6.6); petHome(); todayOf(); state.day.duo ??= 0; if (hasMate()) { mateDress('home'); mateR.root.visible = true; mateR.root.position.set(6.6, 0, 5.4); unstick(mateR.root); }
  setTime(timeKey(), false); applyWeather(); lights.k = state.light === 'on' || (state.light === 'auto' && env.night > .4) ? 1 : 0; refreshLamps();
  resize(); view.off = baseOff(); resize(); controls.target.set(hero.root.position.x, .7, hero.root.position.z); camera.position.copy(controls.target).addScaledVector(new THREE.Vector3(1, .98, 1.08).normalize(), closeDist());
  if (state.day.d !== today()) { state.day = newDay(); state.coins += 50; addAff(15); if (!state.first) { toast('今天来看小屋了：★ +50'); const away = state.lastSeen ? Math.round((new Date(today()) - new Date(state.lastSeen)) / 864e5) : 0; if (away >= 2 || Math.random() < .6) setTimeout(() => charaNote(away >= 2 ? away : 0), 2500); } }
  state.lastSeen = today(); renderGoal();
  renderChips(); renderWho(); refreshDots(); $('#btnSound').classList.toggle('off', !AU.on); backfillFoot(); bar.style.width = '90%'; await nextFrame(); renderer.compile(scene, camera); bar.style.width = '100%';
  let last = performance.now(), minuteT = 0, soT = rnd(50, 90);
  renderer.setAnimationLoop(now => {
    const raw = (now - last) / 1000, dt = Math.min(.05, raw), time = now / 1000; last = now; if (voyage.on || document.hidden) return; watchPerf(raw); TWEEN.update(now);
    const lk = state.light === 'on' ? 1 : state.light === 'off' ? 0 : env.night > .4 ? 1 : 0; if (Math.abs(lk - lights.k) > .003) { lights.k += (lk - lights.k) * Math.min(1, dt * 3); applyLights(); }
    if (REF.tv.userData.sw) { REF.tv.emissive.setHSL((time * .07) % 1, .35, .6); REF.tv.emissiveIntensity = 1.2 + Math.sin(time * 9) * .15; }
    if (H.mode === 'auto' && !edit.on && !social.on) { auto.t -= dt; if (auto.t <= 0 && H.state === 'act' || auto.block !== blockAt(nowH())) autoPick(auto.t <= 0); }
    minuteT += dt; if (minuteT > 30) { minuteT = 0; if (state.time === 'auto') setTime(timeKey()); applyWeather(); }
    updateHero(dt, time); updateMate(dt, time); updatePet(dt, time); updateSpacing(dt); tickSocial(dt, time); tickEvent(dt); tickSteam(time); tickDrift(dt, time); tickCoins(dt); tickGift(dt, time); tickMeteor(dt);
    if (H.mode === 'auto' && hasMate() && !edit.on && !social.on) { soT -= dt; if (soT <= 0) { soT = rnd(150, 240); if (H.act !== 'sleep' && !sheetName) startSocial(pick(['chat', 'chat', 'hi5', 'hug', 'rps', 'dance'])); } }
    if (edit.sel && !edit.drag) { ring.material.opacity = .5 + Math.sin(time * 4) * .15; edit.sel.b.g.position.y = Math.abs(Math.sin(time * 3)) * .03; }
    for (const c of clouds) { const u = c.userData; if (u.back) { c.position.x += u.v * dt; if (c.position.x > 34) c.position.x = -28; } else { c.position.z += u.v * dt; if (c.position.z > 34) c.position.z = -28; } }
    followCam(dt); controls.update(); updateFloating(dt); if (!mini.on) composer.render();
  });
  await nextFrame(); await nextFrame(); $('#loader').classList.add('done'); setTimeout(() => $('#loader').remove(), 700);
  renderWho(); state.first = false; save(); checkGoals(); initJourney();
}
if (location.protocol === 'file:' || new URLSearchParams(location.search).has('test')) window.__home = { get state() { return state; }, voyage, jRoom, jProgress, jTravel, jApply, jRender, jEnter, jHome, jStartGame, jGameFinish, save, sim(n) { let t = performance.now() / 1000; for (let i = 0; i < n; i++) { t += .05; updateHero(.05, t); updateMate(.05, t); updatePet(.05, t); updateSpacing(.05); tickSocial(.05, t); tickGift(.05, t); updateFloating(.05); } }, mini, startMini, endMini, closeMini, bloom, composer, renderer, scene, drift, wideDist, meteor, moon, stars, confetti, steam, clouds, THREE, gift, houseRoot, checkGoals, grantMemo, charaNote, openEvent, EVENTS, GOALS, FISH, BB, bubble, bubbleM, say, sayM, applyWeather, setEv(e) { evPend = e; }, get wx() { return wx; }, MM, social, startSocial, setMate, makeDiary, localDiary, openGift, G_, MT_, gift, mateR, H, P, hero, petR, goAct, ACTS, furn, CAT, edit, setEdit, selectF, camera, controls, toScreen, view, env, addAff, addCoins, findPath, nearestFree, toWorld, hostOf, getItem, canPlace, warp(id) { state.aff = Math.max(state.aff, 300); if (!goAct(id)) return false; const a = ACTS[id], f = toWorld(hostOf(a), ...(a.lf || a.lp)), w = toWorld(hostOf(a), ...a.lp), c = nearestFree(f[0], f[1]); hero.root.position.set((c[0] + .5) * .2, 0, (c[1] + .5) * .2); H.path = []; controls.target.set(w[0], .7, w[1]); camera.position.copy(controls.target).addScaledVector(new THREE.Vector3(1, .98, 1.08).normalize(), 7); view.pause = 1e12; return true; } };
boot().catch(err => { console.error(err); if ($('#loadMsg')) $('#loadMsg').textContent = '加载出错了：' + err.message; });
</script>
