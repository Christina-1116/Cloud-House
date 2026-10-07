/* ═════════════ v4 · weather: changes through the day, and the resident notices ═════════════ */
const WX = { sunny: { n: '晴', amb: 'none' }, cloudy: { n: '多云', amb: 'none' }, rain: { n: '小雨', amb: 'rain' }, breeze: { n: '有风', amb: 'petal' }, snow: { n: '小雪', amb: 'snow' } };
function weatherNow() { const d = new Date(), s = d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate(); let h = (s * 9301 + Math.floor(d.getHours() / 6) * 49297 + 7) % 233280; h = (h * 9301 + 49297) % 233280; const r = h / 233280, m = d.getMonth(), cold = m >= 10 || m <= 1; return r < .34 ? 'sunny' : r < .52 ? 'cloudy' : r < .76 ? (cold ? 'snow' : 'rain') : r < .92 ? 'breeze' : (cold ? 'snow' : 'rain'); }
let wx = 'sunny';
function applyWeather() { wx = state.wxForce || weatherNow(); setAmbience(state.amb === 'auto' ? (wx === 'sunny' && env.night > .6 ? 'firefly' : WX[wx].amb) : state.amb); $('#wx').textContent = WX[wx].n; }
const OUTDOOR = ['water', 'swing', 'stargaze', 'stretch'];
const WXLINE = { rain: ['下雨了。今天哪儿也不去。', '雨落在云上，是没有声音的。', '(看着窗外的雨发呆)'], snow: ['你那边下雪了吗？', '雪落在云上，分不清谁是谁。'], sunny: ['今天太阳好，晒一下。', '被子该拿出去晒了。'], cloudy: ['阴天。适合煮点东西。', '云很厚，像盖了两层被子。'], breeze: ['风太大了，窗关上了。', '花瓣又吹进来了。'] };

/* ═════════════ six residents, six temperaments ═════════════ */
const PERS = {
  yu: { speed: .92, talk: 1.35, fav: ['stargaze', 'sofa_read', 'swing', 'laze'], hate: ['dance', 'run'], no: '……一定要吗。', yes: '这个可以。', empty: '家里好空啊。', home: '谢谢你，这里开始像家了。',
    idle: ['……', '(看着窗外)', '在想事情。没想出来。', '你来了。', '今天的云走得很慢。', '嗯。', '我数到第四十七朵云了。', '(把手揣进口袋)', '不说话也挺好的。', '茶凉了。算了。', '你今天看起来还行。', '(打了个很小的哈欠)'] },
  ju: { speed: 1.16, talk: .7, fav: ['run', 'dance', 'jump', 'water'], hate: ['sofa_read', 'laze'], no: '坐着好无聊啊！', yes: '这个我最喜欢了！', empty: '哇——好空！可以翻跟头！', home: '太好啦！这里开始像家了！',
    idle: ['早呀！今天也要加油！', '我刚才原地转了十圈！', '你吃饭了没？', '走走走，动起来！', '嘿嘿。', '今天的我也元气满满！', '(蹦了一下)', '有什么要帮忙的吗！', '我们来比赛谁先眨眼！', '太阳出来我就开心。', '你笑一个嘛。', '哇，你来啦！'] },
  li: { speed: .82, talk: 1.1, fav: ['cocoa', 'tea', 'cook', 'bathe'], hate: ['run', 'jump'], no: '跑起来……茶会洒的。', yes: '嗯——这个暖和。', empty: '空空的，有回音呢……', home: '有了它，屋里暖和多啦，谢谢你。',
    idle: ['慢——慢——来。', '水还没开，不急。', '(捧着杯子暖手)', '今天适合烤栗子。', '我想了一上午，决定下午再想。', '呼……', '你也喝点热的吧。', '坐下来，坐下来。', '炉子上炖着东西呢。', '天冷了要穿袜子哦。', '(慢慢地点了点头)', '等一下，我还没想好说什么。'] },
  man: { speed: 1.05, talk: .8, fav: ['cook', 'fridge', 'eat', 'tea'], hate: ['computer', 'laundry'], no: '这个不好玩啦！', yes: '好耶！', empty: '哇，连张桌子都没有！', home: '太棒了！这下像个家啦！',
    idle: ['今天吃什么呀！', '我闻到香味了！', '你看那朵云像不像包子！', '好饿好饿。', '冰箱里还有布丁吗！', '嘿嘿，我偷吃了一口。', '下次做给你吃！', '云好软啊，想咬一口！', '(肚子叫了一声)', '盐放多了一点点！', '我发明了新菜！', '你来得正好，尝尝！'] },
  xia: { speed: .95, talk: 1.2, fav: ['books', 'sofa_read', 'paint', 'piano', 'diary'], hate: ['arcade', 'jump'], no: '太吵了一点，我看一会儿就好。', yes: '这是我喜欢的时刻。', empty: '空房间也像一页还没写的纸。', home: '谢谢你。第一件家具，像第一行字。',
    idle: ['书上说，云是天空的草稿。', '(轻轻翻了一页)', '今天读到一句很好的话。', '你来了，我正想写信给你。', '安静的时候，能听见云在走。', '这一页我折了角。', '窗边的光刚刚好。', '想把今天夹进书里。', '(把头发别到耳后)', '慢慢来，比较快。', '有些话写下来才说得清。', '午后适合读诗。'] },
  yun: { speed: .88, talk: 1, fav: ['swing', 'laze', 'jump', 'stargaze'], hate: ['bathe', 'laundry'], no: '噗……会化掉的。', yes: '呼——喜欢。', empty: '噗，空空的，像天上。', home: '呼——暖暖的。谢谢你。',
    idle: ['呼——', '噗。', '(飘了一下)', '软软的。', '今天也是云。', '噗噗。', '你好呀，呼。', '(变扁了一点)', '想被风吹。', '呼……困。', '那朵云是我表哥。', '噗，痒。'] },
};
const persOf = i => PERS[CHARS[i]?.id] || PERS.yu;
function lineFor(i, a, id) { const p = persOf(i), r = Math.random(); if (p.hate.includes(id) && r < .3) return p.no; if (p.fav.includes(id) && r < .15) return p.yes; if (r < .32) return pick(p.idle); if (r < .44 && a.anim !== 'sleep') return pick(WXLINE[wx]); return pick(a.lines); }
function weightedAct(ids) { const p = persOf(state.chara), bad = wx === 'rain' || wx === 'snow' || wx === 'breeze'; let pool = []; for (const id of ids) { let w = p.fav.includes(id) ? 4 : p.hate.includes(id) ? 1 : 2; if (bad && OUTDOOR.includes(id)) w = 0; for (let i = 0; i < w; i++) pool.push(id); } return pool.length ? pick(pool) : pick(ids); }

/* ═════════════ nobody walks through anybody ═════════════ */
const SEP = .6, SEP_PET = .42;
function applyPush(root, dx, dz) { const p = root.position, nx = p.x + dx, nz = p.z + dz; if (isFree(nx, nz)) { p.x = nx; p.z = nz; } else if (isFree(nx, p.z)) p.x = nx; else if (isFree(p.x, nz)) p.z = nz; }
function pushApart(a, b, min, dt, ma, mb) {
  let dx = a.position.x - b.position.x, dz = a.position.z - b.position.z, d = Math.hypot(dx, dz); if (d >= min || !(ma || mb)) return; if (d < 1e-3) { dx = .7; dz = .7; d = 1; }
  const f = Math.min((min - d) * 12, 2.6) * dt / d, sa = ma ? (mb ? .5 : 1) : 0, sb = mb ? (ma ? .5 : 1) : 0; if (sa) applyPush(a, dx * f * sa, dz * f * sa); if (sb) applyPush(b, -dx * f * sb, -dz * f * sb);
}
function updateSpacing(dt) {
  if (edit.on) return; const hf = H.state !== 'act', two = hasMate(), mf = two && MM.state !== 'act', hug = social.on && social.kind === 'hug' && social.phase === 'play';
  if (two && !hug) pushApart(hero.root, mateR.root, SEP, dt, hf, mf);
  if (P.state !== 'nap') { if (hf || P.state === 'walk') pushApart(petR.root, hero.root, SEP_PET, dt, true, false); if (two) pushApart(petR.root, mateR.root, SEP_PET, dt, true, false); }
}

