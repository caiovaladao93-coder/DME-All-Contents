import cv2, numpy as np, json, sys
cap=cv2.VideoCapture(sys.argv[1]); ok,f0=cap.read()
cx,cy=830,935; tw,th=180,90
g0=cv2.cvtColor(f0,cv2.COLOR_BGR2GRAY)
tpl=g0[cy-th//2:cy+th//2, cx-tw//2:cx+tw//2].copy()
cv2.imwrite('tpl.png',tpl); cv2.imwrite('f0crop.png',f0[cy-200:cy+200, cx-300:cx+250])
pts=[(cx,cy,1.0)]; prev=(cx,cy)
while True:
    ok,fr=cap.read()
    if not ok: break
    g=cv2.cvtColor(fr,cv2.COLOR_BGR2GRAY); R=130
    x0=max(0,prev[0]-tw//2-R); y0=max(0,prev[1]-th//2-R)
    x1=min(g.shape[1],prev[0]+tw//2+R); y1=min(g.shape[0],prev[1]+th//2+R)
    win=g[y0:y1,x0:x1]
    if win.shape[0]<th or win.shape[1]<tw: pts.append((prev[0],prev[1],0.0)); continue
    res=cv2.matchTemplate(win,tpl,cv2.TM_CCOEFF_NORMED); _,mv,_,ml=cv2.minMaxLoc(res)
    nx,ny=x0+ml[0]+tw//2, y0+ml[1]+th//2
    pts.append((int(nx),int(ny),float(mv))); prev=(int(nx),int(ny))
json.dump(pts,open('track.json','w'))
sc=[p[2] for p in pts]; print(len(pts),'score min',min(sc),'mean',sum(sc)/len(sc)); print(pts[::30])
