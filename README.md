# 云端小屋 · 云上旅居

一款慢生活浏览器小游戏。十间漂在云上的小屋、六位住客、三十个可以发现的小回响。探索、玩一场小游戏、听主人讲一段故事，把这一站收进旅居手册；再把奖励家具带回可以自由布置的 3D 小屋。

作者：DONG。新增场景、住客与家具图片来自用户提供的素材包，原文件名与转换清单在 `public/art/manifest.json`。

## 运行

**下载解压后，直接双击 `index.html` 即可开始游戏。** 不需要安装 Python、Node.js 或其他软件，也不需要启动服务或连接网络。建议使用支持 WebGL 的 Chrome、Edge、Safari 或 Firefox。

所有图片与 3D 运行代码都已嵌入 `index.html`，这个文件可以单独复制到其他文件夹或设备。源码仓库中的 `public/` 是构建输入，玩家运行时不再需要它。中文字体使用设备上的字体。原有可选的 Claude 回信能力仍可在支持它的宿主使用；普通浏览器走本地模板。

开发预览也可以使用本地 HTTP 服务：

```sh
npm start
# 或
python3 -m http.server 4173 --bind 127.0.0.1
```

浏览器访问 `http://127.0.0.1:4173`。这是当前电脑的地址，服务关闭后链接就无法访问。开发预览需保留服务终端；日常试玩推荐直接打开下载包的 `index.html`。

## 怎么玩

- **云上旅居**：十个房间从一开始都可到访。点场景里的三个微光，发现藏在小屋里的物件与故事。
- **房间仪式**：泡茶/可可火候、收藏翻牌、风铃旋律、连星寻路，共四种玩法。完成度达到 50 分即可盖印，失败可立即重试。
- **住客故事**：每间房间有自己的主人、心事和两种回应；任选一种都可获得故事印章。
- **旅居邮票**：探索、仪式、故事三枚印章齐全后获得一张邮票、80 星星币与一件 3D 家具。奖励只发一次，重复游玩可以改善最好成绩。
- **云端晚会**：收齐五张邮票后可参加，首次获得 300 星星币与花环；十张邮票组成完整旅居册。
- **3D 小屋**：可以旋转视角、购买/拖动/旋转家具、换住客和宠物、做饭、钓鱼、弹琴、写信。旅居家具在“商店 → 背包”取出。
- **照片**：可将场景制作成 PNG 明信片保存。旅居册收藏的是游戏进度，照片保存到设备。

存档沿用 `cloudhome.v3`，旧住客、货币、家具与亲密度保留。新增旅居进度放在同一存档的 `journey` 字段中。进度保存在当前浏览器、当前站点来源的本地存储，换浏览器或部署域名不会自动迁移。

键盘：Tab 选择按钮、Enter 激活、Escape 关闭面板。泡茶可按空格；旋律使用 1–4；连星使用 1–6。手机支持触控；关闭声音后小游戏仍有可视反馈；系统启用减少动态效果后装饰动画自动减弱。

## 构建与验证

```sh
npm ci
npm run build
npm test
python3 scripts/package.py
```

仅开发者重新构建时需要 Python 3、Node.js 和 esbuild 开发依赖。`scripts/build.py` 合并源码与图片，`scripts/bundle.cjs` 将本地 3D 模块打包为内联脚本，`src/build.sh` 运行 JS 语法校验。`index.html` 为提交的独立可玩构建产物；`public/vendor` 保留固定版本依赖与许可证。

真实浏览器回归需要 Playwright 和 Chromium。在一个终端运行 `npm start`，另一个终端运行：

```sh
npm install --no-save playwright
npx playwright install chromium
npm run test:browser
npm run test:offline
# 可选：安装对应的 Playwright WebKit 后验证 Mac 浏览器引擎
TEST_BROWSER=webkit npm run test:offline
```

浏览器测试自动完成十个房间、四种游戏、结局、照片下载、刷新恢复、奖励家具取出与手机布局。离线测试将首页单独复制到没有 `public/` 的临时文件夹，阻止其他资源请求，验证直接打开、图片、照片下载、存档和 3D 小屋。测试报告和截图写到忽略的 `qa/`。也可以用 `PLAYWRIGHT_MODULE` 指定已有 Playwright 安装路径，用 `TEST_URL` 指定 HTTP 预览地址或完整 `file:///…/index.html` 文件地址。

## 源码

| 文件 | 内容 |
| --- | --- |
| `src/journey-model.mjs` | 十个房间的内容、纯进度状态、奖励与存档迁移 |
| `src/journey.js` | 旅居面板、故事、四个小游戏、照片、3D 小屋衔接 |
| `src/journey.html` / `src/journey.css` | 绘本旅居界面与响应式布局 |
| `src/core.js` / `world.js` / `chara.js` | 原有 3D 场景、软质家具、角色、灯光与音效 |
| `src/game.js` / `play.js` | 原有生活系统、存档、家具编辑和四个小游戏 |
| `scripts/prepare_art.py` | 从原始 25 张 PNG 导出 WebP（仅需在替换素材时运行，依赖 Pillow） |

参赛演示路线见 `docs/competition-demo.md`。游戏的新增场景是可互动的绘本画面；原有 3D 小屋保留模型与自由布置。家具素材图是风格图鉴，不是从图片自动生成的 3D 模型。
