import sys, os, soundfile as sf, numpy as np
from kokoro_onnx import Kokoro
k=Kokoro('kokoro.onnx','voices.bin')
voice=sys.argv[1]; out=sys.argv[2]; os.makedirs(out,exist_ok=True)
for t in ['Envie comercial no direct.','Envie comercial no dáiréct.']:
    print('FONEMAS', t, '->', k.tokenizer.phonemize(t,'pt-br'))
L=[l for l in open('linhas2.txt',encoding='utf-8').read().splitlines() if l.strip()]
for i,l in enumerate(L):
    s,sp,txt=l.split('|',2)
    a,sr=k.create(txt,voice=voice,speed=float(sp),lang='pt-br')
    idx=np.where(np.abs(a)>0.01)[0]; a=a[max(0,idx[0]-200):idx[-1]+800]
    sf.write(f'{out}/{i:02d}.wav',a,sr)
    print(f'{i:02d}|{s}|{len(a)/sr:.2f}|fim={float(s)+len(a)/sr:.2f}|{txt}')
