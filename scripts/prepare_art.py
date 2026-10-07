"""Convert the user-provided PNG bundle into the shipped WebP assets.

Usage: python3 scripts/prepare_art.py '/path/to/export.zip'
Requires Pillow only during asset preparation, not during build or gameplay.
"""
import sys
import pathlib
import json
import zipfile
from PIL import Image

root = pathlib.Path(__file__).resolve().parent.parent
out = root / 'public' / 'art'
out.mkdir(parents=True, exist_ok=True)
if len(sys.argv) != 2:
    raise SystemExit(__doc__)
manifest = []
with zipfile.ZipFile(sys.argv[1]) as archive:
    files = [info for info in archive.infolist() if not info.is_dir() and info.filename.lower().endswith('.png')]
    if len(files) != 25:
        raise SystemExit('Expected the supplied 25-image Cloud House export. No assets were changed.')
    for i, info in enumerate(files, 1):
        original = info.filename
        if not info.flag_bits & 0x800:
            try:
                original = original.encode('cp437').decode('utf-8')
            except (UnicodeError, LookupError):
                pass
        kind = 'scene' if i <= 10 else 'resident' if i <= 16 else 'furniture'
        with archive.open(info) as stream:
            image = Image.open(stream).convert('RGB')
            image.thumbnail((1600,1600) if i <= 10 else (680,900))
            destination = out / f'{kind}-{i:02}.webp'
            image.save(destination, 'WEBP', quality=88, method=6)
            if i <= 10:
                image.thumbnail((420,420))
                image.save(out / f'thumb-{i:02}.webp', 'WEBP', quality=82, method=6)
        manifest.append({'id': i, 'original_name': original, 'output': str(destination.relative_to(root)), 'bytes': destination.stat().st_size})
(out / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2))
print(f'Prepared 25 artworks, {sum(r["bytes"] for r in manifest)/1024/1024:.2f} MiB')
