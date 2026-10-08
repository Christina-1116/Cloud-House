"""Build a standalone HTML game that also works when opened as a local file."""
import base64
import json
import pathlib
import re
import subprocess
ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'src'
head = (SRC / 'head.html').read_text()
head = head.replace('</style>', (SRC / 'journey.css').read_text() + '\n</style>', 1)
head = head.replace('</style>', (SRC / 'pets.css').read_text() + '\n</style>', 1)
head = head.replace('<div class="toast"', (SRC / 'journey.html').read_text() + '\n<div class="toast"', 1)
head = re.sub(r'<script type="importmap">.*?</script>', '', head, flags=re.S)
head = re.sub(r'<link[^>]+href="https://fonts\.[^"]+"[^>]*>\n?', '', head)
art = {p.name: 'data:image/webp;base64,' + base64.b64encode(p.read_bytes()).decode('ascii')
       for p in sorted((ROOT / 'public/art').glob('*.webp'))}
model = re.sub(r'^export ', '', (SRC / 'journey-model.mjs').read_text(), flags=re.M)
game = (SRC / 'game.js').read_text().replace('/*__PLAY__*/', (SRC / 'play.js').read_text() + '\n' + model + '\n' + (SRC / 'journey.js').read_text())
parts = [head, '<script type="module">', 'const JOURNEY_ART = ' + json.dumps(art) + ';']
parts += [re.sub(r'^export ', '', (SRC / 'pets-model.mjs').read_text(), flags=re.M)]
parts += [(SRC / name).read_text() for name in ['assets.js', 'core.js', 'world.js', 'pets-3d.js', 'chara.js', 'pets-ui.js']]
parts += [game]
body = '\n'.join(parts)
module = re.search(r'<script type="module">(.*?)</script>', body, re.S).group(1)
(SRC / 'check.mjs').write_text(module)
bundle = subprocess.run(['node', str(ROOT / 'scripts/bundle.cjs')], input=module,
                        text=True, capture_output=True, check=True).stdout
# HTML parsers terminate script blocks even when the marker is in a JS string.
bundle = re.sub(r'</script', r'<\\/script', bundle, flags=re.I)
licenses = '\n\n'.join((ROOT / f'public/vendor/{library}/LICENSE').read_text()
                         for library in ['three', 'tween'])
body = head + '\n<!-- Third-party license notices:\n' + licenses + '\n-->\n<script>\n' + bundle + '\n</script>'
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
