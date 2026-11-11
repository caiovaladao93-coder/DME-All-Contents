"""Foto Pexels 6483591 (Mikael Blomkvist): parede verde → marinho ADV (preservando luminância), extensão da parede para cima
(enquadramento vertical do equipamento inteiro) e coordenadas da área útil da tela. O aparelho, a mesa e os reflexos não são alterados.
Saída: public/assets/computador/monitor.jpg e src/data/monitor.json"""
import json, sys
import numpy as np
from PIL import Image, ImageFilter
ROOT = __file__.rsplit('/scripts/', 1)[0]
src = sys.argv[1]
a = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
lum = .299 * r + .587 * g + .114 * b
mx = np.maximum(np.maximum(r, b), 1)
green = np.maximum(np.clip((g - mx - 5) / 12, 0, 1), np.clip((g / mx - 1.10) / .12, 0, 1) * (g > 8))   # parede verde, inclusive na sombra
green = np.asarray(Image.fromarray((green * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2))).astype(np.float32) / 255
navy = np.array([28, 50, 92], np.float32)                                  # marinho um pouco mais claro que #16284A, para a luz da parede
L0 = float(np.median(lum[green > .8]))
wall = navy[None, None, :] * (lum / L0)[..., None]
out = a * (1 - green[..., None]) + wall * green[..., None]
# extensão para cima: continua o gradiente da parede (média das linhas do topo, com leve escurecimento)
EXT = 1100
top = out[:60].mean(0, keepdims=True)
ramp = np.linspace(.86, 1.0, EXT, dtype=np.float32)[:, None, None]
ext = np.repeat(top, EXT, 0) * ramp
rng = np.random.default_rng(3); ext += rng.normal(0, 1.2, ext.shape).astype(np.float32)
img = np.vstack([ext, out])
Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save(f'{ROOT}/public/assets/computador/monitor.jpg', quality=92)
H, W = img.shape[:2]
# área útil da tela (dentro do vidro preto x 229–3289, y 2125–3936 na foto original): 2878 × 1617 ≈ 16:9 das capturas
scr = {'x': 320, 'y': 2222 + EXT, 'w': 2878, 'h': 1617}
json.dump({'W': W, 'H': H, 'ext': EXT, 'screen': scr, 'glass': {'x': 229, 'y': 2125 + EXT, 'w': 3060, 'h': 1811}, 'chinY': 3936 + EXT},
          open(f'{ROOT}/src/data/monitor.json', 'w'), indent=1)
print('ok', W, H, scr, 'L0', L0)
