"""Compress the supplied reference sheet; card framing is done with CSS at runtime."""
from pathlib import Path
import argparse
from PIL import Image

parser = argparse.ArgumentParser()
parser.add_argument('reference', type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parent.parent
image = Image.open(args.reference).convert('RGB')
image.save(root / 'public/art/cats-grid.webp', 'WEBP', quality=90, method=6)
print('Prepared cats-grid.webp:', image.size)
