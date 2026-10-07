/* Cloud voyage. The artwork is an interactive storybook, the 3D home remains editable. */
state.journey = restoreJourney(state.journey);
const voyage = { on: false, game: null, raf: 0, timers: [], focus: null, focusSelector: null, modalKind: '', modalVersion: 0, ready: false, photos: new Map() };
const J_ART = n => `public/art/scene-${String(n).padStart(2, '0')}.webp`;
const J_THUMB = n => `public/art/thumb-${String(n).padStart(2, '0')}.webp`;
const J_PORTRAITS = [12, 13, 11, 14, 15, 16];
const J_HOST_ART = n => `public/art/resident-${J_PORTRAITS[n]}.webp`;
const jRoom = () => JOURNEY_ROOMS.find(r => r.id === state.journey.room) || JOURNEY_ROOMS[0];
const jProgress = () => state.journey.rooms[jRoom().id] || { found: [], marks: [], choice: null, best: 0, postcard: false };
const jEscape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const jIcon = name => name === 'sound' ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9zM16.5 8.5a5 5 0 0 1 0 7"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9zM17 9l5 6M22 9l-5 6"/></svg>';
function jAnnounce(t) { $('#jAnnouncement').textContent = t; }
function jLater(fn, ms) { const id = setTimeout(fn, ms); voyage.timers.push(id); return id; }
function jClearGame() { cancelAnimationFrame(voyage.raf); voyage.raf = 0; voyage.game = null; voyage.timers.forEach(clearTimeout); voyage.timers = []; }
function jOpen(content, kind = '', extra = '') {
  jClearGame();
  if ($('#jOverlay').hidden && document.activeElement !== document.body) voyage.focus = document.activeElement;
  voyage.modalVersion++;
  voyage.modalKind = kind;
  const d = $('#jDialog'); d.className = `j-dialog ${extra}`;
  d.setAttribute('aria-label', ({map:'云海地图',album:'旅居手册',story:'住客故事',game:'房间小游戏',photo:'旅居照片',residents:'云上住客',festival:'云端晚会'})[kind] || '云上旅居');
  d.innerHTML = `<button class="j-close" data-j="close" aria-label="关闭面板">×</button>${content}`;
  $('#jOverlay').hidden = false; d.scrollTop = 0; d.focus();
}
function jClose() {
  jClearGame(); $('#jOverlay').hidden = true; voyage.modalKind = '';
  const target = voyage.focus?.isConnected ? voyage.focus : voyage.focusSelector ? document.querySelector(voyage.focusSelector) : null;
  if (target?.getClientRects().length) target.focus();
  else if (voyage.on) $('#jTasks button')?.focus();
}
function jApply(action) {
  const result = journeyAction(state.journey, action);
  state.journey = result.state;
  if (result.reward) { addCoins(result.reward); SFX.coin(); }
  if (result.postcard) {
    const room = JOURNEY_ROOMS.find(r => r.id === result.postcard);
    state.bag[room.reward] = (state.bag[room.reward] || 0) + 1;
    SFX.level();
  }
  save(); jRender();
  return result;
}
function jRender() {
  const r = jRoom(), p = jProgress(), stats = journeyStats(state.journey), index = JOURNEY_ROOMS.indexOf(r);
  document.documentElement.style.setProperty('--j-room', r.color);
  $('#jNumber').textContent = `STAY ${String(index + 1).padStart(2,'0')} / 10`;
  $('#jTitle').textContent = r.n; $('#jEnglish').textContent = r.en; $('#jIntro').textContent = r.intro; $('#jMood').textContent = r.mood;
  $('#jProgress').textContent = `${p.marks.length} / 3`;
  const tasks = [
    ['discover', '寻找三处小回响', p.marks.includes('discover') ? '每一件小物，都有了故事' : `已找到 ${p.found.length} / 3 · 点场景里的微光`, '✧'],
    ['ritual', r.ritual, p.marks.includes('ritual') ? `最好成绩 ${p.best} · 可以再玩一次` : '完成这一站的专属小游戏', '♧'],
    ['story', '留一点时间给朋友', p.marks.includes('story') ? '一段被好好听见的心事' : `听${CHARS[r.host].n}说说今天`, '♡']
  ];
  $('#jTasks').innerHTML = tasks.map(([kind,title,tip,icon]) => `<button class="j-task ${p.marks.includes(kind)?'done':''}" data-j="${kind}" aria-label="${jEscape(title+'，'+tip)}"><span class="j-task-icon">${p.marks.includes(kind)?'✓':icon}</span><span><b>${title}</b><small>${tip}</small></span><span class="j-task-chevron">↗</span></button>`).join('');
  $('#jHostArt').src = J_HOST_ART(r.host); $('#jHostArt').alt = CHARS[r.host].n;
  $('#jHostName').textContent = CHARS[r.host].n;
  const art = $('#jArt');
  if (art.getAttribute('src') !== J_ART(r.art)) {
    art.style.opacity = '.2'; $('#jImageStatus').hidden = false; $('#jImageStatus').textContent = '正穿过这一片云……';
    art.onload = () => { art.style.opacity = '1'; $('#jImageStatus').hidden = true; };
    art.onerror = () => { art.style.opacity = '1'; $('#jImageStatus').hidden = false; $('#jImageStatus').textContent = '这一站的画面暂时没加载好。可以切到其他房间再回来，或检查 public/art 文件夹是否完整。'; };
    art.src = J_ART(r.art); art.alt = `${r.n}，${r.mood}的云上小屋，寻找三个发光的小物件`;
  }
  $('#jHotspots').innerHTML = r.clues.map((clue,i) => `<button class="j-hotspot ${p.found.includes(i)?'found':''}" data-j="clue" data-clue="${i}" style="left:${clue.x}%;top:${clue.y}%" aria-label="${jEscape(clue.n)}${p.found.includes(i)?'，已发现':''}"><span>${p.found.includes(i)?'✓':'✧'}</span><em>${clue.n}</em></button>`).join('');
  const time = state.journey.time;
  $('#jScene').dataset.time = time; $('#jScene').classList.toggle('no-hints', !state.journey.hints);
  $('#jTime').textContent = {day:'☼ 白昼',dusk:'◒ 黄昏',night:'☾ 夜色'}[time];
  $('#jWeather').textContent = r.id === 'winter' ? '❅ 窗外有小雪' : r.id === 'coast' ? '≈ 风里有海盐' : time === 'night' ? '☾ 云海已入眠' : time === 'dusk' ? '◒ 落日还没走' : '☼ 日光正好';
  $('#jHints').setAttribute('aria-pressed', state.journey.hints);
  $('#jSceneLabel').textContent = `${String(index+1).padStart(2,'0')} — ${r.n}`;
  $('#jCoins').textContent = state.coins; $('#jStamps').textContent = `${stats.completed} / 10`;
  $('#jSound').innerHTML = jIcon(AU.on?'sound':'mute'); $('#jSound').setAttribute('aria-label', AU.on?'关闭声音':'开启声音'); $('#jSound').setAttribute('aria-pressed', AU.on);
  $('#jFestival').classList.toggle('ready', stats.festivalReady && !state.journey.ending);
  $('#jFooterText').textContent = stats.completed === 10 ? '十种风景，都变成了回家的路。' : stats.festivalReady && !state.journey.ending ? '朋友们都到了。今晚，一起把云海点亮。' : p.postcard ? '这一站的小确幸，已经收进旅居手册。' : '今天也可以，从一件小事开始。';
}
function jEnter() {
  if (!voyage.ready) return;
  if (mini.on) closeMini(); if (edit.on) setEdit(false); if (sheetName) closeSheet();
  if (!$('#veil').hidden) { modalQ.length = 0; nextModal(); }
  voyage.on = true; $('#journey').hidden = false; $('#jReturn').hidden = true; document.body.classList.add('journey-on');
  jRender();
}
function jHome() {
  jClose(); voyage.on = false; $('#journey').hidden = true; $('#jReturn').hidden = false; document.body.classList.remove('journey-on');
  view.wide = true; view.pause = 0; camDist(wideDist()); resize();
  toast('旅居奖励家具在「商店 → 背包」，取出后可以自由摆放。');
}
function jTravel(id) {
  if (!JOURNEY_ROOMS.some(r => r.id === id)) return;
  jClose(); jApply({type:'travel',room:id}); SFX.whoosh(); jAnnounce(`已到达${jRoom().n}`);
  // Preload only the adjacent stop rather than decoding every full scene at once.
  const index = JOURNEY_ROOMS.findIndex(r => r.id === id);
  const next = JOURNEY_ROOMS[(index+1)%JOURNEY_ROOMS.length]; const im = new Image(); im.src = J_ART(next.art);
}
function jMap() {
  const stats = journeyStats(state.journey);
  jOpen(`<div class="j-dialog-kicker">THE CLOUD ATLAS</div><h2>下一站，想去哪里？</h2><p>十间漂在云上的小屋。没有赶路的时刻表，只收藏让你想停下来的风景。</p><div class="j-map-grid">${JOURNEY_ROOMS.map((r,i) => { const p=state.journey.rooms[r.id]; return `<button class="j-map-card" data-j="travel" data-room="${r.id}" aria-current="${r.id===jRoom().id}"><img src="${J_THUMB(r.art)}" alt="${r.n}" loading="eager"><small>STAY ${String(i+1).padStart(2,'0')}</small><b>${r.n}</b><em>${r.mood}</em>${p?.postcard?'<span class="j-card-stamp">✓</span>':''}</button>`; }).join('')}</div><div class="j-note">已收集 ${stats.completed} 张旅居邮票 · 所有房间都可以直接到访。在每间小屋完成三件小事，留下一张自己的邮票。</div>`, 'map');
}
function jAlbum() {
  const stats = journeyStats(state.journey);
  jOpen(`<div class="j-dialog-kicker">A JOURNAL OF SMALL JOYS</div><h2>把小确幸，收进这一页。</h2><p>寻找三件小物，完成房间仪式，听完一段故事。三枚小印章，留住一整段旅居时光。</p><div class="j-album-summary"><span><b>${stats.completed}</b>/ 10 张邮票</span><span><b>${stats.stamps}</b>/ 30 枚印章</span><span>${state.journey.ending?'已参加云端晚会':stats.festivalReady?'今晚的聚会已经准备好了':'集齐 5 张邮票，开启云端晚会'}</span></div><div class="j-album-grid">${JOURNEY_ROOMS.map(r => {const p=state.journey.rooms[r.id];return `<button class="j-postcard ${p?.postcard?'':'missing'}" data-j="${p?.postcard?'postcard':'travel'}" data-room="${r.id}"><img src="${J_THUMB(r.art)}" alt="${r.n}" loading="eager">${p?.postcard?'<span class="j-postmark">STAY<br>✓</span>':''}<b>${r.n}</b><small>${p?.postcard?r.token:`${p?.marks.length||0} / 3 枚印章 · 去这一站`}</small></button>`;}).join('')}</div>`, 'album');
}
function jDiscover(clue) {
  const r=jRoom(), c=r.clues[clue]; if(!c) return;
  const out=jApply({type:'discover',clue}); SFX.paper();
  jOpen(`<div class="j-dialog-kicker">A SMALL DISCOVERY</div><div class="j-big-symbol">✧</div><h2>${c.n}</h2><p class="j-lead">${c.text}</p><div class="j-note">${out.reward?`星星币 +${out.reward} · `:''}已找到 ${jProgress().found.length} / 3 处小回响${out.newMark?' · 盖好探索印章':''}</div><div class="j-actions"><button class="j-primary" data-j="${out.postcard?'postcard':'close'}" data-room="${r.id}">${out.postcard?'收下这一站的邮票':'把这个瞬间收好'}</button></div>`, 'clue', 'compact');
  jAnnounce(`发现${c.n}`);
}
function jStory() {
  const r=jRoom(), c=CHARS[r.host], p=jProgress();
  jOpen(`<div class="j-story-layout"><img class="j-story-portrait" src="${J_HOST_ART(r.host)}" alt="${c.n}"><div><div class="j-dialog-kicker">A MOMENT WITH ${c.n}</div><h2>听${c.n}说</h2><p>${r.story.line}</p>${p.choice!==null?`<p class="j-story-response">${r.story.replies[p.choice]}</p><button class="j-secondary" data-j="close">陪他把这一刻收好</button>`:`<div class="j-choices">${r.story.choices.map((t,i)=>`<button data-j="choice" data-choice="${i}">${t} <span>↗</span></button>`).join('')}</div>`}</div></div>`, 'story');
}
function jChoose(choice) {
  if (![0,1].includes(choice)) return;
  const r=jRoom(), out=jApply({type:'story',choice}); SFX.soft();
  jOpen(`<div class="j-story-layout"><img class="j-story-portrait" src="${J_HOST_ART(r.host)}" alt="${CHARS[r.host].n}"><div><div class="j-dialog-kicker">THANK YOU FOR LISTENING</div><h2>心事被听见了。</h2><p class="j-story-response">${r.story.replies[jProgress().choice]}</p><div class="j-note">${out.reward?`星星币 +${out.reward} · `:''}故事印章已收好${out.postcard?' · 这一站的小确幸已经集齐':''}</div><button class="j-primary" data-j="${out.postcard?'postcard':'close'}" data-room="${r.id}">${out.postcard?'收下旅居邮票':'回到小屋'}</button></div></div>`, 'story');
}
function jPostcard(id) {
  const r=JOURNEY_ROOMS.find(r=>r.id===id);if(!r||!state.journey.rooms[id]?.postcard)return;
  jOpen(`<div class="j-dialog-kicker">A STAMP FOR THIS LITTLE STAY</div><h2>${r.token}</h2><figure class="j-polaroid"><img src="${J_ART(r.art)}" alt="${r.n}"><figcaption>${r.n} · ${CHARS[r.host].n}<small>DISCOVER / PLAY / LISTEN</small></figcaption></figure><p>这段回忆已经永久收进旅居手册。<br>还有一件「${CAT[r.reward].n}」，正在 3D 小屋的背包里等你。</p><div class="j-actions"><button class="j-secondary" data-j="photo" data-room="${id}">留一张照片</button><button class="j-primary" data-j="map">去下一站</button></div>`, 'postcard', 'compact');
}
function jResidents() {
  jOpen(`<div class="j-dialog-kicker">THE PEOPLE THAT MAKE IT HOME</div><h2>有人陪着，就是小屋。</h2><p>选择陪你生活的住客，也会同步到原来的 3D 小屋。每位旅居主人，都有自己的心事。</p><div class="j-residents">${CHARS.map((c,i)=>`<button class="j-resident" data-j="resident" data-resident="${i}" aria-pressed="${state.chara===i}"><img src="${J_HOST_ART(i)}" alt="${c.n}" loading="lazy"><b>${c.n}</b><small>${c.tag}</small></button>`).join('')}</div><div class="j-note">现在陪你生活的是 ${CHARS[state.chara].n}。旅居时，听听不同主人的故事；回家后，给自己的住客写一封信。</div>`, 'residents');
}
function jAbout() {
  jOpen(`<div class="j-dialog-kicker">WELCOME TO CLOUD HOUSE</div><div class="j-big-symbol">☁</div><h2>把日子，住成喜欢的样子。</h2><p class="j-lead">一封空白的明信片，<br>十间漂在云上的小屋，<br>还有一些等你听见的小小心事。</p><div class="j-note">✧ 点微光，找到房间里的三件小物<br>♧ 玩一场专属小游戏<br>♡ 听主人讲完故事，留一句回应<br><br>集齐三枚印章，收下旅居邮票。<br>五张邮票后，朋友们会为你办一场云端晚会。</div><div class="j-actions"><button class="j-primary" data-j="begin">从这一盏灯开始</button></div><p class="j-caption">没有倒计时，也没有体力限制。慢一点也很好。</p>`, 'about', 'compact');
}
function jFestival() {
  const stats=journeyStats(state.journey);
  if(!stats.festivalReady) {
    jOpen(`<div class="j-dialog-kicker">SAVE A SEAT FOR TONIGHT</div><div class="j-big-symbol">✦</div><h2>今晚，云海会亮起来。</h2><p class="j-lead">再收下 ${5-stats.completed} 张旅居邮票，<br>就能把一路遇见的朋友请到家里。<br>每个故事，都有一个位置。</p><div class="j-progress-line"><i style="width:${stats.completed/5*100}%"></i></div><div class="j-actions"><button class="j-primary" data-j="map">再去拜访一个朋友</button></div>`, 'festival', 'compact');return;
  }
  jOpen(`<div class="j-dialog-kicker">ALL THE LITTLE ROADS LEAD HOME</div><h2>${state.journey.ending?'灯还亮着，朋友们都在。':'今晚，把云海点亮。'}</h2><div class="j-festival-line">${CHARS.map((c,i)=>`<img src="${J_HOST_ART(i)}" alt="${c.n}">`).join('')}</div><p class="j-lead">栗子带来了热可可，橘子捧着贝壳。<br>小满抱着一盆刚开的花，知遥念了一首短诗。<br>雪球把最软的位置让给你。<br><br>阿屿最后关上门，轻轻说：<br>“你看，小屋不需要很大。装得下这些，就够了。”</p><div class="j-note">${state.journey.ending?'旅居故事已经落幕，生活还可以继续。十间小屋，都随时欢迎你。':'这一路留下的五张邮票，变成了今晚的五盏灯。'}</div><div class="j-actions">${state.journey.ending?'<button class="j-secondary" data-j="album">翻翻旅居手册</button><button class="j-primary" data-j="home">回我的 3D 小屋</button>':'<button class="j-primary" data-j="ending">和大家一起许个愿</button>'}</div>`, 'festival', 'compact');
}
async function jPhoto(id = jRoom().id) {
  const r=JOURNEY_ROOMS.find(r=>r.id===id)||jRoom();
  jOpen(`<div class="j-dialog-kicker">A POSTCARD FROM THE CLOUDS</div><h2>把这一刻，寄给未来。</h2><figure class="j-polaroid"><img src="${J_ART(r.art)}" alt="${r.n}"><figcaption>${r.n}<small>CLOUD HOUSE · ${today()}</small></figcaption></figure><div id="jPhotoActions"><p>正在把回忆装进相纸……</p></div>`, 'photo', 'compact');
  const version = voyage.modalVersion;
  try {
    let url=voyage.photos.get(r.id);
    if(!url) {
      const im=new Image(); im.src=J_ART(r.art); await im.decode();
      const cv=document.createElement('canvas');cv.width=1260;cv.height=1220;const x=cv.getContext('2d');
      x.fillStyle='#fbf9ef';x.fillRect(0,0,1260,1220);x.drawImage(im,40,40,1180,1000);
      x.fillStyle='#57634e';x.textAlign='center';x.font='32px "Noto Serif SC","Songti SC",serif';x.fillText(`${r.n} · ${r.token}`,630,1100);
      x.font='15px Georgia,serif';x.fillStyle='#a09c88';x.fillText(`CLOUD HOUSE   /   ${today()}`,630,1150);
      const blob=await new Promise(resolve=>cv.toBlob(resolve,'image/png'));if(!blob)throw new Error('无法生成照片');url=URL.createObjectURL(blob);voyage.photos.set(r.id,url);
    }
    if(voyage.modalKind!=='photo'||voyage.modalVersion!==version||!$('#jPhotoActions')) return;
    $('#jPhotoActions').innerHTML=`<div class="j-actions"><a class="j-download" href="${url}" download="云端小屋-${r.n}.png">保存这张明信片 ↓</a><button class="j-secondary" data-j="close">收好了</button></div>`;SFX.shutter();
  } catch {
    if(voyage.modalKind==='photo'&&voyage.modalVersion===version&&$('#jPhotoActions')) $('#jPhotoActions').innerHTML='<p>长按或右键上方照片保存，也可以稍后重新生成明信片。</p><button class="j-secondary" data-j="close">收好了</button>';
  }
}
function jCoins() {
  const r=jRoom();
  jOpen(`<div class="j-dialog-kicker">LITTLE TREASURES FOR YOUR HOME</div><h2>把风景，带一点回家。</h2><div class="j-furniture"><img src="public/art/furniture-${r.furniture}.webp" alt="${r.n}的家具风格参考"><p>你有 <b>${state.coins}</b> 枚星星币。<br><br>首次发现小物、完成游戏和听完故事，都能收下星星币。完成一站，还会得到一件真正可以放进 3D 小屋的家具。<br><br>这张图片是本房间的风格收藏页。</p></div><div class="j-actions"><button class="j-secondary" data-j="close">继续旅居</button><button class="j-primary" data-j="home">回家布置家具</button></div>`, 'coins');
}