/* ═════════════ two speech bubbles that never sit on top of each other ═════════════ */
const BB = { h: { x: 0, y: 0, on: false }, m: { x: 0, y: 0, on: false } };
function placeBubbles(dt) {
  const k = 1 - Math.exp(-dt * 14), W = innerWidth, top = W < 760 ? 232 : 92, pad = 10;
  const anchor = rig => { const p = rig.root.position.clone(); p.y += rig.cur.lie > .5 ? .62 : 1.46; return toScreen(p); };
  const hv = bubT > 0 || bubbleHold, mv = hasMate() && bubMT > 0; if (!hv && !mv) { BB.h.on = BB.m.on = false; return; }
  const hw = bubble.offsetWidth, hh = bubble.offsetHeight, mw = bubbleM.offsetWidth, mh = bubbleM.offsetHeight, [hsx, hsy] = anchor(hero), [msx, msy] = mv ? anchor(mateR) : [0, 0];
  let hx = clamp(hsx, hw / 2 + pad, W - hw / 2 - pad), hy = Math.max(hsy - 28 - hh, top), mx = clamp(msx, mw / 2 + pad, W - mw / 2 - pad), my = Math.max(msy - 28 - mh, top);
  if (hv && mv) {
    const gx = Math.abs(hx - mx), gy = Math.abs((hy + hh / 2) - (my + mh / 2)), nx = hw / 2 + mw / 2 + 12, ny = hh / 2 + mh / 2 + 10;
    if (gx < nx && gy < ny) {
      const dir = msx >= hsx ? 1 : -1, push = (nx - gx) / 2 + 1, ax = hx - dir * push, bx = mx + dir * push;
      if (ax - hw / 2 >= pad && ax + hw / 2 <= W - pad && bx - mw / 2 >= pad && bx + mw / 2 <= W - pad && W > 620) { hx = ax; mx = bx; my = Math.max(top, my - 14); }
      else { my = hy - mh - 12; if (my < top) { my = top; hy = my + mh + 12; } }   // stack: the roommate's bubble steps up above
    }
  }
  const put = (el, s, x, y, sx, w) => { if (!s.on) { s.x = x; s.y = y; s.on = true; } else { s.x += (x - s.x) * k; s.y += (y - s.y) * k; } el.style.transform = `translate(${Math.round(s.x - w / 2)}px,${Math.round(s.y)}px)`; el.style.setProperty('--tx', clamp(sx - s.x, -(w / 2 - 22), w / 2 - 22) + 'px'); };
  if (hv) put(bubble, BB.h, hx, hy, hsx, hw); else BB.h.on = false; if (mv) put(bubbleM, BB.m, mx, my, msx, mw); else BB.m.on = false;
}

/* ═════════════ keepsakes: furniture you cannot buy, each tied to something that happened ═════════════ */
const MEMO = { memBook: '把窗边那朵云夹进了书里', memVase: '假装没看见它闯的祸', memJar: '把迷路的小云装进了瓶子', memNest: '喂了门口那只淋湿的小鸟', memLetter: '往来的信满了 10 封', memPaw: '摸了 50 次宠物', memStar: '对着流星许了愿', memFish: '钓到了 8 种鱼', memLadle: '做出 3 次完美的菜', memBox: '一个音都没弹错', memCup: '接星星拿到 40 分' };
function grantMemo(k) {
  if (state.mem.some(m => m.k === k)) return false; state.mem.push({ k, d: today() }); state.bag[k] = (state.bag[k] || 0) + 1; todayOf().ev.push(`得到了纪念品「${CAT[k].n}」`); SFX.level(); save();
  modal(`<h2>纪念品</h2><img class="giftimg" src="${CAT[k].thumb}" alt=""><p>因为你${MEMO[k]}，得到了「<b>${CAT[k].n}</b>」。它买不到，只属于这一天。已经放进商店的“背包”，可以摆出来。</p><div class="acts"><button class="btn" data-close>收好</button></div>`); setTimeout(checkGoals, 50); return true;
}

/* ═════════════ the home-making handbook: one next step at a time ═════════════ */
const has = k => furn.some(f => f.k === k);
const GOALS = [
  { t: '买下第一件家具', tip: '点右下角“商店”，先挑一件便宜的', ok: () => state.bought >= 1, r: 60 },
  { t: '在灶台玩一次「看火候」', tip: '点“玩”→ 小游戏 → 看火候', ok: () => (state.plays.cook || 0) >= 1, r: 60 },
  { t: '添一张餐桌和一把餐椅', tip: '现在只能站着吃饭', ok: () => has('table') && has('chairA'), r: 80 },
  { t: '去云边钓到 2 种鱼', tip: '点“玩”→ 云边垂钓，不需要任何家具', ok: () => Object.keys(state.fish).length >= 2, r: 80 },
  { t: '买一张沙发', tip: '有了沙发，才有地方发呆', ok: () => has('sofa'), r: 100 },
  { t: '家具达到 10 件', tip: '住得下第二个人，才能请室友', ok: () => furn.length >= 10, r: 150, un: '可以在“住客 → 室友”里请人来同住了' },
  { t: '请一位室友来同住', tip: '“住客 → 室友”', ok: () => hasMate(), r: 100 },
  { t: '买书桌和书桌椅，写第一篇日记', tip: '买齐后点活动里的“写日记”', ok: () => state.diary.length >= 1, r: 120 },
  { t: '收下第一件纪念品', tip: '住客头上冒出“有件小事”时点一下，或者把小游戏玩好', ok: () => state.mem.length >= 1, r: 120 },
  { t: '家具达到 20 件', tip: '一间一间填满', ok: () => furn.length >= 20, r: 300 },
  { t: '买一架钢琴，弹完一首曲子', tip: '钢琴在商店“基础款”里', ok: () => (state.plays.piano || 0) >= 1, r: 200 },
  { t: '钓到 8 种鱼', tip: '有些鱼只在夜里、雨天或黄昏出现', ok: () => Object.keys(state.fish).filter(k => k !== 'boot').length >= 8, r: 300 },
  { t: '家具达到 30 件', tip: '快住满了', ok: () => furn.length >= 30, r: 500 },
  { t: '集齐 6 件纪念品', tip: '在“玩 → 纪念品”里看每一件怎么得到', ok: () => state.mem.length >= 6, r: 600 },
  { t: '家具达到 40 件', tip: '云端小屋落成', ok: () => furn.length >= 40, r: 1000 },
];
const HOMEN = [[0, '毛坯房'], [8, '有点样子了'], [16, '像个家了'], [26, '温馨小窝'], [38, '云端小屋']];
const homeName = () => HOMEN.filter(h => furn.length >= h[0]).pop()[1];
const mateOK = () => state.goal > 5 || hasMate();
function renderGoal() { const g = GOALS[state.goal], el = $('#goal'); el.hidden = !g; if (g) el.innerHTML = `<i>下一步</i><b>${g.t}</b><em>★${g.r}</em>`; }
function checkGoals() {
  let g; while ((g = GOALS[state.goal]) && g.ok()) { state.goal++; state.coins += g.r; SFX.level(); const nx = GOALS[state.goal]; modal(`<h2>安家手册 · 第 ${state.goal} 步完成</h2><p>「${g.t}」做到了，送你 <b>★ ${g.r}</b>。${g.un ? g.un + '。' : ''}</p>${nx ? `<p class="note">下一步：${nx.t}（${nx.tip}）</p>` : '<p class="note">手册翻到了最后一页。这里已经是一个家了。</p>'}<div class="acts"><button class="btn" data-close>好</button></div>`); }
  renderGoal(); renderWho(); save();
}

