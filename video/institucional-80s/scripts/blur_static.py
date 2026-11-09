# Desfoca regiões fixas de um clipe (tela com dados reais, adesivos/marcas). Uso: blur_static.py entrada saida.avi
import cv2, numpy as np, sys
cap=cv2.VideoCapture(sys.argv[1]); W,H=1080,1920
out=cv2.VideoWriter(sys.argv[2],cv2.VideoWriter_fourcc(*'MJPG'),30,(W,H))
m=np.zeros((H,W),np.uint8)
cv2.fillPoly(m,[np.array([[300,0],[1080,0],[1080,930],[990,920],[210,620]],np.int32)],255)   # tela do notebook
cv2.ellipse(m,(990,894),(60,60),0,0,360,255,-1)                                             # adesivo amarelo
m=cv2.dilate(m,np.ones((31,31),np.uint8)); m=cv2.GaussianBlur(m,(0,0),18).astype(np.float32)[...,None]/255
while True:
    ok,fr=cap.read()
    if not ok: break
    bl=cv2.GaussianBlur(fr,(0,0),28)*0.6
    out.write((fr*(1-m)+bl*m).astype(np.uint8))
out.release()