/* Ritual games share lifecycle and accessibility, but have different rules and decisions. */
const J_GAME_INFO = {
  brew: ['把温度，留在刚好的地方。','指针到绿色区间时按下按钮，共三次。越靠近中心，味道越好。也可以按空格。'],
  pairs: ['把散落的小收藏，一对一对找回来。','翻开两张卡片，找出相同的小物。没有时间限制，记住刚才看见的位置。'],
  melody: ['先听一遍，再把声音还给风。','看亮起的四个音，记住顺序，再依次点回来。键盘 1、2、3、4 也能弹奏。'],
  stars: ['星星都在，等你连成一条路。','按 1 到 6 的顺序点击星星，画出今晚的星座。键盘 1 至 6 同样可以连接。']
};
function jRitualStart() {
  const r=jRoom(), info=J_GAME_INFO[r.game];
  jOpen(`<div class="j-dialog-kicker">A SMALL RITUAL · ${r.n}</div><h2>${r.ritual}</h2><p class="j-lead">${info[0]}</p><div class="j-note">${info[1]}<br>完成度达到 50，盖好这一站的仪式印章。可以随时重玩。</div><div class="j-actions"><button class="j-primary" data-j="game-start">开始这件小事</button></div>${jProgress().best?`<p class="j-caption">最好的一次：${jProgress().best} 分</p>`:''}`, 'game', 'game-dialog');
}
function jGameShell(body, tip) {
  jOpen(`<div class="j-dialog-kicker">${jRoom().en}</div><h2>${jRoom().ritual}</h2><p>${tip}</p><div id="jGameBody">${body}</div><div class="j-game-feedback" id="jGameFeedback" role="status" aria-live="polite"></div>`, 'game','game-dialog');
}
function jGameFinish(score) {
  if(!voyage.game||voyage.game.room!==jRoom().id)return;
  const r=jRoom(), passed=score>=50;
  const out=passed?jApply({type:'ritual',score}):{reward:0,postcard:null};
  const repeated=passed&&!out.reward;
  SFX[passed?'spark':'soft']();
  jOpen(`<div class="j-dialog-kicker">${passed?'A MOMENT WELL SPENT':'TAKE YOUR TIME'}</div><h2>${passed?'把这件小事，做好了。':'再慢一点，就刚刚好。'}</h2><div class="j-game-score">${score}<small> / 100</small></div><p>${passed?(score>=90?'这一次，连云朵都忍不住鼓掌。':'小小的专注，也会让今天变得不一样。'):'这次还差一点点。可以马上再试，不会扣星星币。'}</p><div class="j-note">${out.reward?`星星币 +${out.reward} · 仪式印章已收好`:repeated?`这一站的奖励已经收过了 · 最好成绩 ${jProgress().best} 分`:passed?'仪式印章已收好':'完成度达到 50，就能留下仪式印章'}</div><div class="j-actions"><button class="j-secondary" data-j="game-start">再试一次</button><button class="j-primary" data-j="${out.postcard?'postcard':'close'}" data-room="${r.id}">${out.postcard?'收下旅居邮票':'回到小屋'}</button></div>`, 'game','game-dialog');
  jAnnounce(`小游戏完成，${score}分${passed?'，获得仪式印章':''}`);
}
function jGameFeedback(t) { const el=$('#jGameFeedback');if(el)el.textContent=t; }
function jBrewGame() {
  jGameShell('<div class="j-game-progress" id="jBrewSteps"><i></i><i></i><i></i></div><div class="j-game-field"><div class="j-cup"><div class="j-cup-fill" id="jCupFill" style="transform:scaleY(.2)"></div></div><div class="j-brew-track"><span class="j-brew-zone"></span><i class="j-brew-needle" id="jNeedle"></i></div><div class="j-brew-caption" id="jBrewCaption">第一步 · 让温度慢慢升起来</div><button class="j-primary j-game-start" data-j="brew-hit">现在，刚刚好</button></div>','指针到绿色区间时点一下，越靠近中心越好。空格也可以。');
  const g=voyage.game={type:'brew',room:jRoom().id,step:0,scores:[],start:performance.now(),locked:false};
  const frame=now=>{if(voyage.game!==g)return;g.pos=(Math.sin((now-g.start)/760*(1+g.step*.16)-Math.PI/2)+1)/2;$('#jNeedle').style.left=`${g.pos*100}%`;voyage.raf=requestAnimationFrame(frame);};voyage.raf=requestAnimationFrame(frame);
}
function jBrewHit() {
  const g=voyage.game;if(g?.type!=='brew'||g.locked)return;g.locked=true;
  const score=Math.round(Math.max(0,100-Math.abs(g.pos-.5)*200));g.scores.push(score);
  $('#jBrewSteps').children[g.step].classList.add('on');$('#jCupFill').style.transform=`scaleY(${(g.step+1)/3})`;
  SFX[score>=70?'coin':'soft']();jGameFeedback(score>=85?'正好！这一口很温柔。':score>=50?'不错，香气已经出来了。':'偏了一点，下一步慢慢来。');
  g.step++;
  jLater(()=>{if(voyage.game!==g)return;if(g.step===3)jGameFinish(Math.round(g.scores.reduce((a,b)=>a+b,0)/3));else{g.start=performance.now();g.locked=false;$('#jBrewCaption').textContent=['','第二步 · 加一点耐心','第三步 · 留一口温柔'][g.step];}},600);
}
function jPairsGame() {
  const r=jRoom(), symbols=r.id==='coast'?['❋','≈','♧']:r.id==='palace'?['♡','♔','✦']:['☼','♧','❋'];
  const cards=[0,1,2,0,1,2];for(let i=cards.length-1;i>0;i--){const k=Math.floor(Math.random()*(i+1));[cards[i],cards[k]]=[cards[k],cards[i]];}
  jGameShell(`<div class="j-game-progress" id="jPairSteps"><i></i><i></i><i></i></div><div class="j-game-field"><div class="j-pair-grid">${cards.map((v,i)=>`<button class="j-pair" data-j="pair" data-card="${i}" aria-label="翻开第${i+1}张卡片"><span>✧</span></button>`).join('')}</div></div>`,'翻开两张卡片，找到相同的小收藏。没有倒计时。');
  voyage.game={type:'pairs',room:r.id,cards,symbols,open:[],matched:[],turns:0,locked:false};
}
function jPairFlip(i) {
  const g=voyage.game;if(g?.type!=='pairs'||g.locked||!Number.isInteger(i)||i<0||i>5||g.open.includes(i)||g.matched.includes(i))return;
  const el=$(`[data-card="${i}"]`);el.classList.add('shown');el.innerHTML=`<span>${g.symbols[g.cards[i]]}</span>`;el.setAttribute('aria-label',`第${i+1}张卡片，图案${g.cards[i]+1}`);g.open.push(i);SFX.click();
  if(g.open.length<2)return;g.turns++;g.locked=true;
  const[a,b]=g.open;
  if(g.cards[a]===g.cards[b]){
    g.matched.push(a,b);g.open=[];document.querySelectorAll(`[data-card="${a}"],[data-card="${b}"]`).forEach(el=>el.classList.add('matched'));$('#jPairSteps').children[g.matched.length/2-1].classList.add('on');SFX.soft();jGameFeedback('找到了，一对小回忆。');
    jLater(()=>{if(voyage.game!==g)return;g.locked=false;if(g.matched.length===6)jGameFinish(Math.max(55,100-(g.turns-3)*5));},450);
  }else{
    jGameFeedback('记住它们的位置，再看看另外两张。');jLater(()=>{if(voyage.game!==g)return;for(const n of g.open){const el=$(`[data-card="${n}"]`);el.classList.remove('shown');el.innerHTML='<span>✧</span>';el.setAttribute('aria-label',`翻开第${n+1}张卡片`);}g.open=[];g.locked=false;},850);
  }
}
const J_NOTES=[392,440,523.25,659.25];
function jNoteLight(i) {
  const el=$(`[data-note="${i}"]`);if(!el)return;el.classList.add('lit');tone(J_NOTES[i],0,.5,'sine',.15);jLater(()=>el.isConnected&&el.classList.remove('lit'),340);
}
function jMelodyGame() {
  jGameShell('<div class="j-game-progress" id="jMelodySteps"><i></i><i></i><i></i><i></i></div><div class="j-game-field"><div class="j-note-grid">'+['叶','风','雨','花'].map((n,i)=>`<button class="j-note-pad" data-j="note" data-note="${i}" aria-label="${n}，第${i+1}个音">${n}<small>${i+1}</small></button>`).join('')+'</div></div><div class="j-actions"><button class="j-secondary" data-j="melody-replay">再听一次</button></div>','先看、先听，然后按相同顺序点回来。键盘 1 至 4 也可以。');
  voyage.game={type:'melody',room:jRoom().id,seq:[0,Math.floor(Math.random()*3)+1,Math.floor(Math.random()*4),2],index:0,errors:0,playing:false};jMelodyPlay();
}
function jMelodyPlay() {
  const g=voyage.game;if(g?.type!=='melody'||g.playing)return;
  g.playing=true;g.index=0;document.querySelectorAll('#jMelodySteps i').forEach(el=>el.classList.remove('on'));jGameFeedback('先听一遍，风正在替你弹奏。');
  g.seq.forEach((n,i)=>jLater(()=>{if(voyage.game===g){jNoteLight(n);jGameFeedback(`听第 ${i+1} 个音：${['叶','风','雨','花'][n]}（${n+1}）`);}},450+i*680));
  jLater(()=>{if(voyage.game===g){g.playing=false;jGameFeedback('现在，换你把这四个音弹回来。');}},450+g.seq.length*680);
}
function jMelodyHit(i) {
  const g=voyage.game;if(g?.type!=='melody'||g.playing||!Number.isInteger(i)||i<0||i>3)return;jNoteLight(i);
  if(i!==g.seq[g.index]){g.errors++;jGameFeedback('这个音迷路了，再听一遍也没关系。');jMelodyPlay();return;}
  $('#jMelodySteps').children[g.index].classList.add('on');g.index++;jGameFeedback(`记住了 ${g.index} / 4 个音。`);
  if(g.index===4){g.playing=true;jLater(()=>voyage.game===g&&jGameFinish(Math.max(55,100-g.errors*10)),500);}
}
function jStarsGame() {
  const coords=[[16,66],[31,32],[47,49],[58,19],[74,37],[84,73]];
  jGameShell(`<div class="j-game-progress" id="jStarSteps">${coords.map(()=>'<i></i>').join('')}</div><div class="j-stars-field"><svg class="j-star-lines" id="jStarLines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"></svg>${coords.map(([x,y],i)=>`<button class="j-star-node" data-j="star" data-star="${i}" style="left:${x}%;top:${y}%" aria-label="连接第${i+1}颗星星">✦<small>${i+1}</small></button>`).join('')}<div class="j-stars-hint">从 1 开始，沿着微光慢慢连起来。</div></div>`,'依次点亮 1 到 6 号星星，或按键盘上相应的数字。');
  voyage.game={type:'stars',room:jRoom().id,coords,index:0,errors:0,locked:false};
}
function jStarsHit(i) {
  const g=voyage.game;if(g?.type!=='stars'||g.locked)return;
  if(i!==g.index){if(i>=g.index){g.errors++;jGameFeedback(`下一颗是 ${g.index+1} 号星星。`);SFX.soft();}return;}
  $(`[data-star="${i}"]`).classList.add('linked');$('#jStarSteps').children[i].classList.add('on');tone(J_NOTES[i%4],0,.6,'sine',.12);
  if(i>0){const[x,y]=g.coords[i-1],[a,b]=g.coords[i];const line=document.createElementNS('http://www.w3.org/2000/svg','line');for(const[k,v]of Object.entries({x1:x,y1:y,x2:a,y2:b}))line.setAttribute(k,v);$('#jStarLines').appendChild(line);}
  g.index++;jGameFeedback(`已点亮 ${g.index} / 6 颗星星。`);
  if(g.index===6){g.locked=true;jLater(()=>voyage.game===g&&jGameFinish(Math.max(55,100-g.errors*7)),700);}
}
function jStartGame() { ({brew:jBrewGame,pairs:jPairsGame,melody:jMelodyGame,stars:jStarsGame})[jRoom().game](); }

