"""Build the existing module composition without introducing a bundler."""
import pathlib
import re
ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'src'
head = (SRC / 'head.html').read_text()
head = head.replace('</style>', (SRC / 'journey.css').read_text() + '\n</style>', 1)
head = head.replace('<div class="toast"', (SRC / 'journey.html').read_text() + '\n<div class="toast"', 1)
head = head.replace('https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js', './public/vendor/three/three.module.js')
head = head.replace('https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/', './public/vendor/three/addons/')
head = head.replace('https://cdn.jsdelivr.net/npm/@tweenjs/tween.js@23.1.3/dist/tween.esm.js', './public/vendor/tween/tween.esm.js')
head = re.sub(r'<link[^>]+href="https://fonts\.[^"]+"[^>]*>\n?', '', head)
model = re.sub(r'^export ', '', (SRC / 'journey-model.mjs').read_text(), flags=re.M)
game = (SRC / 'game.js').read_text().replace('/*__PLAY__*/', (SRC / 'play.js').read_text() + '\n' + model + '\n' + (SRC / 'journey.js').read_text())
parts = [head, '<script type="module">']
parts += [(SRC / name).read_text() for name in ['assets.js', 'core.js', 'world.js', 'chara.js']]
parts += [game]
body = '\n'.join(parts)
module = re.search(r'<script type="module">(.*?)</script>', body, re.S).group(1)
(SRC / 'check.mjs').write_text(module)
output = '''<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#f7f5ee">
<meta name="description" content="十间云上小屋，六位住客。寻找小物、完成房间小游戏、收藏旅居邮票，把风景带回可以自由布置的 3D 小屋。">
<style>html{color-scheme:light}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>
</head>
<body>\n''' + body + '\n</body>\n</html>\n'
(ROOT / 'index.html').write_text(output)
for room in range(1, 11):
    assert (ROOT / f'public/art/scene-{room:02}.webp').exists(), f'Missing scene {room}'
assert (ROOT / 'public/vendor/three/three.module.js').exists(), 'Missing local three.js runtime'
print(f'Built index.html ({len(output.encode()):,} bytes)')
