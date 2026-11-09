import cv2, numpy as np, json
pts=json.load(open('track.json'))
idx=[i for i,p in enumerate(pts) if p[2]>0.68]
A=np.array([[i,1] for i in idx],float)
fx=np.linalg.lstsq(A,np.array([pts[i][0] for i in idx],float),rcond=None)[0]
fy=np.linalg.lstsq(A,np.array([pts[i][1] for i in idx],float),rcond=None)[0]
res=[abs(fx[0]*i+fx[1]-pts[i][0])+abs(fy[0]*i+fy[1]-pts[i][1]) for i in idx]
print('pontos usados',len(idx),'erro médio px',round(float(np.mean(res)),1),'max',round(float(np.max(res)),1))
cap=cv2.VideoCapture('s01-1080.mp4'); W,H=1080,1920
out=cv2.VideoWriter('s01-blur.avi',cv2.VideoWriter_fourcc(*'MJPG'),30,(W,H))
yy,xx=np.mgrid[0:H,0:W]; i=0
while True:
    ok,fr=cap.read()
    if not ok: break
    cx=fx[0]*i+fx[1]; cy=fy[0]*i+fy[1]+40
    d=((xx-cx)/250)**2+((yy-cy)/165)**2
    m=np.clip((1.35-d)/0.6,0,1)[...,None].astype(np.float32)   # elipse com borda suave
    bl=cv2.GaussianBlur(fr,(0,0),22)
    fr=(fr*(1-m)+bl*m).astype(np.uint8)
    out.write(fr); i+=1
out.release(); print('quadros',i)