document.addEventListener('click',e=>{
  const b=e.target.closest('[data-j]');if(!b||b.disabled)return;
  if ($('#jOverlay').hidden) {
    voyage.focus = b;
    voyage.focusSelector = b.dataset.j === 'clue' ? `[data-j="clue"][data-clue="${b.dataset.clue}"]` : b.closest('#jTasks') ? `#jTasks [data-j="${b.dataset.j}"]` : null;
  }
  audioStart();const action=b.dataset.j;
  if(action==='close')return jClose();
  if(action==='map')return jMap(); if(action==='album')return jAlbum();if(action==='about')return jAbout();
  if(action==='begin'){state.journey.introduced=true;save();jClose();return;}
  if(action==='travel')return jTravel(b.dataset.room);
  if(action==='prev'||action==='next'){const i=JOURNEY_ROOMS.indexOf(jRoom());return jTravel(JOURNEY_ROOMS[(i+(action==='next'?1:-1)+10)%10].id);}
  if(action==='clue')return jDiscover(+b.dataset.clue);
  if(action==='discover'){const next=jProgress().found.length<3?jRoom().clues.findIndex((c,i)=>!jProgress().found.includes(i)):-1;if(next>=0){const el=$(`[data-clue="${next}"]`);el.focus();toast(`找找「${jRoom().clues[next].n}」：场景里有一处微光在等你。`);}else{toast('三处小回响都找到了。再读一次，回忆也不会变少。');}return;}
  if(action==='story')return jStory();if(action==='choice')return jChoose(+b.dataset.choice);
  if(action==='ritual')return jRitualStart();if(action==='game-start')return jStartGame();
  if(action==='brew-hit')return jBrewHit();if(action==='pair')return jPairFlip(+b.dataset.card);if(action==='note')return jMelodyHit(+b.dataset.note);if(action==='melody-replay')return jMelodyPlay();if(action==='star')return jStarsHit(+b.dataset.star);
  if(action==='postcard')return jPostcard(b.dataset.room);
  if(action==='photo')return jPhoto(b.dataset.room);
  if(action==='residents')return jResidents();
  if(action==='resident'){const n=+b.dataset.resident;if(CHARS[n]){setChara(n);jResidents();jRender();}return;}
  if(action==='home')return jHome();if(action==='coins')return jCoins();if(action==='festival')return jFestival();
  if(action==='ending'){const out=jApply({type:'festival'});if(out.reward){if(!state.ward.includes('wreath'))state.ward.push('wreath');SFX.level();toast('云端晚会 · 星星币 +300，花环已经放进住客的衣橱。');}return jFestival();}
  if(action==='time'){const times=['day','dusk','night'];state.journey.time=times[(times.indexOf(state.journey.time)+1)%3];save();jRender();SFX.soft();return;}
  if(action==='hints'){state.journey.hints=!state.journey.hints;save();jRender();return;}
  if(action==='sound'){$('#btnSound').click();jRender();}
});
$('#jReturn').onclick=()=>{audioStart();jEnter();};
$('#jOverlay').addEventListener('click',e=>{if(e.target===$('#jOverlay'))jClose();});
document.addEventListener('keydown',e=>{
  if($('#jOverlay').hidden)return;
  if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();jClose();return;}
  if(e.key==='Tab'){
    const els=[...$('#jDialog').querySelectorAll('button:not([disabled]),a[href],input')].filter(el=>el.getClientRects().length);
    const first=els[0],last=els.at(-1);
    if(!first){e.preventDefault();$('#jDialog').focus();return;}
    if(e.shiftKey&&(document.activeElement===first||document.activeElement===$('#jDialog'))){e.preventDefault();last.focus();}else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===$('#jDialog'))){e.preventDefault();first.focus();}
  }
  const g=voyage.game;if(!g||e.repeat)return;
  const focusedControl = e.target.closest?.('button,a,input,select,textarea');
  if(g.type==='brew'&&(e.key===' '||e.key==='Enter')&&(!focusedControl||focusedControl.dataset.j==='brew-hit')){e.preventDefault();e.stopImmediatePropagation();jBrewHit();}
  else if(g.type==='melody'&&/^[1-4]$/.test(e.key)){e.preventDefault();jMelodyHit(+e.key-1);}
  else if(g.type==='stars'&&/^[1-6]$/.test(e.key)){e.preventDefault();jStarsHit(+e.key-1);}
},true);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&voyage.game){jClearGame();if(voyage.modalKind==='game')jRitualStart();}});
function initJourney() {
  voyage.ready=true;jEnter();
  if(!state.journey.introduced)jAbout();
}