/* ═════════════ small things that happen: no right answer, only a preference ═════════════ */
const EVENTS = [
  { id: 'cloud', t: '窗边的云', d: (n, p) => `${n}在窗边发现一朵形状很奇怪的云，像一只打哈欠的猫。`, o: [['夹进书里', 'memBook', '把那朵云的一角夹进了书里'], ['拍下来', { coins: 25 }, '给那朵怪云拍了张照'], ['放着不管', { aff: 4 }, '看着那朵怪云慢慢飘走了']] },
  { id: 'knock', t: '掉下来的东西', d: (n, p) => `${p}把台面上的东西一件一件扒拉到地上，还回头看了你一眼。`, o: [['捡起来，哄哄它', { aff: 5 }, '把{p}闯的祸收拾好了'], ['假装没看见', 'memVase', '假装没看见花瓶倒了']] },
  { id: 'half', t: '半句话', d: (n, p) => `${n}在纸上写了半句话就停了：“今天其实……”`, o: [['替它写完', { aff: 6 }, '有人替我把那半句话写完了'], ['明天再看', { coins: 20 }, '那半句话留到了明天']] },
  { id: 'guest', t: '门口的客人', d: (n, p) => `门口的垫子上蹲着一只淋湿的小鸟，${n}看看它，又看看你。`, o: [['喂它一点东西', 'memNest', '喂了门口那只小鸟'], ['让它歇一会儿', { coins: 30 }, '让小鸟在门口歇了一会儿']] },
  { id: 'jar', t: '迷路的云', d: (n, p) => `一小块云从窗缝里挤进来，在屋里转来转去找不到出口。`, o: [['装进瓶子里', 'memJar', '把迷路的小云装进了瓶子'], ['开窗送它走', { aff: 6 }, '开窗把迷路的小云送走了']] },
  { id: 'burn', t: '有一点糊', d: (n, p) => `锅里的东西有一点糊了。${n}端着锅，表情很复杂。`, o: [['一起吃掉', { aff: 5 }, '把那锅有点糊的东西吃完了'], ['重做一份', { coins: 20 }, '把糊掉的那锅重做了一遍']] },
  { id: 'sock', t: '第二只袜子', d: (n, p) => `${n}举着一只袜子找了半天，另一只正被${p}压在肚子底下。`, o: [['告诉它在哪儿', { aff: 4 }, '终于找到了另一只袜子'], ['不说，看它找', { coins: 25 }, '找了一下午袜子']] },
];
let evPend = null, evT = rnd(40, 70);
function tickEvent(dt) {
  if (evPend || state.evDay === today() || edit.on || social.on || mini.on || sheetName || !$('#veil').hidden || H.act === 'sleep') return; evT -= dt; if (evT > 0) return;
  evPend = pick(EVENTS.filter(e => e.id !== state.evLast)); say('(好像有件小事想告诉你 · 点我)', 1e6, true); hero.hop = .01; SFX.soft();
}
function openEvent() {
  const e = evPend, n = CHARS[state.chara].n, p = PETS[state.pet].n; if (!e) return; hideBubble();
  modal(`<h2>${e.t}</h2><p>${e.d(n, p)}</p><div class="acts col">${e.o.map((o, i) => `<button class="btn${i ? ' alt' : ''}" data-ev="${i}">${o[0]}</button>`).join('')}</div><p class="note">没有对错，选你想选的。</p>`, m => {
    m.onclick = ev => { const b = ev.target.closest('[data-ev]'); if (!b) return; const o = e.o[+b.dataset.ev]; evPend = null; state.evDay = today(); state.evLast = e.id; todayOf().ev.push(o[2].replace('{p}', p)); nextModal();
      if (typeof o[1] === 'string') { if (!grantMemo(o[1])) { addCoins(40); toast('这件纪念品已经有了，换成 ★ 40'); } } else { if (o[1].coins) { addCoins(o[1].coins); toast(`★ +${o[1].coins}`); } if (o[1].aff) { addAff(o[1].aff); floater(hero.root.position.clone().setY(1.6), '♥'); toast(`和${n}更近了一点`); } }
      say(pick(['嗯。', '就这么办。', '(点了点头)', persOf(state.chara).yes]), 3); save(); };
  });
}

/* ═════════════ the resident writes first ═════════════ */
const NOTES = {
  yu: { away: d => `你有 ${d} 天没来。窗外的云很厚，我把你的那份茶留着，凉了别怪我。`, any: ['今天数云数到一半忘了。重数。', '冰箱里的布丁我没动。大概。', '没什么事。就是想写一句。'], wx: { rain: '下雨了。伞在门口，不过云上用不着。', snow: '下雪了。我堆了个很小的雪人，化得很快。' } },
  ju: { away: d => `${d} 天没见啦！我每天都在门口蹦一百下等你，腿都粗了一圈！`, any: ['今天太阳超好！我把被子晒得蓬蓬的，等你来躺！', '我学会倒立了！三秒！', '早呀！今天也要好好吃饭！'], wx: { rain: '下雨也没关系！我在屋里跑了二十圈！', snow: '下雪啦下雪啦！快来！' } },
  li: { away: d => `你 ${d} 天没来了，炉子上的汤我热了又热。不急，你慢慢来，汤等得起。`, any: ['今天煮了栗子，给你留了最大的那颗。', '水刚烧开，我想起你爱喝烫一点的。', '慢慢来。我也刚起。'], wx: { rain: '下雨天最适合炖东西了，咕嘟咕嘟的。', snow: '下雪了，袜子要穿厚的那双哦。' } },
  man: { away: d => `你 ${d} 天没来！我做的菜都被我自己吃完了，胖了，你要负责！`, any: ['我发明了一道新菜，名字还没想好，你来起！', '今天的云像刚出炉的面包！好想咬！', '冰箱满了！快来帮忙吃！'], wx: { rain: '下雨啦，我们吃火锅吧！', snow: '下雪了！想吃烤红薯！' } },
  xia: { away: d => `${d} 天没有你的消息。我把想说的话夹在书里，第 ${20 + d * 3} 页，等你来翻。`, any: ['今天读到一句：“云是不必回信的。”可我还是想写给你。', '窗边的光移到了第三格书架，我想起你。', '把今天折了一个角，留给你看。'], wx: { rain: '雨天读旧信最合适。你的每一封我都留着。', snow: '下雪了。很安静，适合想念。' } },
  yun: { away: d => `呼——你 ${d} 天没来，小云朵瘪掉了一点点。快来，噗。`, any: ['呼。今天飘了很远，又飘回来了。', '噗。想你了。就这样。', '今天也是软软的一天，呼。'], wx: { rain: '噗，下雨了，那是我表哥在哭。', snow: '呼——下雪了，凉凉的，喜欢。' } },
};
function charaNote(days) {
  const c = CHARS[state.chara], N = NOTES[c.id] || NOTES.yu, text = days >= 1 ? N.away(days) : (N.wx[wx] && Math.random() < .5 ? N.wx[wx] : pick(N.any));
  state.letters.push({ d: today(), t: hm(), from: 'chara', who: c.n, text, reply: '' }); if (state.letters.length > 40) state.letters.shift(); state.mailNew = true; todayOf().ev.push('给你留了一张纸条'); save();
  modal(`<h2>${c.n}留了一张纸条</h2><div class="letter"><p>${esc(text)}</p></div><p class="note">在下面的“说点什么…”里可以回一句。</p><div class="acts"><button class="btn" data-close>收下</button></div>`);
}
function checkLetterMemo() { if (state.letters.length >= 10) grantMemo('memLetter'); }

