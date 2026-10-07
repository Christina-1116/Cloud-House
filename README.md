# 云端小屋 Cloud House

一间漂在云上的治愈系 3D 小屋。从只有四件家具的空房子开始，攒星星币、买家具、做饭、钓鱼、弹琴，把家一点点养起来。

作者：DONG

## 直接玩

用浏览器打开 `index.html` 即可（需要联网，three.js 和字体从 CDN 加载）。存档保存在浏览器本地。

## 目录

- `index.html`：构建好的单文件成品
- `src/`：源码
  - `head.html`：页面结构和样式
  - `assets.js`：人物头像和载入背景图（base64）
  - `core.js`：渲染、灯光、配色、天色、音效
  - `world.js`：房屋、家具模型、家具目录、寻路
  - `chara.js`：住客和宠物的模型与动作
  - `game.js`：存档、活动、室友、日记、界面、启动
  - `play.js`：天气、性格、安家手册、小事件、纪念品、四个小游戏
  - `build.sh`：把以上文件拼成 `index.html`

## 重新构建

```sh
sh src/build.sh
```

需要 `python3` 和 `node`（只用来做语法检查）。构建后根目录的 `index.html` 会被更新。

## 说明

“住客回信”和“写日记”在 Claude 的发布页面里会调用 Claude 生成内容；单独打开 `index.html` 时使用内置的本地模板。
