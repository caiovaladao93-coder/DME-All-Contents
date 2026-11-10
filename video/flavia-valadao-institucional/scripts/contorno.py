"""Contorno ilustrativo DERIVADO DA FOTO (sem cotas, sem aparência de documento técnico).
As silhuetas reais da sala de TV (sofá, TV, aparador, quadros, porta, linhas de LED) são detectadas numa versão
suavizada da imagem e simplificadas em polilinhas. Assim o desenho coincide com a fotografia quando ela é revelada.
Saída: assets/contorno-sala-tv.json (polilinhas em coordenadas da foto original 1086 × 1448)."""
import cv2, numpy as np, json, sys
ROOT = __file__.rsplit('/scripts/', 1)[0]
im = cv2.imread(f'{ROOT}/assets/original/foto-sala-tv.jpg'); H, W = im.shape[:2]; K = 3
sm = cv2.resize(im, (W // K, H // K), interpolation=cv2.INTER_AREA)
for _ in range(3): sm = cv2.bilateralFilter(sm, 9, 60, 9)
g = cv2.cvtColor(sm, cv2.COLOR_BGR2GRAY)
e = cv2.Canny(g, 45, 120)
e = cv2.dilate(e, np.ones((2, 2), np.uint8))
cs, _ = cv2.findContours(e, cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)
polys = []
for c in cs:
    if cv2.arcLength(c, False) < 70: continue
    p = cv2.approxPolyDP(c, 2.2, False).reshape(-1, 2)
    ln = cv2.arcLength(p.reshape(-1, 1, 2).astype(np.float32), False)
    if len(p) / ln > .085: continue            # recortado demais (plantas, almofadas): fica fora do desenho
    polys.append((p * K).tolist())
polys.sort(key=lambda p: -cv2.arcLength(np.array(p, np.int32), False))
polys = polys[:90]
print('polilinhas', len(polys))
json.dump({'w': W, 'h': H, 'polys': polys}, open(f'{ROOT}/assets/contorno-sala-tv.json', 'w'))
if len(sys.argv) > 1:
    ov = im.copy(); canvas = np.full_like(im, (238, 245, 249))
    for p in polys:
        a = np.array(p, np.int32).reshape(-1, 1, 2)
        cv2.polylines(ov, [a], False, (59, 74, 60), 3, cv2.LINE_AA); cv2.polylines(canvas, [a], False, (59, 74, 60), 3, cv2.LINE_AA)
    cv2.imwrite(sys.argv[1], np.hstack([cv2.resize(canvas, (543, 724)), cv2.resize(ov, (543, 724))]))
