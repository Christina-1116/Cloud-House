"""Package the standalone game and license notices for players."""
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT.parent / 'Cloud-House-云上旅居-可玩版.zip'
instructions = '''云端小屋 · 云上旅居

1. 先完整解压本压缩包。
2. 双击 index.html，用 Chrome、Edge、Safari 或 Firefox 打开。
3. 点击「从这一盏灯开始」，即可游玩。

游戏首页包含全部图片与 3D 代码，不需要安装软件、启动服务或连接网络。
这个 index.html 文件也可以单独复制到任意文件夹。
不要使用文件管理器的快速预览，请在支持 WebGL 的浏览器中打开。
进度保存在当前浏览器中，请使用同一浏览器与同一文件位置继续游玩。
'''
with zipfile.ZipFile(OUTPUT, 'w', compression=zipfile.ZIP_DEFLATED) as archive:
    for name in ['index.html', 'README.md', 'docs/competition-demo.md', 'docs/verification.md',
                 'public/vendor/three/LICENSE', 'public/vendor/tween/LICENSE']:
        archive.write(ROOT / name, 'Cloud-House/' + name)
    archive.writestr('Cloud-House/开始试玩.txt', instructions)
with zipfile.ZipFile(OUTPUT) as archive:
    assert archive.testzip() is None
print(f'PACKAGE_OK — {OUTPUT} ({OUTPUT.stat().st_size:,} bytes)')
