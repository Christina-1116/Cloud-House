// Content and progress are independent of rendering. No network or clock is needed.
export const JOURNEY_ROOMS = [
  {
    id: 'home', n: '云端原居', en: 'A PLACE TO BEGIN', art: 10, furniture: 21, color: '#76886b', mood: '奶油 · 日光 · 初见', host: 0,
    intro: '在云的尽头，留一盏灯。\n今天，从把自己安顿好开始。',
    ritual: '给初见泡一杯茶', game: 'brew', token: '初见的温度', reward: 'cloudLamp',
    clues: [
      { n: '没寄出的明信片', x: 33, y: 81, text: '书页里夹着一张空白明信片。阿屿说，地址可以慢慢想，先写下今天的天空。' },
      { n: '会听歌的收音机', x: 39, y: 35, text: '旋钮转到第七格，传来一首很老的歌。这台收音机只收得到让人安心的频道。' },
      { n: '第一颗小云种子', x: 77, y: 48, text: '盆底藏着一颗像棉花糖的种子。每天说一句喜欢的话，它就会长出一片叶子。' }
    ],
    story: { line: '“我一直把另一只杯子留着。”阿屿看了一眼窗外，“你想把这间小屋，变成什么样？”', choices: ['一处随时可以回来的地方', '一起出发前的秘密基地'], replies: ['“那我会记得开灯。就算你回来得有点晚。”他把备用钥匙放在你的手心。', '“好。”他翻出一张云海地图，“第一站，你来选。走累了我们再回家。”'] }
  },
  {
    id: 'winter', n: '冬日暖炉', en: 'A LITTLE WARMTH', art: 1, furniture: 19, color: '#b3805d', mood: '壁炉 · 小雪 · 热可可', host: 2,
    intro: '让雪落在窗外。\n把温暖，留在两只杯子之间。',
    ritual: '煮一杯棉花糖可可', game: 'brew', token: '炉火旁的雪花', reward: 'armchair',
    clues: [
      { n: '壁炉边的小袜子', x: 31, y: 49, text: '栗子给壁炉挂了两只小袜子。一只装松果，另一只还空着：“等一个好消息。”' },
      { n: '窗台上的雪花', x: 38, y: 22, text: '这片雪落在窗沿很久都没化。靠近时才发现，它是栗子用纸剪的第一片雪花。' },
      { n: '餐桌上的可可粉', x: 57, y: 59, text: '可可粉旁边写着配方：牛奶两份，想念一份。棉花糖不计数量。' }
    ],
    story: { line: '“我以前以为，冬天只能等它过去。”栗子把火拨亮一点，“后来才学会，给自己煮点热的。”', choices: ['陪他再坐一会儿', '把热可可分给路过的小云'], replies: ['火焰发出很轻的响声。你们没有说话，杯子里的热气替你们聊了很久。', '路过的小云喝完可可，变成了淡淡的巧克力色。栗子笑得差点把围巾弄湿。'] }
  },
  {
    id: 'coast', n: '海盐假日', en: 'LET THE TIDE IN', art: 2, furniture: 18, color: '#6c9ca7', mood: '海风 · 贝壳 · 漂流瓶', host: 1,
    intro: '不用赶潮汐，也不用赶时间。\n今天的目的地，就是这里。',
    ritual: '拼好潮汐的礼物', game: 'pairs', token: '海风寄来的信', reward: 'hangChair',
    clues: [
      { n: '吊椅里的贝壳', x: 25, y: 58, text: '贝壳里没有海浪声，只有橘子很小声的一句：“嘿，今天也要开心一点。”' },
      { n: '云海上的漂流瓶', x: 18, y: 27, text: '瓶子从云海漂来，里面写着：如果暂时不知道去哪，就先看看天。' },
      { n: '沙发上的条纹毯', x: 46, y: 49, text: '蓝白条纹毯藏着一颗沙子。橘子坚持说，这是上次假日偷偷带回来的纪念品。' }
    ],
    story: { line: '橘子摊开手心，里面有两枚贝壳。“我们要不要给今天放一个小小的假？”', choices: ['沿着云海散步', '窝进吊椅，什么都不做'], replies: ['云海把脚印轻轻收走。你们追着一朵像鲸鱼的云，一直走到太阳变成橘子汽水。', '吊椅晃啊晃。没有计划的一天，竟然也可以被好好记住。'] }
  },
  {
    id: 'garden', n: '森屿花房', en: 'EVERY LITTLE THING GROWS', art: 3, furniture: 21, color: '#708857', mood: '藤蔓 · 雨后 · 新叶', host: 3,
    intro: '先长出一片叶子。\n然后，慢慢长成自己的森林。',
    ritual: '记住花开的次序', game: 'melody', token: '一片新生的叶子', reward: 'bigPlant',
    clues: [
      { n: '藤蔓里的鸟羽', x: 26, y: 46, text: '一根羽毛卡在藤蔓间。小满说，小鸟把这里当作了半空中的休息站。' },
      { n: '书架里的种子袋', x: 57, y: 38, text: '袋子上写着“别急着开花”。每颗种子都有自己的日历，今天发芽也很好。' },
      { n: '台阶上的雨滴', x: 73, y: 58, text: '雨滴落在木阶上，映出一个小小的倒过来的天空。你替小满把它画进了日记。' }
    ],
    story: { line: '小满捧着一盆还没有开花的植物。“我已经照顾它好久啦。是不是我哪里做得不好？”', choices: ['陪她看看新长的叶子', '替花盆做一块小小的名牌'], replies: ['叶背上藏着一个小花苞。小满愣了一下，然后把整张脸笑成了太阳。', '名牌上写着“慢慢来”。小满把它插进土里：“嗯，我们一起慢慢来。”'] }
  },
  {
    id: 'sakura', n: '樱风茶舍', en: 'A QUIET CUP OF SPRING', art: 6, furniture: 25, color: '#bc8790', mood: '樱花 · 和风 · 茶香', host: 4,
    intro: '风吹过一页书。\n茶刚好温，春天也刚好。',
    ritual: '听一段风铃小调', game: 'melody', token: '风铃里的春天', reward: 'teaset',
    clues: [
      { n: '水面上的樱花瓣', x: 55, y: 72, text: '花瓣落在水面上，转了三个圈。知遥说，这是春天寄来的标点符号。' },
      { n: '二楼的风铃', x: 57, y: 21, text: '风铃里面刻着两个小字：“听见”。它只在有人认真倾听时，发出一点点声音。' },
      { n: '茶桌下的折纸鹤', x: 43, y: 55, text: '纸鹤是用旧书页折的。展开翅膀，上面恰好写着“明天见”。' }
    ],
    story: { line: '知遥合上书：“有时候，我不知道该说些什么。你会不会觉得，和我待着很无聊？”', choices: ['一起听风铃', '给她读一段喜欢的句子'], replies: ['风铃响了一声。你们把这一刻留白，安静也成了一种很好的回答。', '你念得有点磕绊。知遥听得很认真，还把那一页的角轻轻折了起来。'] }
  },
  {
    id: 'palace', n: '玫瑰旧梦', en: 'A STORY IN GOLD', art: 4, furniture: 17, color: '#b69764', mood: '玫瑰 · 金边 · 旧时光', host: 1,
    intro: '给普通的一天，系一个蝴蝶结。\n每个小小的愿望，都值得郑重。',
    ritual: '找回舞会的邀请函', game: 'pairs', token: '没有期限的请柬', reward: 'vanity',
    clues: [
      { n: '金边相框', x: 56, y: 27, text: '相框里还没有照片。橘子说，要等一个值得装裱的普通下午。' },
      { n: '玫瑰沙发的丝带', x: 34, y: 53, text: '丝带缠着一份没送出去的礼物。里面不是珠宝，是一张“陪你一整天”的兑换券。' },
      { n: '钢琴旁的旧请柬', x: 77, y: 58, text: '请柬没有日期：“无论什么时候来，你的位置都会留着。”' }
    ],
    story: { line: '“舞会只有我们两个，会不会太冷清？”橘子把裙摆转了一个圈，“我练了好久呢。”', choices: ['郑重地邀请她跳一支舞', '把路过的小云都请进来'], replies: ['你伸出手。没有观众的舞会，仍然有一场认真到发亮的开场。', '小云们挤在窗前，像一圈软软的花边。橘子跳得比练习时更开心。'] }
  },
  {
    id: 'loft', n: '星幕阁楼', en: 'CLOSER TO THE STARS', art: 5, furniture: 20, color: '#7d83ae', mood: '月光 · 玻璃 · 星图', host: 0,
    intro: '城市睡着的时候。\n还有一颗星，醒着陪你。',
    ritual: '连起今晚的星座', game: 'stars', token: '属于我们的星座', reward: 'telescope',
    clues: [
      { n: '玻璃上的小月亮', x: 32, y: 26, text: '阿屿用指尖在玻璃上画了一弯月亮。月光经过时，它会短暂地亮起来。' },
      { n: '楼梯上的星图', x: 69, y: 51, text: '星图上有一颗没有名字的星。空白的地方，留给一个还没有发生的故事。' },
      { n: '桌边的晚安便条', x: 47, y: 70, text: '便条写着：“睡不着也没关系，抬头的时候，我也在看同一片天。”' }
    ],
    story: { line: '“你看。”阿屿指着远处，“那颗星一直都在。要不要，给它起个名字？”', choices: ['叫它“归途”', '叫它“还没睡”'], replies: ['“嗯，归途。”他把名字写在星图背面，“以后迷路，就找这颗。”', '阿屿笑了：“那它一定很困。”你们约好，明天早点说晚安。'] }
  },
  {
    id: 'nordic', n: '风与白昼', en: 'ROOM FOR A SLOW DAY', art: 7, furniture: 22, color: '#8c967a', mood: '亚麻 · 白昼 · 慢生活', host: 5,
    intro: '把日程留得松一点。\n好让阳光，有地方坐下来。',
    ritual: '配对阳光的小收藏', game: 'pairs', token: '一个很长的白昼', reward: 'beanbag',
    clues: [
      { n: '窗边的亚麻书签', x: 26, y: 32, text: '书签是雪球自己织的。线头有点歪，但摸起来比今天的云还软。' },
      { n: '茶几上的小石头', x: 44, y: 59, text: '雪球把路上捡来的石头排成一个笑脸。最小的那颗，是它今天的好运气。' },
      { n: '角落的新叶', x: 74, y: 65, text: '阳光在新叶上停了一会儿。雪球也停了一会儿。它说：“呼。”' }
    ],
    story: { line: '雪球趴在沙发边，抱着一朵小云。“呼……今天什么都没做。”它好像有一点不好意思。', choices: ['告诉它，休息也是一件事', '陪它给小云取名字'], replies: ['雪球把脸埋进软垫里，安心地呼了一声。今天的任务，是把自己照顾好。', '你们叫它“小小”。雪球认真地重复了两遍，然后和小小一起睡着了。'] }
  },
  {
    id: 'boho', n: '落日织梦', en: 'FOLLOW THE GOLDEN HOUR', art: 8, furniture: 24, color: '#ac7d50', mood: '藤编 · 落日 · 远方', host: 2,
    intro: '把想去的远方，织进今天。\n夕阳会替我们，把路照亮。',
    ritual: '编一段落日的旋律', game: 'melody', token: '装在口袋的落日', reward: 'guitar',
    clues: [
      { n: '编织毯的流苏', x: 54, y: 65, text: '流苏上系着一枚小铜铃。每摇一下，就像有人轻轻说：“出发吧。”' },
      { n: '吊椅里的旅行本', x: 28, y: 45, text: '旅行本的第一页还空着，后面却画了很多太阳。栗子说，先把晴天准备好。' },
      { n: '灯笼下的橡果', x: 66, y: 29, text: '橡果是从很远的秋天带回来的。握在手里，能闻到一点森林的味道。' }
    ],
    story: { line: '“我想去很远的地方，又有点舍不得这里。”栗子捏着旅行本的角，“这会不会很奇怪？”', choices: ['把家的照片放进旅行本', '约定带一个故事回来'], replies: ['照片夹在第一页。家的样子不会把他拴住，反而让他终于敢翻到下一页。', '“那我一定记得仔细看。”栗子认真地扣好背包，“故事里，也会有你。”'] }
  },
  {
    id: 'zen', n: '月白山房', en: 'LESS, AND A LITTLE MORE', art: 9, furniture: 23, color: '#748b78', mood: '竹影 · 圆窗 · 静心', host: 4,
    intro: '一窗月白，一盏清茶。\n在没有答案的时候，先坐一会儿。',
    ritual: '画出月下的星路', game: 'stars', token: '圆窗里的月光', reward: 'roundRug2',
    clues: [
      { n: '圆窗边的竹影', x: 43, y: 26, text: '竹影落在窗框上，像一首没有写完的诗。知遥说，不写完也可以很好看。' },
      { n: '桌上的温茶', x: 54, y: 57, text: '茶喝到一半，刚好不烫了。你发现等待也有它自己的温度。' },
      { n: '屏风后的书页', x: 78, y: 40, text: '书页上只有一句：“山月不知心里事。”旁边有人添了一行：“但朋友可以听。”' }
    ],
    story: { line: '知遥给你倒了一点茶。“最近有什么想不明白的事吗？不一定要找到答案。”', choices: ['说说最近的小烦恼', '把烦恼暂时交给月亮'], replies: ['她没有急着给建议，只把茶壶往你这边推了一点。你忽然觉得，话说出来就轻了一些。', '月亮没有回答。但这一刻，你终于不用追着答案跑。茶还温着，朋友也在。'] }
  }
];