/* ═════════════ mini-games ═════════════ */
const mini = { on: false, g: null, id: null, raf: 0, last: 0 };
const MW = 360, MH = 440, INKC = '#5a4a42', PAPER = '#fbf6ec', C1 = '#a9c097', C2 = '#f5a6a0', C3 = '#f4d27a', C4 = '#a9cfd6';
const FONT = (px, w = 500) => `${w} ${px}px "Noto Serif SC","Songti SC",serif`;
const GAMES = {
  cook: { n: '看火候', need: 'counter', act: 'cook', tip: '指针走到绿色时点一下，共三步', desc: '在灶台做一道菜，火候越准菜越好' },
  fish: { n: '云边垂钓', need: null, act: null, tip: '浮漂猛地一沉就点；之后按住让绿框跟住鱼', desc: '什么家具都不用。时间和天气不同，鱼也不同' },
  piano: { n: '跟着弹', need: 'piano', act: 'piano', tip: '音符落到线上时点对应的格子（键盘 D F J K）', desc: '跟着落下的音符弹完一首曲子' },
  arcade: { n: '接星星', need: 'arcade', act: 'arcade', tip: '左右拖动篮子接星星，躲开乌云', desc: '30 秒，接得越多越好' },
};
const RECIPES = [{ n: '一锅焦炭', s: 0, c: '#5b5350' }, { n: '番茄炒蛋', s: 1, c: '#f08a5d' }, { n: '葱油拌面', s: 1, c: '#e8cf8a' }, { n: '紫菜蛋汤', s: 1, c: '#9fb48a' }, { n: '可乐鸡翅', s: 2, c: '#b9733f' }, { n: '鲜肉云吞', s: 2, c: '#f3e3c8' }, { n: '土豆炖牛肉', s: 2, c: '#a8693d' }, { n: '松鼠桂鱼', s: 3, c: '#f2a23a' }, { n: '云朵舒芙蕾', s: 3, c: '#fff1c9' }];
const FISH = [
  { id: 'cotton', n: '棉花鱼', r: 1, c: '#fdf3e3', c2: '#f5c9b8', w: '随时' }, { id: 'wonton', n: '云吞鱼', r: 1, c: '#f3e3c8', c2: '#e9b98a', w: '随时' }, { id: 'puff', n: '泡泡鲀', r: 1, c: '#a9cfd6', c2: '#ffffff', w: '随时', shape: 'puff' },
  { id: 'dawn', n: '晨光鲷', r: 2, c: '#ffd9a0', c2: '#f5a6a0', w: '清晨和白天', ok: () => env.night < .3 }, { id: 'dusk', n: '晚霞鲤', r: 2, c: '#f08a5d', c2: '#c9bfe6', w: '黄昏', ok: () => env.key === 'dusk' }, { id: 'squid', n: '星星鱿', r: 2, c: '#c9bfe6', c2: '#f4d27a', w: '夜晚', ok: () => env.night > .6, shape: 'squid' },
  { id: 'jelly', n: '雨滴水母', r: 2, c: '#bcd9f2', c2: '#ffffff', w: '下雨或下雪时', ok: () => wx === 'rain' || wx === 'snow', shape: 'jelly' }, { id: 'kite', n: '风筝鳐', r: 2, c: '#a9c097', c2: '#f4d27a', w: '有风或多云时', ok: () => wx === 'breeze' || wx === 'cloudy', shape: 'ray' },
  { id: 'moon', n: '月亮鱼', r: 3, c: '#fff6cf', c2: '#f4d27a', w: '夜晚，很少见', ok: () => env.night > .6, shape: 'puff' }, { id: 'rainbow', n: '彩虹鳟', r: 3, c: '#f5a6a0', c2: '#a9cfd6', w: '晴天的白天，很少见', ok: () => wx === 'sunny' && env.night < .3 }, { id: 'post', n: '邮差鱼', r: 3, c: '#8fb0c8', c2: '#f5a6a0', w: '随时，很少见' },
  { id: 'boot', n: '旧靴子', r: 0, c: '#9a8574', c2: '#6f5d50', w: '运气不好的时候', shape: 'boot' },
];
function drawFish(c, f, x, y, s = 1, t = 0) {
  c.save(); c.translate(x, y); c.scale(s, s); c.lineJoin = c.lineCap = 'round'; const wag = Math.sin(t * 7) * .35;
  if (f.shape === 'jelly') { c.fillStyle = f.c; c.beginPath(); c.arc(0, -4, 22, PI, 0); c.quadraticCurveTo(0, 8, -22, -4); c.fill(); c.strokeStyle = f.c; c.lineWidth = 3; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * 8, 0); c.quadraticCurveTo(i * 8 + Math.sin(t * 4 + i) * 5, 12, i * 8, 24); c.stroke(); } c.fillStyle = INKC; c.beginPath(); c.arc(-7, -10, 2.2, 0, 7); c.arc(7, -10, 2.2, 0, 7); c.fill(); }
  else if (f.shape === 'boot') { c.fillStyle = f.c; c.beginPath(); c.roundRect(-10, -24, 18, 34, 5); c.roundRect(-10, 2, 34, 16, 7); c.fill(); c.fillStyle = f.c2; c.fillRect(-12, 16, 38, 5); }
  else if (f.shape === 'ray') { c.fillStyle = f.c; c.beginPath(); c.moveTo(-26, 0); c.quadraticCurveTo(0, -24, 22, 0); c.quadraticCurveTo(0, 24, -26, 0); c.fill(); c.strokeStyle = f.c2; c.lineWidth = 3; c.beginPath(); c.moveTo(-24, 0); c.quadraticCurveTo(-40, wag * 20, -52, wag * 30); c.stroke(); c.fillStyle = INKC; c.beginPath(); c.arc(10, -4, 2.2, 0, 7); c.fill(); }
  else if (f.shape === 'squid') { c.fillStyle = f.c; c.beginPath(); c.ellipse(4, 0, 20, 13, 0, 0, 7); c.fill(); c.strokeStyle = f.c; c.lineWidth = 4; for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(-12, i * 6); c.quadraticCurveTo(-26, i * 8 + wag * 8, -36, i * 10); c.stroke(); } c.fillStyle = f.c2; for (const [a, b] of [[8, -5], [0, 4], [14, 3]]) { c.beginPath(); c.arc(a, b, 2, 0, 7); c.fill(); } c.fillStyle = INKC; c.beginPath(); c.arc(14, -3, 2.2, 0, 7); c.fill(); }
  else { const pf = f.shape === 'puff'; c.fillStyle = f.c2; c.save(); c.translate(pf ? -18 : -22, 0); c.rotate(wag); c.beginPath(); c.moveTo(0, 0); c.lineTo(-16, -11); c.lineTo(-16, 11); c.closePath(); c.fill(); c.restore(); c.fillStyle = f.c; c.beginPath(); c.ellipse(0, 0, pf ? 20 : 26, pf ? 19 : 15, 0, 0, 7); c.fill(); c.fillStyle = f.c2; c.beginPath(); c.ellipse(-2, 5, pf ? 12 : 16, 6, 0, 0, PI); c.fill(); c.beginPath(); c.moveTo(-4, -14); c.quadraticCurveTo(4, -24, 10, -13); c.fill(); c.fillStyle = INKC; c.beginPath(); c.arc(12, -4, 2.4, 0, 7); c.fill(); c.fillStyle = '#f5a6a0'; c.globalAlpha = .7; c.beginPath(); c.arc(9, 3, 3.2, 0, 7); c.fill(); }
  c.restore();
}
const fishIcon = (() => { const cache = {}; return f => cache[f.id] ||= (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 120; drawFish(cv.getContext('2d'), f, 64, 60, 1.5); return cv.toDataURL(); })(); })();
const dishIcon = (() => { const cache = {}; return r => cache[r.n] ||= (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 120; drawDish(cv.getContext('2d'), r, 60, 64, 1.5); return cv.toDataURL(); })(); })();
function drawDish(c, r, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#fff'; c.strokeStyle = '#e6dccb'; c.lineWidth = 2; c.beginPath(); c.ellipse(0, 6, 34, 15, 0, 0, 7); c.fill(); c.stroke(); c.fillStyle = r.c; c.beginPath(); c.ellipse(0, 0, 24, 13, 0, PI, 0); c.ellipse(0, 0, 24, 8, 0, 0, PI); c.fill(); c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.ellipse(-8, -6, 6, 3, -.4, 0, 7); c.fill(); if (r.s === 0) { c.strokeStyle = '#8a8480'; c.lineWidth = 2; for (const i of [-10, 0, 10]) { c.beginPath(); c.moveTo(i, -16); c.quadraticCurveTo(i + 5, -24, i, -32); c.stroke(); } } c.restore(); }
const rate = n => '★'.repeat(n) + '☆'.repeat(3 - n);

function gameCook() {
  const g = { score: 0, over: false, round: 0, x: 0, dir: 1, sp: .9, zone: [.5, .22], marks: [], wait: 0, msg: '', steam: 0, names: ['切菜', '下锅', '调味'] };
  const setRound = () => { g.zone = [rnd(.3, .7), [.24, .18, .13][g.round]]; g.sp = [.85, 1.15, 1.5][g.round]; g.x = Math.random() < .5 ? 0 : 1; g.dir = g.x ? -1 : 1; }; setRound();
  g.update = dt => { g.steam += dt; if (g.wait > 0) { g.wait -= dt; if (g.wait <= 0) { g.round++; if (g.round >= 3) g.over = true; else setRound(); } return; } g.x += g.dir * g.sp * dt; if (g.x > 1) { g.x = 1; g.dir = -1; } if (g.x < 0) { g.x = 0; g.dir = 1; } };
  g.down = () => { if (g.wait > 0 || g.over) return; const d = Math.abs(g.x - g.zone[0]), z = g.zone[1] / 2, p = d < z * .32 ? 3 : d < z ? 2 : d < z * 1.7 ? 1 : 0; g.score += p; g.marks.push(p); g.msg = ['偏了', '还行', '不错', '完美！'][p]; g.wait = .8; p === 3 ? SFX.spark() : p ? SFX.pop() : SFX.bad(); };
  g.draw = c => {
    c.fillStyle = PAPER; c.fillRect(0, 0, MW, MH); c.fillStyle = '#efe5d3'; c.fillRect(0, 250, MW, 190); c.fillStyle = INKC; c.font = FONT(15); c.textAlign = 'center'; c.fillText(`第 ${Math.min(g.round + 1, 3)} / 3 步 · ${g.names[Math.min(g.round, 2)]}`, MW / 2, 34);
    for (let i = 0; i < 3; i++) { c.fillStyle = i < g.marks.length ? [C2, C3, C1, C1][g.marks[i]] : '#e6dccb'; c.beginPath(); c.arc(MW / 2 - 24 + i * 24, 54, 7, 0, 7); c.fill(); }
    const px = MW / 2, py = 200; c.fillStyle = '#f08a5d'; for (let i = -2; i <= 2; i++) { const h = 16 + Math.sin(g.steam * 9 + i * 2) * 6; c.beginPath(); c.moveTo(px + i * 20 - 9, py + 38); c.quadraticCurveTo(px + i * 20, py + 38 - h * 1.6, px + i * 20 + 9, py + 38); c.fill(); }
    c.fillStyle = '#6f6a72'; c.beginPath(); c.roundRect(px - 82, py - 20, 164, 54, [8, 8, 30, 30]); c.fill(); c.fillRect(px + 78, py - 8, 62, 10); c.fillStyle = '#8b8690'; c.beginPath(); c.ellipse(px, py - 20, 82, 18, 0, 0, 7); c.fill(); c.fillStyle = [C1, '#f2c14e', '#e58b5e'][Math.min(g.round, 2)]; c.beginPath(); c.ellipse(px, py - 20, 70, 13, 0, 0, 7); c.fill();
    for (let i = 0; i < 6; i++) { const a = g.steam * (1.5 + g.round) + i * 1.05; c.fillStyle = [C2, C3, '#fff', C1][i % 4]; c.beginPath(); c.arc(px + Math.cos(a) * 44, py - 22 + Math.sin(a) * 7 - Math.abs(Math.sin(a * 2 + i)) * (g.round ? 16 : 3), 7, 0, 7); c.fill(); }
    c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 4; for (let i = -1; i <= 1; i++) { const ph = (g.steam * .5 + i * .33 + 1) % 1; c.globalAlpha = (1 - ph) * .7; c.beginPath(); c.moveTo(px + i * 34, py - 40 - ph * 60); c.quadraticCurveTo(px + i * 34 + 10, py - 55 - ph * 60, px + i * 34, py - 70 - ph * 60); c.stroke(); } c.globalAlpha = 1;
    const bx = 40, bw = MW - 80, by = 320; c.fillStyle = '#e1d6c2'; c.beginPath(); c.roundRect(bx, by, bw, 26, 13); c.fill(); const [zc, zw] = g.zone; c.fillStyle = C1; c.beginPath(); c.roundRect(bx + (zc - zw / 2) * bw, by, zw * bw, 26, 8); c.fill(); c.fillStyle = '#7fa06c'; c.fillRect(bx + (zc - zw * .16) * bw, by, zw * .32 * bw, 26);
    c.fillStyle = INKC; c.beginPath(); c.roundRect(bx + g.x * bw - 4, by - 9, 8, 44, 4); c.fill(); if (g.wait > 0) { c.font = FONT(22, 700); c.fillText(g.msg, MW / 2, 392); }
  };
  g.result = () => {
    const tier = g.score >= 9 ? 3 : g.score >= 6 ? 2 : g.score >= 3 ? 1 : 0, r = pick(RECIPES.filter(x => x.s === tier)), isNew = !state.dishes[r.n]; state.dishes[r.n] = (state.dishes[r.n] || 0) + 1; todayOf().dish.push(r.n); if (tier === 3) { state.perfect = (state.perfect || 0) + 1; if (state.perfect >= 3) setTimeout(() => grantMemo('memLadle'), 600); }
    return { coins: 10 + g.score * 5 + (isNew ? 15 : 0), img: dishIcon(r), title: tier ? `${r.n}　${rate(tier)}` : r.n, text: (tier === 3 ? '火候刚刚好，这一锅可以开店了。' : tier === 2 ? '味道不错，再准一点就完美了。' : tier === 1 ? '能吃。' : '……开窗通通风吧。') + (isNew ? ' 新菜谱！' : '') };
  };
  return g;
}
function gameFish() {
  const pool = FISH.filter(f => !f.ok || f.ok()), wsum = f => [7, 60, 30, 9][f.r]; let tot = 0; for (const f of pool) tot += wsum(f); let r = Math.random() * tot, fish = pool[0]; for (const f of pool) { r -= wsum(f); if (r <= 0) { fish = f; break; } }
  const g = { score: 0, over: false, st: 'wait', t: 0, bite: rnd(1.6, 4), nib: rnd(.6, 1.2), dip: 0, hold: false, zy: .3, zv: 0, fy: .5, ft: .5, fT: 0, prog: .32, got: false, msg: '等浮漂沉下去……', fish, time: 0, zs: .3 - fish.r * .035 };
  g.update = dt => {
    g.time += dt; g.t += dt; g.dip = Math.max(0, g.dip - dt * 3);
    if (g.st === 'wait') { g.nib -= dt; if (g.nib <= 0 && g.t < g.bite - .5) { g.dip = .35; g.nib = rnd(.7, 1.5); tone(520, 0, .05, 'sine', .05); } if (g.t >= g.bite) { g.st = 'bite'; g.t = 0; g.msg = '咬钩了，快点！'; SFX.pop(); tone(880, 0, .12, 'triangle', .14); } }
    else if (g.st === 'bite') { g.dip = 1; if (g.t > .75) { g.st = 'end'; g.t = 0; g.msg = '跑掉了……'; SFX.bad(); } }
    else if (g.st === 'reel') {
      g.fT -= dt; if (g.fT <= 0) { g.ft = rnd(.08, .92); g.fT = rnd(.5, 1.3) / (1 + g.fish.r * .25); } g.fy += (g.ft - g.fy) * Math.min(1, dt * (1.6 + g.fish.r * .7)); g.zv += (g.hold ? 3.2 : -2.6) * dt; g.zv *= .93; g.zy += g.zv * dt; if (g.zy < g.zs / 2) { g.zy = g.zs / 2; g.zv = 0; } if (g.zy > 1 - g.zs / 2) { g.zy = 1 - g.zs / 2; g.zv = 0; }
      const inz = Math.abs(g.fy - g.zy) < g.zs / 2; g.prog += dt * (inz ? .34 : -.24 - g.fish.r * .03); if (g.prog >= 1) { g.got = true; g.st = 'end'; g.t = 0; g.msg = '钓上来了！'; SFX.level(); } if (g.prog <= 0) { g.st = 'end'; g.t = 0; g.msg = '线松了，鱼跑了……'; SFX.bad(); }
    } else if (g.st === 'end' && g.t > 1.1) g.over = true;
  };
  g.down = () => { if (g.st === 'wait') { g.msg = '太早了，鱼被吓跑了。再等等……'; g.t = 0; g.bite = rnd(1.8, 4); SFX.bad(); } else if (g.st === 'bite') { g.st = 'reel'; g.t = 0; g.msg = '按住往上，松手往下，让绿框跟住鱼'; g.hold = true; SFX.click(); } else if (g.st === 'reel') g.hold = true; };
  g.up = () => { g.hold = false; };
  g.draw = c => {
    const n = env.night, sky = c.createLinearGradient(0, 0, 0, MH); sky.addColorStop(0, n > .6 ? '#3d3a66' : env.key === 'dusk' ? '#b6a3cf' : '#a8d2f0'); sky.addColorStop(1, n > .6 ? '#7c6fa6' : env.key === 'dusk' ? '#f6c9a8' : '#eaf5fb'); c.fillStyle = sky; c.fillRect(0, 0, MW, MH);
    if (n > .6) { c.fillStyle = '#fff'; for (let i = 0; i < 26; i++) { c.globalAlpha = .4 + .5 * Math.abs(Math.sin(g.time + i)); c.fillRect((i * 97) % MW, (i * 53) % 190, 2, 2); } c.globalAlpha = 1; }
    if (wx === 'rain' || wx === 'snow') { c.strokeStyle = c.fillStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.5; for (let i = 0; i < 28; i++) { const x = (i * 71 + g.time * (wx === 'rain' ? 40 : 12)) % MW, y = (i * 113 + g.time * (wx === 'rain' ? 420 : 60)) % 250; if (wx === 'rain') { c.beginPath(); c.moveTo(x, y); c.lineTo(x - 3, y + 10); c.stroke(); } else { c.beginPath(); c.arc(x, y, 2, 0, 7); c.fill(); } } }
    const sea = y => { c.beginPath(); c.moveTo(0, MH); for (let x = 0; x <= MW; x += 12) c.lineTo(x, y + Math.sin(x * .03 + g.time * .8 + y) * 7 + Math.sin(x * .011 + y) * 9); c.lineTo(MW, MH); c.fill(); };
    c.fillStyle = 'rgba(255,255,255,.55)'; sea(250); c.fillStyle = '#fbf3e4'; c.beginPath(); c.roundRect(-20, 150, 130, 80, 30); c.fill(); c.fillStyle = '#e9dcc6'; c.fillRect(0, 150, 96, 8);
    c.strokeStyle = '#8a6a4a'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(70, 150); c.quadraticCurveTo(150, 40, 228, 70); c.stroke(); const by = 262 + g.dip * 16 + Math.sin(g.time * 2.2) * 2; c.strokeStyle = 'rgba(90,74,66,.6)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(228, 70); c.lineTo(228, by - 8); c.stroke();
    c.fillStyle = C2; c.beginPath(); c.arc(228, by, 9, PI, 0); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(228, by, 9, 0, PI); c.fill();
    if (g.st === 'bite') { c.fillStyle = '#e8605a'; c.font = FONT(40, 700); c.textAlign = 'center'; c.fillText('!', 228, by - 26); }
    c.fillStyle = 'rgba(255,255,255,.8)'; sea(290); c.fillStyle = '#fff'; sea(330);
    if (g.st === 'reel') {
      const x = 286, y = 40, h = 300; c.fillStyle = 'rgba(255,255,255,.75)'; c.beginPath(); c.roundRect(x - 8, y - 8, 62, h + 16, 16); c.fill(); c.fillStyle = '#dfeaf2'; c.beginPath(); c.roundRect(x, y, 30, h, 10); c.fill();
      c.fillStyle = Math.abs(g.fy - g.zy) < g.zs / 2 ? C1 : '#cfd9c6'; c.beginPath(); c.roundRect(x, y + (1 - g.zy - g.zs / 2) * h, 30, g.zs * h, 8); c.fill(); drawFish(c, g.fish.r ? g.fish : FISH[0], x + 15, y + (1 - g.fy) * h, .42, g.time);
      c.fillStyle = '#e6dccb'; c.beginPath(); c.roundRect(x + 36, y, 10, h, 5); c.fill(); c.fillStyle = C3; const ph = clamp(g.prog, 0, 1) * h; c.beginPath(); c.roundRect(x + 36, y + h - ph, 10, ph, 5); c.fill();
    }
    if (g.st === 'end' && g.got) drawFish(c, g.fish, 180, 200 - Math.sin(Math.min(g.t, 1) * PI) * 40, 2, g.time);
    c.fillStyle = 'rgba(250,245,236,.9)'; c.beginPath(); c.roundRect(20, 386, MW - 40, 38, 19); c.fill(); c.fillStyle = INKC; c.font = FONT(14); c.textAlign = 'center'; c.fillText(g.msg, MW / 2, 410);
  };
  g.result = () => {
    if (!g.got) return { coins: 3, title: '空手而归', text: '鱼跑了。云边的风倒是很舒服。' }; const f = g.fish, isNew = !state.fish[f.id]; state.fish[f.id] = (state.fish[f.id] || 0) + 1; todayOf().fish.push(f.n); if (Object.keys(state.fish).filter(k => k !== 'boot').length >= 8) setTimeout(() => grantMemo('memFish'), 600);
    return { coins: [5, 15, 35, 80][f.r] + (isNew ? 20 : 0), img: fishIcon(f), title: `${f.n}　${f.r ? rate(f.r) : ''}`, text: (f.id === 'boot' ? '谁把靴子扔云里了。' : f.id === 'post' ? '它嘴里叼着一封没写地址的信。' : f.r === 3 ? '很少有人见过这种鱼。' : '放进小桶里，它吐了个泡泡。') + (isNew ? ' 图鉴新发现！' : '') };
  };
  return g;
}
const SONGS = [{ n: '小星星', bpm: .44, s: 'CCGGAAG_FFEEDDC_GGFFEED_GGFFEED_CCGGAAG_FFEEDDC' }, { n: '欢乐颂', bpm: .4, s: 'EEFGGFEDCCDEE_DD_EEFGGFEDCCDED_CC' }];
const NOTE = { C: [262, 0], D: [294, 0], E: [330, 1], F: [349, 1], G: [392, 2], A: [440, 3] };
function gamePiano() {
  const song = pick(SONGS), g = { score: 0, over: false, t: -1.6, notes: [], hit: 0, miss: 0, combo: 0, best: 0, fx: [], song, flash: [0, 0, 0, 0] }; let i = 0, lastLane = -1;
  for (const ch of song.s) { if (ch !== '_') { let [f, lane] = NOTE[ch]; if (ch === 'D' && lastLane === 0 && Math.random() < .5) lane = 1; lastLane = lane; g.notes.push({ t: i * song.bpm, f, lane, st: 0 }); } i++; } g.len = i * song.bpm;
  const FALL = 1.5, LINE = 350, laneW = MW / 4;
  const strike = lane => { g.flash[lane] = 1; let bestN = null, bd = .3; for (const n of g.notes) if (!n.st && n.lane === lane) { const d = Math.abs(n.t - g.t); if (d < bd) { bd = d; bestN = n; } } if (!bestN) { tone(140, 0, .08, 'sine', .06); return; } bestN.st = 1; const perfect = bd < .12; g.score += perfect ? 2 : 1; g.hit++; g.combo++; g.best = Math.max(g.best, g.combo); tone(bestN.f, 0, .7, 'triangle', .22); tone(bestN.f * 2, 0, .5, 'sine', .06); g.fx.push({ lane, t: 0, txt: perfect ? '完美' : '好' }); };
  g.update = dt => { g.t += dt; for (const n of g.notes) if (!n.st && g.t - n.t > .3) { n.st = 2; g.miss++; g.combo = 0; } for (let l = 0; l < 4; l++) g.flash[l] = Math.max(0, g.flash[l] - dt * 5); g.fx = g.fx.filter(f => (f.t += dt) < .6); if (g.t > g.len + .8) g.over = true; };
  g.down = (x, y) => strike(clamp(Math.floor(x / laneW), 0, 3)); g.key = k => { const l = 'dfjk'.indexOf(k.toLowerCase()); if (l >= 0) strike(l); };
  g.draw = c => {
    c.fillStyle = '#fbf6ec'; c.fillRect(0, 0, MW, MH); const cols = [C1, C4, C3, C2];
    for (let l = 0; l < 4; l++) { c.fillStyle = l % 2 ? '#f6efe2' : '#f1e8d8'; c.fillRect(l * laneW, 0, laneW, MH); c.fillStyle = cols[l]; c.globalAlpha = .25 + g.flash[l] * .6; c.beginPath(); c.roundRect(l * laneW + 6, LINE + 14, laneW - 12, 64, 14); c.fill(); c.globalAlpha = 1; c.fillStyle = INKC; c.font = FONT(13); c.textAlign = 'center'; c.fillText('DFJK'[l], l * laneW + laneW / 2, LINE + 52); }
    c.fillStyle = INKC; c.fillRect(0, LINE, MW, 3);
    for (const n of g.notes) { if (n.st === 1) continue; const y = LINE - (n.t - g.t) / FALL * LINE; if (y < -30 || y > MH + 20) continue; c.globalAlpha = n.st === 2 ? .25 : 1; c.fillStyle = cols[n.lane]; c.beginPath(); c.roundRect(n.lane * laneW + 10, y - 13, laneW - 20, 26, 13); c.fill(); c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.roundRect(n.lane * laneW + 18, y - 9, laneW - 36, 6, 3); c.fill(); } c.globalAlpha = 1;
    for (const f of g.fx) { c.globalAlpha = 1 - f.t / .6; c.fillStyle = INKC; c.font = FONT(16, 700); c.fillText(f.txt, f.lane * laneW + laneW / 2, LINE - 20 - f.t * 40); } c.globalAlpha = 1;
    c.fillStyle = 'rgba(251,246,236,.92)'; c.fillRect(0, 0, MW, 40); c.fillStyle = INKC; c.font = FONT(14); c.textAlign = 'left'; c.fillText(`《${song.n}》`, 14, 26); c.textAlign = 'right'; c.fillText(g.combo > 1 ? `连击 ${g.combo}` : '', MW - 14, 26); c.textAlign = 'center';
    if (g.t < 0) { c.font = FONT(34, 700); c.fillText(g.t < -1 ? '准备' : Math.ceil(-g.t * 2) > 1 ? '二' : '一', MW / 2, 200); }
  };
  g.result = () => { const all = g.notes.length, pct = Math.round(g.hit / all * 100), full = g.miss === 0; if (full) setTimeout(() => grantMemo('memBox'), 600); return { coins: 8 + Math.round(g.score * .55) + (full ? 20 : 0), title: `《${song.n}》 ${pct}%`, text: (full ? '一个音都没错，整朵云都安静下来听。' : pct >= 80 ? '很好听，只漏了几个音。' : pct >= 50 ? '磕磕绊绊，但弹完了。' : '钢琴表示它尽力了。') + ` 最高连击 ${g.best}。` }; };
  return g;
}
function gameArcade() {
  const g = { score: 0, over: false, t: 30, x: MW / 2, tx: MW / 2, items: [], sp: 0, stun: 0, fx: [], time: 0 };
  g.update = dt => { g.time += dt; g.t -= dt; if (g.t <= 0) { g.over = true; return; } g.stun = Math.max(0, g.stun - dt); if (!g.stun) g.x += (g.tx - g.x) * Math.min(1, dt * 14); g.sp -= dt; if (g.sp <= 0) { const p = (30 - g.t) / 30, r = Math.random(); g.items.push({ x: rnd(24, MW - 24), y: -20, v: rnd(130, 170) + p * 150, k: r < .2 + p * .12 ? 'bad' : r > .93 ? 'moon' : 'star', rot: rnd(0, 6) }); g.sp = rnd(.28, .5) - p * .14; }
    for (const it of g.items) { it.y += it.v * dt; it.rot += dt * 2; if (!it.dead && it.y > 356 && it.y < 396 && Math.abs(it.x - g.x) < 40) { it.dead = true; if (it.k === 'bad') { g.score = Math.max(0, g.score - 3); g.stun = .5; SFX.bad(); g.fx.push({ x: it.x, y: 360, t: 0, txt: '-3' }); } else { const v = it.k === 'moon' ? 5 : 1; g.score += v; tone(it.k === 'moon' ? 1047 : 784 + Math.random() * 200, 0, .12, 'triangle', .12); g.fx.push({ x: it.x, y: 360, t: 0, txt: '+' + v }); } } } g.items = g.items.filter(i => !i.dead && i.y < MH + 30); g.fx = g.fx.filter(f => (f.t += dt) < .6); };
  g.down = g.move = x => { g.tx = clamp(x, 34, MW - 34); }; g.key = k => { if (k === 'ArrowLeft') g.tx = clamp(g.tx - 46, 34, MW - 34); if (k === 'ArrowRight') g.tx = clamp(g.tx + 46, 34, MW - 34); };
  const star = (c, x, y, r, rot) => { c.beginPath(); for (let i = 0; i < 10; i++) { const a = rot + i * PI / 5, rr = i % 2 ? r * .46 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.fill(); };
  g.draw = c => {
    const sky = c.createLinearGradient(0, 0, 0, MH); sky.addColorStop(0, '#2f2c55'); sky.addColorStop(1, '#6f63a0'); c.fillStyle = sky; c.fillRect(0, 0, MW, MH); c.fillStyle = '#fff'; for (let i = 0; i < 30; i++) { c.globalAlpha = .3 + .5 * Math.abs(Math.sin(g.time * 1.3 + i)); c.fillRect((i * 97) % MW, (i * 61) % 330, 2, 2); } c.globalAlpha = 1;
    for (const it of g.items) { if (it.k === 'bad') { c.fillStyle = '#55506e'; for (const [dx, dy, r] of [[-12, 2, 12], [0, -5, 15], [13, 2, 12]]) { c.beginPath(); c.arc(it.x + dx, it.y + dy, r, 0, 7); c.fill(); } c.fillStyle = C3; c.beginPath(); c.moveTo(it.x + 2, it.y + 10); c.lineTo(it.x - 5, it.y + 22); c.lineTo(it.x + 1, it.y + 21); c.lineTo(it.x - 3, it.y + 32); c.lineTo(it.x + 8, it.y + 17); c.lineTo(it.x + 2, it.y + 18); c.closePath(); c.fill(); } else if (it.k === 'moon') { c.fillStyle = '#fff6cf'; c.beginPath(); c.arc(it.x, it.y, 15, 0, 7); c.fill(); c.fillStyle = '#4a467a'; c.beginPath(); c.arc(it.x + 7, it.y - 4, 12, 0, 7); c.fill(); } else { c.fillStyle = C3; star(c, it.x, it.y, 13, it.rot); } }
    c.fillStyle = 'rgba(255,255,255,.9)'; for (let x = -20; x < MW + 40; x += 46) { c.beginPath(); c.arc(x + Math.sin(g.time + x) * 4, 430, 34, 0, 7); c.fill(); }
    const bx = g.x + (g.stun ? Math.sin(g.time * 60) * 4 : 0); c.fillStyle = '#c99a72'; c.beginPath(); c.roundRect(bx - 36, 366, 72, 34, [4, 4, 18, 18]); c.fill(); c.fillStyle = '#b08460'; c.fillRect(bx - 38, 364, 76, 7); c.strokeStyle = '#b08460'; c.lineWidth = 3; c.beginPath(); c.arc(bx, 366, 30, PI, 0); c.stroke();
    for (const f of g.fx) { c.globalAlpha = 1 - f.t / .6; c.fillStyle = f.txt[0] === '-' ? C2 : '#fff'; c.font = FONT(18, 700); c.textAlign = 'center'; c.fillText(f.txt, f.x, f.y - f.t * 50); } c.globalAlpha = 1;
    c.fillStyle = '#fff'; c.font = FONT(15); c.textAlign = 'left'; c.fillText(`★ ${g.score}`, 14, 28); c.textAlign = 'right'; c.fillText(`${Math.max(0, Math.ceil(g.t))} 秒`, MW - 14, 28);
  };
  g.result = () => { if (g.score >= 40) setTimeout(() => grantMemo('memCup'), 600); return { coins: Math.min(70, 6 + g.score), title: `接到 ${g.score} 分`, text: g.score >= 40 ? '街机屏幕上跳出了“新纪录”。' : g.score >= 20 ? '手感不错。' : '乌云有点多，下次躲着点。' }; };
  return g;
}
const MAKE = { cook: gameCook, fish: gameFish, piano: gamePiano, arcade: gameArcade };
const mgC = $('#mgC'), mgX = mgC.getContext('2d');
function startMini(id) {
  const G = GAMES[id]; if (!G || mini.on || edit.on || social.on) return; if (G.need && !has(G.need)) { SFX.bad(); return toast(`需要先在商店买「${CAT[G.need].n}」`); }
  audioStart(); if (sheetName) closeSheet(); if (G.act && actOK(G.act)) goAct(G.act, 'preview'); const dpr = Math.min(devicePixelRatio || 1, 2); mgC.width = MW * dpr; mgC.height = MH * dpr; mgX.setTransform(dpr, 0, 0, dpr, 0, 0);
  mini.on = true; mini.id = id; mini.g = MAKE[id](); mini.last = performance.now(); $('#mg').hidden = false; $('#mgR').hidden = true; $('#mgT').textContent = G.n; $('#mgTip').textContent = G.tip; SFX.click();
  const loop = now => { if (!mini.on) return; const dt = Math.min(.05, (now - mini.last) / 1000); mini.last = now; const g = mini.g; if (!g.over) { g.update(dt); g.draw(mgX); if (g.over) endMini(); } mini.raf = requestAnimationFrame(loop); }; mini.raf = requestAnimationFrame(loop);
}
function endMini() {
  const id = mini.id, g = mini.g, r = g.result(), d = dayOf(); d.mg ||= {}; d.mg[id] = (d.mg[id] || 0) + 1; const tired = d.mg[id] > 6, coins = Math.max(1, Math.round(r.coins * (tired ? .35 : 1)));
  state.plays[id] = (state.plays[id] || 0) + 1; if (g.score > (state.best[id] || 0)) state.best[id] = g.score; count('play', 99); addCoins(coins); SFX.coin();
  $('#mgR').innerHTML = `${r.img ? `<img src="${r.img}" alt="">` : ''}<h3>${r.title}</h3><p>${r.text}</p><p class="gain">★ +${coins}${tired ? '<small>（今天这个玩得够多了，奖励减少）</small>' : ''}</p><div class="acts"><button class="btn alt" data-mg="x">收工</button><button class="btn" data-mg="again">再来一次</button></div>`; $('#mgR').hidden = false; save();
}
function closeMini() { mini.on = false; cancelAnimationFrame(mini.raf); $('#mg').hidden = true; checkGoals(); if (H.mode !== 'auto') backToNow(); }
const mgPt = e => { const r = mgC.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * MW, (e.clientY - r.top) / r.height * MH]; };
mgC.addEventListener('pointerdown', e => { e.preventDefault(); const g = mini.g; if (g && !g.over) g.down?.(...mgPt(e)); });
mgC.addEventListener('pointermove', e => { const g = mini.g; if (g && !g.over && (e.buttons || e.pointerType !== 'mouse' || mini.id === 'arcade')) g.move?.(...mgPt(e)); });
addEventListener('pointerup', () => mini.g?.up?.()); addEventListener('pointercancel', () => mini.g?.up?.());
addEventListener('keydown', e => { if (!mini.on) return; const g = mini.g; if (e.key === 'Escape') return closeMini(); if (g && !g.over) { if (e.key === ' ') { e.preventDefault(); g.down?.(MW / 2, MH / 2); } else g.key?.(e.key); } });
addEventListener('keyup', e => { if (mini.on && e.key === ' ') mini.g?.up?.(); });
$('#mgX').onclick = closeMini;
$('#mgR').addEventListener('click', e => { const b = e.target.closest('[data-mg]'); if (!b) return; const id = mini.id; if (b.dataset.mg === 'again') { mini.on = false; cancelAnimationFrame(mini.raf); checkGoals(); startMini(id); } else closeMini(); });

function playSheet(tab) {
  if (tab === 'g') { const cur = state.goal; return `<p class="note" style="margin:0 0 8px">现在的家：<b>${homeName()}</b> · ${furn.length} 件家具。一步一步来，每一步都有星星币。</p>${GOALS.map((g, i) => `<div class="task${i > cur ? ' later' : ''}"><div><b>${i + 1}. ${i > cur + 1 ? '？？？' : g.t}</b><span class="note" style="margin:0">${i === cur ? g.tip : i < cur ? '完成了' : ''}</span></div><button class="btn alt" disabled>${i < cur ? '已完成' : '★ ' + g.r}</button></div>`).join('')}`; }
  if (tab === 'm') { const d = dayOf().mg || {}; return `<p class="note" style="margin:0 0 8px">小游戏能赚星星币，玩得好还会得到买不到的纪念品。每个游戏每天前 6 局给全额奖励。</p><div class="cards wide">${Object.entries(GAMES).map(([id, G]) => { const lock = G.need && !has(G.need); return `<button class="card game${lock ? ' lock' : ''}" data-game="${id}"><b>${G.n}</b><span>${G.desc}</span><span class="price${lock ? ' poor' : ' have'}">${lock ? '需要「' + CAT[G.need].n + '」' : '最高 ' + (state.best[id] || 0) + ' · 今天 ' + (d[id] || 0) + ' 局'}</span></button>`; }).join('')}</div>`; }
  if (tab === 'f') { const got = FISH.filter(f => state.fish[f.id]).length; return `<p class="note" style="margin:0 0 8px">已发现 <b>${got} / ${FISH.length}</b> 种。没见过的鱼会提示它什么时候出现。</p><div class="cards">${FISH.map(f => state.fish[f.id] ? `<div class="card"><img class="sq" src="${fishIcon(f)}" alt=""><b>${f.n}</b><span>${f.r ? rate(f.r) : '……'} · 钓到 ${state.fish[f.id]} 次</span></div>` : `<div class="card lock"><span class="solo">？</span><b>？？？</b><span>${f.w}</span></div>`).join('')}</div><div class="sec"></div><button class="btn" data-game="fish">去钓鱼</button>`; }
  if (tab === 'r') { const got = RECIPES.filter(r => state.dishes[r.n]).length; return `<p class="note" style="margin:0 0 8px">已做出 <b>${got} / ${RECIPES.length}</b> 道。火候越准，越容易做出星级高的菜。</p><div class="cards">${RECIPES.map(r => state.dishes[r.n] ? `<div class="card"><img class="sq" src="${dishIcon(r)}" alt=""><b>${r.n}</b><span>${r.s ? rate(r.s) : '失败作'} · 做过 ${state.dishes[r.n]} 次</span></div>` : `<div class="card lock"><span class="solo">？</span><b>？？？</b><span>${r.s ? rate(r.s) : '失败作'}</span></div>`).join('')}</div><div class="sec"></div><button class="btn" data-game="cook">去做饭</button>`; }
  if (tab === 'k') { const ks = Object.keys(MEMO); return `<p class="note" style="margin:0 0 8px">已收下 <b>${state.mem.length} / ${ks.length}</b> 件。纪念品买不到，每一件都对应一件发生过的事。</p><div class="cards">${ks.map(k => { const m = state.mem.find(x => x.k === k); return m ? `<div class="card"><img class="sq" src="${CAT[k].thumb}" alt=""><b>${CAT[k].n}</b><span>${m.d} · ${MEMO[k]}</span></div>` : `<div class="card lock"><span class="solo">？</span><b>${CAT[k].n}</b><span>还没发生</span></div>`; }).join('')}</div>`; }
  return '';
}
