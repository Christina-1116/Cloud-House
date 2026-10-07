#!/bin/sh
cd "$(dirname "$0")"
{ cat head.html; echo '<script type="module">'; cat assets.js core.js world.js chara.js; python3 -c "import sys;g=open('game.js').read();sys.stdout.write(g.replace('/*__PLAY__*/',open('play.js').read()))"; } > cloud-home.html
python3 - <<'PY'
import re
s=open('cloud-home.html').read()
m=re.findall(r'<script type="module">(.*?)</script>',s,re.S)[0]; open('check.mjs','w').write(m)
open('index.html','w').write('<!doctype html>\n<html lang="zh-CN">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">\n<meta name="theme-color" content="#f4ecdf">\n<style>html{color-scheme:light}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>\n</head>\n<body>\n'+s+'\n</body>\n</html>\n')
PY
node --check check.mjs && echo SYNTAX_OK && wc -c index.html
cp index.html ../index.html