const J_IDS = new Set(JOURNEY_ROOMS.map(r => r.id));
const J_MARKS = ['discover', 'ritual', 'story'];
const jRoomFresh = () => ({ found: [], marks: [], choice: null, best: 0, postcard: false });
export const freshJourney = () => ({ v: 1, room: 'home', rooms: {}, ending: false, introduced: false, time: 'day', hints: true });
export function restoreJourney(raw) {
  const s = freshJourney();
  if (!raw || typeof raw !== 'object') return s;
  s.room = J_IDS.has(raw.room) ? raw.room : 'home';
  s.ending = raw.ending === true;
  s.introduced = raw.introduced === true;
  s.time = ['day', 'dusk', 'night'].includes(raw.time) ? raw.time : 'day';
  s.hints = raw.hints !== false;
  for (const [id, r] of Object.entries(raw.rooms || {})) {
    if (!J_IDS.has(id) || !r || typeof r !== 'object') continue;
    const found = [...new Set((Array.isArray(r.found) ? r.found : []).filter(n => Number.isInteger(n) && n >= 0 && n < 3))];
    const best = Number.isFinite(r.best) ? Math.min(100, Math.max(0, r.best)) : 0;
    const choice = [0, 1].includes(r.choice) ? r.choice : null;
    const marks = J_MARKS.filter(m => Array.isArray(r.marks) && r.marks.includes(m) && (m === 'discover' ? found.length === 3 : m === 'ritual' ? best >= 50 : choice !== null));
    s.rooms[id] = { found, best, choice, marks, postcard: marks.length === 3 };
  }
  // An ending is only valid if its prerequisite progress is still present.
  s.ending = s.ending && journeyStats(s).festivalReady;
  return s;
}
export function journeyStats(s) {
  const progress = Object.values(s.rooms || {});
  const completed = progress.filter(r => r.postcard).length;
  return { completed, total: JOURNEY_ROOMS.length, stamps: progress.reduce((n, r) => n + r.marks.length, 0), festivalReady: completed >= 5 };
}
export function journeyAction(current, action) {
  const unchanged = () => ({ state: current, reward: 0, postcard: null, newMark: null });
  if (!action || typeof action !== 'object') return unchanged();
  if (action.type === 'travel') return J_IDS.has(action.room) ? { ...unchanged(), state: { ...current, room: action.room } } : unchanged();
  if (action.type === 'festival') {
    if (current.ending || !journeyStats(current).festivalReady) return unchanged();
    return { ...unchanged(), state: { ...current, ending: true }, reward: 300 };
  }
  if (!['discover', 'ritual', 'story'].includes(action.type)) return unchanged();
  if (action.type === 'discover' && (!Number.isInteger(action.clue) || action.clue < 0 || action.clue > 2)) return unchanged();
  if (action.type === 'ritual' && (!Number.isFinite(action.score) || action.score < 50 || action.score > 100)) return unchanged();
  if (action.type === 'story' && ![0, 1].includes(action.choice)) return unchanged();
  const s = { ...current, rooms: { ...current.rooms } }, old = s.rooms[s.room] || jRoomFresh();
  const r = s.rooms[s.room] = { ...old, found: [...old.found], marks: [...old.marks] };
  let reward = 0, newMark = null, postcard = null;
  if (action.type === 'discover' && !r.found.includes(action.clue)) { r.found.push(action.clue); reward += 5; }
  if (action.type === 'ritual') r.best = Math.max(r.best, Math.round(action.score));
  if (action.type === 'story' && r.choice === null) r.choice = action.choice;
  const earned = action.type === 'discover' ? r.found.length === 3 : true;
  if (earned && !r.marks.includes(action.type)) { r.marks.push(action.type); reward += action.type === 'discover' ? 15 : 20; newMark = action.type; }
  if (r.marks.length === 3 && !r.postcard) { r.postcard = true; reward += 80; postcard = s.room; }
  return { state: s, reward, postcard, newMark };
}
