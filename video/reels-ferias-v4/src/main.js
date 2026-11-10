/*
 * DME · Reels "Se você tirar férias" v4 — mundo 3D (three.js) com câmera contínua entre 12 estações.
 * Determinístico: render(t) posiciona tudo a partir do tempo e desenha um quadro (sem relógio, sem aleatório).
 * Marca DME: escuro, aço escovado, cinematográfico; azul #3A6EA5 só na palavra-chave / destaque. Sem neon, sem pessoas.
 */
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {SVGLoader} from 'three/examples/jsm/loaders/SVGLoader.js';
import TL from './timeline.json';

const W = 1080, H = 1920, DUR = TL.dur;
const SC = Object.fromEntries(TL.scenes.map((s, i) => [s.key, {...s, i}]));
const KEYS = TL.scenes.map((s) => s.key);
const norm = (x) => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
/** instante (s) em que a palavra é dita na cena */
const wt = (k, w, nth = 0) => { const hits = TL.words[k].filter(([x]) => norm(x) === norm(w)); const h = hits[nth] ?? hits[0]; if (!h) throw new Error(`${w} ∉ ${k}`); return h[1]; };

// ───────── easing ─────────
function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t) => ((ax * t + bx) * t + cx) * t, sy = (t) => ((ay * t + by) * t + cy) * t;
  return (x) => { if (x <= 0) return 0; if (x >= 1) return 1; let lo = 0, hi = 1, t = x; for (let i = 0; i < 30; i++) { if (sx(t) < x) lo = t; else hi = t; t = (lo + hi) / 2; } return sy(t); };
}
const eOut = bezier(.22, 1, .36, 1), eIO = bezier(.65, 0, .35, 1), eIn = bezier(.55, 0, 1, .45);
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), P = (t, a, d) => clamp((t - a) / d), lerp = (a, b, p) => a + (b - a) * p;
const spring = (s, z = .72, w = 14) => { if (s <= 0) return 0; const wd = w * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w * s) * (Math.cos(wd * s) + (z * w / wd) * Math.sin(wd * s)); };
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// ───────── renderer, cena, ambiente ─────────
const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({canvas, antialias: true, preserveDrawingBuffer: true});
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
const DARK = new THREE.Color('#0A0B0C'), LIGHT = new THREE.Color('#C9CED3');
scene.background = DARK.clone();
scene.fog = new THREE.Fog(DARK.clone(), 11, 30);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.36;
const camera = new THREE.PerspectiveCamera(40, W / H, 0.05, 120);
const CAM_K = 1.5, LIFT = 1.0; // afasta a câmera de todas as poses e desce os objetos para a metade de baixo (texto em cima)

const hemi = new THREE.HemisphereLight('#c8d2de', '#0a0b0c', 0.35); scene.add(hemi);
const key = new THREE.DirectionalLight('#dfe7f2', 2.2); key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
key.shadow.camera.left = -6; key.shadow.camera.right = 6; key.shadow.camera.top = 6; key.shadow.camera.bottom = -6; key.shadow.radius = 6;
scene.add(key, key.target);
const rim = new THREE.DirectionalLight('#3A6EA5', 1.4); scene.add(rim, rim.target);
const sweep = new THREE.PointLight('#ffffff', 0, 6, 1.5); scene.add(sweep); // reflexo que passa no logo

// chão de aço com grade fina (sem brilho)
const floorMat = new THREE.MeshStandardMaterial({color: '#0d0f12', metalness: .75, roughness: .42});
const floor = new THREE.Mesh(new THREE.PlaneGeometry(260, 60), floorMat); floor.rotation.x = -Math.PI / 2; floor.position.set(44, 0, -10); floor.receiveShadow = true; scene.add(floor);
const grid = new THREE.GridHelper(260, 260, '#2b3036', '#1d2125'); grid.position.set(44, 0.002, -10); grid.scale.z = 60 / 260; grid.material.transparent = true; grid.material.opacity = .55; scene.add(grid);

// ───────── materiais ─────────
const M = {
  steel: new THREE.MeshPhysicalMaterial({color: '#b9c0c7', metalness: 1, roughness: .3, anisotropy: .8, anisotropyRotation: 0}),
  steelDark: new THREE.MeshPhysicalMaterial({color: '#3a4047', metalness: .95, roughness: .38, anisotropy: .6}),
  body: new THREE.MeshPhysicalMaterial({color: '#1c1f22', metalness: .6, roughness: .35, clearcoat: .8, clearcoatRoughness: .25}),
  glass: new THREE.MeshPhysicalMaterial({color: '#15181b', metalness: .2, roughness: .12, clearcoat: 1, clearcoatRoughness: .05}),
  blue: new THREE.MeshStandardMaterial({color: '#2c5b8e', metalness: .25, roughness: .5, envMapIntensity: .35}),
  chrome: new THREE.MeshPhysicalMaterial({color: '#e6eaee', metalness: 1, roughness: .08}),
};
const rbox = (w, h, d, r, mat) => { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat); m.castShadow = true; m.receiveShadow = true; return m; };

// ───────── texturas desenhadas (Sora / Manrope) ─────────
const TX = [];
function tex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.userData = {c, draw}; TX.push(t); return t;
}
const rr = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
const face = (w, h, map, opts = {}) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({map, transparent: true, toneMapped: false, fog: true, ...opts}));
const ICON = {
  doc: (g, s) => { g.moveTo(.3 * s, .14 * s); g.lineTo(.6 * s, .14 * s); g.lineTo(.75 * s, .3 * s); g.lineTo(.75 * s, .86 * s); g.lineTo(.3 * s, .86 * s); g.closePath(); g.moveTo(.4 * s, .5 * s); g.lineTo(.65 * s, .5 * s); g.moveTo(.4 * s, .66 * s); g.lineTo(.65 * s, .66 * s); },
  bell: (g, s) => { g.moveTo(.26 * s, .7 * s); g.lineTo(.26 * s, .46 * s); g.arc(.5 * s, .46 * s, .24 * s, Math.PI, 0); g.lineTo(.74 * s, .7 * s); g.lineTo(.8 * s, .78 * s); g.lineTo(.2 * s, .78 * s); g.closePath(); g.moveTo(.42 * s, .88 * s); g.lineTo(.58 * s, .88 * s); },
  coin: (g, s) => { g.arc(.5 * s, .5 * s, .32 * s, 0, Math.PI * 2); g.moveTo(.5 * s, .3 * s); g.lineTo(.5 * s, .7 * s); },
  check: (g, s) => { g.moveTo(.22 * s, .52 * s); g.lineTo(.42 * s, .72 * s); g.lineTo(.8 * s, .3 * s); },
  search: (g, s) => { g.arc(.44 * s, .44 * s, .22 * s, 0, Math.PI * 2); g.moveTo(.6 * s, .6 * s); g.lineTo(.82 * s, .82 * s); },
  rule: (g, s) => { g.moveTo(.2 * s, .3 * s); g.lineTo(.8 * s, .3 * s); g.moveTo(.2 * s, .5 * s); g.lineTo(.8 * s, .5 * s); g.moveTo(.2 * s, .7 * s); g.lineTo(.6 * s, .7 * s); },
  gear: (g, s) => { g.arc(.5 * s, .5 * s, .14 * s, 0, Math.PI * 2); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.moveTo(.5 * s + Math.cos(a) * .24 * s, .5 * s + Math.sin(a) * .24 * s); g.lineTo(.5 * s + Math.cos(a) * .36 * s, .5 * s + Math.sin(a) * .36 * s); } },
  eye: (g, s) => { g.moveTo(.12 * s, .5 * s); g.quadraticCurveTo(.5 * s, .14 * s, .88 * s, .5 * s); g.quadraticCurveTo(.5 * s, .86 * s, .12 * s, .5 * s); g.moveTo(.62 * s, .5 * s); g.arc(.5 * s, .5 * s, .12 * s, 0, Math.PI * 2); },
  chart: (g, s) => { [[.25, .75, .5], [.42, .75, .32], [.59, .75, .45], [.76, .75, .2]].forEach(([x, y0, y1]) => { g.moveTo(x * s, y0 * s); g.lineTo(x * s, y1 * s); }); },
  flow: (g, s) => { g.rect(.16 * s, .2 * s, .3 * s, .22 * s); g.rect(.54 * s, .58 * s, .3 * s, .22 * s); g.moveTo(.31 * s, .42 * s); g.lineTo(.31 * s, .69 * s); g.lineTo(.54 * s, .69 * s); },
};
function icon(g, k, x, y, s, color, lw) { g.save(); g.translate(x, y); g.beginPath(); ICON[k](g, s); g.strokeStyle = color; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); g.restore(); }

// ───────── estações ─────────
const X = {}; KEYS.forEach((k, i) => { X[k] = i * 8; });
const objs = {};

// 1 · calendário (gancho e loop): placa de aço com dias; a barra "Férias" é um objeto 3D azul (fio condutor)
function calendar(x) {
  const g = new THREE.Group(); g.position.set(x, 1.45, 0); g.rotation.x = -0.42; scene.add(g);
  const slab = rbox(3.3, 2.4, 0.14, .08, M.steelDark); g.add(slab);
  const t = tex(1320, 960, (c, w, h) => {
    c.fillStyle = '#1b1f23'; rr(c, 0, 0, w, h, 40); c.fill();
    c.fillStyle = '#F2F4F6'; c.font = '600 64px Sora'; c.fillText('Calendário', 70, 120);
    c.fillStyle = 'rgba(192,198,204,.7)'; c.font = '700 30px Manrope'; c.textAlign = 'right'; c.fillText('PRÓXIMAS SEMANAS', w - 70, 115); c.textAlign = 'center';
    const days = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM']; const cw = (w - 140 - 6 * 18) / 7;
    days.forEach((d, i) => { c.fillStyle = 'rgba(192,198,204,.55)'; c.font = '700 28px Manrope'; c.fillText(d, 70 + i * (cw + 18) + cw / 2, 205); });
    for (let r = 0; r < 3; r++) for (let i = 0; i < 7; i++) {
      const x0 = 70 + i * (cw + 18), y0 = 245 + r * 225; c.fillStyle = 'rgba(192,198,204,.08)'; rr(c, x0, y0, cw, 190, 22); c.fill();
      c.fillStyle = 'rgba(192,198,204,.6)'; c.font = '600 46px Manrope'; c.fillText(String(7 + r * 7 + i), x0 + cw / 2, y0 + 112);
    }
  });
  const f = face(3.3 - .12, 2.4 - .12, t); f.position.z = .072; g.add(f);
  // barra Férias (linha do meio)
  const bar = new THREE.Group(); bar.position.set(-1.43, 2.4 / 2 - .12 - (245 + 225 + 95) / 960 * 2.28, .1); g.add(bar);
  const barMesh = rbox(2.86, .42, .1, .05, M.blue); barMesh.position.x = 1.43; bar.add(barMesh);
  const lbl = face(1.2, .3, tex(480, 120, (c) => { c.fillStyle = '#F4F6F8'; c.font = '700 64px Sora'; c.fillText('Férias', 10, 84); })); lbl.position.set(.78, 0, .056); bar.add(lbl);
  return {g, bar};
}
objs.cal1 = calendar(X.hook);
objs.cal2 = calendar(X.loop);
// chip "Férias" que voa (fio condutor)
objs.chip = new THREE.Group(); scene.add(objs.chip);
{ const b = rbox(1.5, .42, .12, .2, M.blue); objs.chip.add(b); const l = face(1.1, .3, tex(440, 120, (c) => { c.fillStyle = '#F4F6F8'; c.font = '700 66px Sora'; c.fillText('Férias', 40, 86); })); l.position.z = .065; objs.chip.add(l); }
// alerta que cai sobre o calendário
function card(w, h, title, sub, ic, accent = false) {
  const g = new THREE.Group(); const b = rbox(w, h, .1, .08, M.glass); g.add(b);
  const t = tex(1024, Math.round(1024 * h / w), (c, cw, ch) => {
    c.fillStyle = '#202428'; rr(c, 0, 0, cw, ch, 40); c.fill(); c.strokeStyle = accent ? 'rgba(58,110,165,.9)' : 'rgba(192,198,204,.18)'; c.lineWidth = 4; rr(c, 2, 2, cw - 4, ch - 4, 38); c.stroke();
    c.fillStyle = 'rgba(58,110,165,.2)'; rr(c, 44, ch / 2 - 64, 128, 128, 30); c.fill(); c.strokeStyle = 'rgba(58,110,165,.85)'; c.lineWidth = 4; rr(c, 44, ch / 2 - 64, 128, 128, 30); c.stroke();
    icon(c, ic, 54, ch / 2 - 54, 108, '#C0C6CC', 8);
    c.fillStyle = '#EEF1F4'; let fs = 62; c.font = `600 ${fs}px Manrope`; while (c.measureText(title).width > cw - 250 && fs > 36) { fs -= 2; c.font = `600 ${fs}px Manrope`; } c.fillText(title, 210, ch / 2 - 6); c.fillStyle = 'rgba(192,198,204,.62)'; c.font = '500 40px Manrope'; c.fillText(sub, 210, ch / 2 + 56);
  });
  const f = face(w - .04, h - .04, t); f.position.z = .052; g.add(f); return g;
}
objs.alert = card(2.6, .82, 'Aguardando você', 'Pendências da semana', 'bell', true); scene.add(objs.alert);

// 2 · notificações (trinca)
const NT = [['Aprovação pendente', 'doc'], ['Cobrar retorno da equipe', 'coin'], ['Lembrar prazo do fornecedor', 'bell'], ['Aprovar orçamento', 'doc'], ['Confirmar entrega', 'bell']];
objs.notifs = NT.map(([t, ic]) => { const c = card(2.9, .74, t, 'Precisa de você · agora', ic); scene.add(c); return c; });

// 3 · funil de aço (gargalo) e blocos
{
  const pts = [V(.22, 0, 0), V(.22, .8, 0), V(.3, .95, 0), V(1.65, 2.35, 0), V(1.7, 2.42, 0)].map((p) => new THREE.Vector2(p.x, p.y));
  const f = new THREE.Mesh(new THREE.LatheGeometry(pts, 96), new THREE.MeshPhysicalMaterial({color: '#7d848b', metalness: 1, roughness: .34, side: THREE.DoubleSide, anisotropy: .8}));
  f.position.set(X.gargalo, .05, 0); f.castShadow = true; f.receiveShadow = true; scene.add(f); objs.funnel = f;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.7, .045, 16, 120), M.chrome); rim.rotation.x = Math.PI / 2; rim.position.set(X.gargalo, 2.47, 0); scene.add(rim);
  objs.blocks = Array.from({length: 9}, (_, i) => { const b = rbox(.42, .26, .3, .05, i % 3 === 0 ? M.blue : M.steelDark); scene.add(b); return b; });
}

// 4 · esfera do processo (token)
objs.token = new THREE.Mesh(new THREE.SphereGeometry(.28, 64, 48), M.chrome); objs.token.castShadow = true; scene.add(objs.token);

// 5 · fluxo: 4 plataformas em escada
const FL = ['Entrada', 'Processo', 'Validação', 'Entrega'];
objs.pads = FL.map((n, i) => {
  const g = new THREE.Group(); g.position.set(X.fluxo, .25 + i * .78, -i * 1.25); scene.add(g);
  const top = new THREE.MeshPhysicalMaterial({color: '#2a2f34', metalness: .9, roughness: .35}); const p = rbox(2.4, .22, .9, .06, top); g.add(p);
  const l = face(2.5, .58, tex(880, 200, (c) => { c.fillStyle = '#F2F4F6'; c.font = '600 92px Sora'; c.textAlign = 'center'; c.fillText(n, 440, 135); }));
  l.position.set(0, .4, .2); g.add(l); g.userData = {mat: top, label: l}; return g;
});
objs.tracks = [0, 1, 2].map((i) => { const a = objs.pads[i].position, b = objs.pads[i + 1].position; const d = b.clone().sub(a); const len = d.length();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, len, 12), M.steel); m.position.copy(a.clone().add(b).multiplyScalar(.5)).add(V(0, .12, 0));
  m.quaternion.setFromUnitVectors(V(0, 1, 0), d.clone().normalize()); scene.add(m); return m; });

// 6 · método: cartão de vidro que gira (lista + demonstração)
function methodTex(k) {
  return tex(760, 1060, (c, w, h) => {
    c.fillStyle = '#1e2226'; rr(c, 0, 0, w, h, 50); c.fill(); c.strokeStyle = 'rgba(192,198,204,.16)'; c.lineWidth = 4; rr(c, 2, 2, w - 4, h - 4, 48); c.stroke();
    const titles = ['Onde o processo trava', 'Fluxo mapeado', 'Regra definida', 'Tarefa automatizada'];
    c.fillStyle = '#F2F4F6'; c.font = '600 60px Sora'; const words = titles[k].split(' '); let line = '', y = 120;
    words.forEach((wd) => { const tl = line ? line + ' ' + wd : wd; if (c.measureText(tl).width > w - 120) { c.fillText(line, 60, y); line = wd; y += 72; } else line = tl; }); c.fillText(line, 60, y);
    const bar = (x, yy, ww, blue) => { c.fillStyle = blue ? '#3A6EA5' : 'rgba(192,198,204,.16)'; rr(c, x, yy, ww, 26, 13); c.fill(); };
    if (k === 0) { bar(60, 330, 500); bar(60, 390, 360); bar(60, 450, 610, true); bar(60, 510, 280); c.strokeStyle = '#3A6EA5'; c.lineWidth = 4; rr(c, 60, 610, 300, 80, 40); c.stroke(); c.fillStyle = '#E6E9EC'; c.font = '600 40px Manrope'; c.fillText('● Gargalo', 92, 664); }
    if (k === 1) { c.strokeStyle = '#C0C6CC'; c.lineWidth = 5; [[60, 320], [380, 520], [60, 720]].forEach(([x, yy], i) => { c.strokeStyle = i === 1 ? '#3A6EA5' : '#C0C6CC'; rr(c, x, yy, 300, 140, 26); c.stroke(); });
      c.strokeStyle = '#3A6EA5'; c.lineWidth = 6; c.beginPath(); c.moveTo(360, 390); c.lineTo(530, 390); c.lineTo(530, 515); c.moveTo(530, 665); c.lineTo(530, 790); c.lineTo(365, 790); c.stroke(); }
    if (k === 2) { [0, 1, 2].forEach((i) => { c.fillStyle = '#3A6EA5'; c.beginPath(); c.arc(100, 380 + i * 150, 40, 0, Math.PI * 2); c.fill(); icon(c, 'check', 66, 346 + i * 150, 68, '#fff', 8); c.fillStyle = 'rgba(192,198,204,.18)'; rr(c, 170, 366 + i * 150, [380, 300, 440][i], 28, 14); c.fill(); }); }
    if (k === 3) { c.fillStyle = '#3A6EA5'; rr(c, 60, 420, 320, 170, 85); c.fill(); c.fillStyle = '#E8ECEF'; c.beginPath(); c.arc(295, 505, 66, 0, Math.PI * 2); c.fill(); c.fillStyle = 'rgba(192,198,204,.18)'; rr(c, 60, 700, 520, 26, 13); c.fill(); rr(c, 60, 760, 380, 26, 13); c.fill(); }
    c.fillStyle = 'rgba(192,198,204,.55)'; c.font = '600 30px Manrope'; c.fillText('Exemplo ilustrativo', 60, h - 60);
  });
}
objs.mtex = [0, 1, 2, 3].map(methodTex);
{ const g = new THREE.Group(); g.position.set(X.metodo + 1.0, 1.55, 0); scene.add(g); const b = rbox(1.72, 2.4, .08, .1, M.glass); g.add(b);
  const fr = face(1.66, 2.34, objs.mtex[0]); fr.position.z = .045; g.add(fr); const bk = face(1.66, 2.34, objs.mtex[1]); bk.position.z = -.045; bk.rotation.y = Math.PI; g.add(bk);
  objs.mcard = {g, fr, bk}; }

// 7 · interruptor e ícones em órbita
{ const g = new THREE.Group(); g.position.set(X.auto, 1.25, 0); scene.add(g);
  const trackMat = new THREE.MeshPhysicalMaterial({color: '#2a2f34', metalness: .7, roughness: .3, clearcoat: .8});
  const tr = new THREE.Mesh(new THREE.CapsuleGeometry(.42, 1.0, 16, 48), trackMat); tr.rotation.z = Math.PI / 2; tr.scale.z = .55; tr.castShadow = true; g.add(tr);
  const kn = new THREE.Mesh(new THREE.SphereGeometry(.34, 64, 48), M.chrome); kn.position.z = .12; kn.castShadow = true; g.add(kn);
  objs.toggle = {g, trackMat, kn};
  objs.orbit = ['check', 'doc', 'bell', 'chart', 'coin', 'flow', 'gear', 'rule'].map((ic, i) => { const o = new THREE.Group(); const b = rbox(.5, .5, .14, .08, M.steelDark); o.add(b);
    const f = face(.42, .42, tex(256, 256, (c) => icon(c, ic, 28, 28, 200, i % 3 === 0 ? '#5d8cc0' : '#C0C6CC', 14))); f.position.z = .075; o.add(f); scene.add(o); return o; });
}

// 8 · celular (montagem de tempo)
const DAYS = [['segunda-feira', '09:12', 'Aprovação concluída', '#2f5a86'], ['quarta-feira', '14:30', 'Relatório enviado', '#264B71'], ['sexta-feira', '17:45', 'Retorno registrado', '#1c2733']];
objs.ptex = DAYS.map(([d, h, n, col]) => tex(620, 1280, (c, w, hh) => {
  const g = c.createLinearGradient(0, 0, 0, hh); g.addColorStop(0, col); g.addColorStop(.75, '#0b0e12'); c.fillStyle = g; rr(c, 0, 0, w, hh, 70); c.fill();
  c.fillStyle = '#0A0B0C'; rr(c, w / 2 - 90, 30, 180, 48, 24); c.fill();
  c.fillStyle = 'rgba(242,244,246,.85)'; c.font = '600 40px Manrope'; c.textAlign = 'center'; c.fillText(d, w / 2, 190);
  c.fillStyle = '#F4F6F8'; c.font = '700 170px Sora'; c.fillText(h, w / 2, 380);
  c.textAlign = 'left'; c.fillStyle = 'rgba(242,244,246,.15)'; rr(c, 34, 560, w - 68, 160, 40); c.fill();
  c.fillStyle = '#3A6EA5'; rr(c, 60, 590, 100, 100, 26); c.fill(); icon(c, 'check', 70, 600, 80, '#fff', 9);
  c.fillStyle = '#F4F6F8'; c.font = '600 42px Manrope'; c.fillText(n, 186, 652);
}));
{ const g = new THREE.Group(); g.position.set(X.dias, 1.55, 0); scene.add(g); const b = rbox(1.42, 2.86, .13, .2, M.body); g.add(b);
  const s = face(1.28, 2.66, objs.ptex[0]); s.position.z = .07; g.add(s); objs.phone = {g, s}; }

// 9 · cubo dos verbos
{ const mats = ['search', 'rule', 'gear', 'eye'].map((ic) => new THREE.MeshPhysicalMaterial({color: '#ffffff', metalness: .85, roughness: .38,
    map: tex(512, 512, (c) => { const g = c.createLinearGradient(0, 0, 512, 512); g.addColorStop(0, '#3a4047'); g.addColorStop(.5, '#22262a'); g.addColorStop(1, '#30353b'); c.fillStyle = g; c.fillRect(0, 0, 512, 512); icon(c, ic, 106, 106, 300, '#d3d8dd', 20); })}));
  const side = new THREE.MeshPhysicalMaterial({color: '#2b3036', metalness: .9, roughness: .35});
  // ordem das faces do BoxGeometry: +x, -x, +y, -y, +z, -z → giro em y mostra +z, +x, -z, -x
  const cube = new THREE.Mesh(new RoundedBoxGeometry(1.3, 1.3, 1.3, 6, .12), [mats[1], mats[3], side, side, mats[0], mats[2]]);
  cube.position.set(X.verbos, 1.5, 0); cube.castShadow = true; scene.add(cube); objs.cube = cube; }

// 10 · chips da vida (fecho)
objs.life = [['Novos clientes', -.55, 2.45, -.6], ['Planejamento', .55, 1.0, -1.6], ['Família', -.5, .55, .4], ['Estratégia', .5, 1.95, .9]].map(([n, x, y, z], i) => {
  const g = new THREE.Group(); g.position.set(X.fecho + x, y, z); scene.add(g); const b = rbox(1.9, .48, .1, .22, M.glass); g.add(b);
  const f = face(1.84, .44, tex(800, 190, (c, w, h) => { c.fillStyle = '#C0C6CC'; c.beginPath(); c.arc(70, 95, 16, 0, Math.PI * 2); c.fill(); c.fillStyle = '#E6E9EC'; c.font = '600 72px Manrope'; c.fillText(n, 110, 120); }));
  f.position.z = .055; g.add(f); g.userData.base = g.position.clone(); return g;
});

// 12 · logo DME extrudado em aço escovado (vetor oficial, 4 peças)
objs.logo = new THREE.Group(); objs.logo.position.set(X.logo, 1.75, 0); scene.add(objs.logo);
const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 610"><path d="M12.5 17.5 L205 17.5 L382.5 177.5 L440 122.5 L522.5 122.5 L382.5 252.5 L182.5 72.5 L77.5 72.5 L77.5 440 L200 440 C230 440 250 420 250 390 L250 210 L310 270 L310 380 C310 445 265 487 205 487 L12.5 487 Z"/><path d="M135 125 L160 125 L197.5 162.5 L197.5 390 L135 390 Z"/><path d="M275 17.5 L737.5 17.5 L737.5 132.5 L675 132.5 L675 72.5 L620 72.5 L620 242.5 L737.5 242.5 L737.5 300 L620 300 L620 390 L557.5 390 L557.5 72.5 L425 72.5 L382.5 107.5 Z"/><path d="M440 270 L502.5 210 L502.5 440 L675 440 L675 395 L737.5 395 L737.5 487 L440 487 Z"/></svg>`;
objs.lp = new SVGLoader().parse(LOGO_SVG).paths.map((p) => {
  const geo = new THREE.ExtrudeGeometry(SVGLoader.createShapes(p), {depth: 46, bevelEnabled: true, bevelThickness: 7, bevelSize: 5, bevelSegments: 4, curveSegments: 24});
  geo.translate(-375, -252, -23); const m = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({color: '#cfd5da', metalness: 1, roughness: .24, anisotropy: .9}));
  m.scale.set(.0042, -.0042, .0042); m.castShadow = true; const g = new THREE.Group(); g.add(m); objs.logo.add(g); return g;
});

// ───────── câmera por estação ─────────
// pose(k, u): posição e alvo da câmera na estação k, com u = progresso dentro da cena (0..1)
function pose(k, u, t) {
  const x = X[k], e = eIO(u);
  switch (k) {
    case 'hook': return [V(x + lerp(.25, 0, e), lerp(3.2, 2.85, e), lerp(6.4, 5.5, e)), V(x, 1.15, 0)];
    case 'trinca': return [V(x - .25 + .4 * e, 2.0, lerp(6.9, 6.2, e)), V(x, 1.35, 0)];
    case 'gargalo': { const dive = eIn(P(t, SC.gargalo.t1 - .75, .75)); return [V(x + lerp(.9, .2, e) * (1 - dive), lerp(4.1, 3.6, e) - 1.0 * dive, lerp(5.8, 5.1, e) - 4.6 * dive), V(x, lerp(1.3, 1.1, e) - .3 * dive, -0.3 * dive)]; }
    case 'agora': return [V(x, 1.5, lerp(4.6, 4.2, e)), V(x, 1.25, 0)];
    case 'fluxo': return [V(x + lerp(1.6, .9, e), lerp(2.6, 3.2, e), lerp(6.6, 5.8, e)), V(x, lerp(1.1, 1.6, e), -1.9)];
    case 'metodo': return [V(x + .3, 1.65, lerp(6.4, 5.9, e)), V(x + .3, 1.3, 0)];
    case 'auto': return [V(x + Math.sin(u * 1.2) * .6, 1.75, lerp(6.6, 6.0, e)), V(x, 1.35, 0)];
    case 'dias': return [V(x + lerp(-.5, .4, e), 1.75, lerp(5.4, 4.9, e)), V(x, 1.45, 0)];
    case 'verbos': return [V(x + lerp(.3, -.3, e), 1.6, lerp(5.6, 5.0, e)), V(x, .85, 0)];
    case 'fecho': { const a = lerp(-.14, .14, e); return [V(x + Math.sin(a) * 6.6, 2.0, Math.cos(a) * 6.6), V(x, 1.55, 0)]; }
    case 'loop': return [V(x + lerp(-.3, 0, e), lerp(3.4, 2.9, e), lerp(6.2, 5.5, e)), V(x, 1.15, 0)];
    case 'logo': return [V(x, 1.2, lerp(6.6, 6.0, e)), V(x, .55, 0)];
  }
}
const TRANS = .55; // duração da viagem entre estações (s), centrada no corte
function camAt(t) {
  let i = KEYS.findIndex((k) => t < SC[k].t1); if (i < 0) i = KEYS.length - 1;
  const k = KEYS[i], s = SC[k]; const u = clamp((t - s.t0) / (s.t1 - s.t0));
  let [p, q] = pose(k, u, t);
  // viagem para a próxima estação nos últimos TRANS/2 s e vinda da anterior nos primeiros TRANS/2 s
  if (i < KEYS.length - 1 && t > s.t1 - TRANS / 2 && k !== 'gargalo') {
    const n = KEYS[i + 1]; const [p2, q2] = pose(n, 0, t); const m = eIn(P(t, s.t1 - TRANS / 2, TRANS / 2)) * .5;
    p = p.clone().lerp(p2, m); q = q.clone().lerp(q2, m);
  }
  if (i > 0 && t < s.t0 + TRANS / 2 && KEYS[i - 1] !== 'gargalo') {
    const pk = KEYS[i - 1]; const [p0, q0] = pose(pk, 1, t); const m = .5 + eOut(P(t, s.t0, TRANS / 2)) * .5;
    p = p0.clone().lerp(p, m); q = q0.clone().lerp(q, m);
  }
  // enquadramento global: distância maior e alvo acima do objeto
  const pp = q.clone().add(p.clone().sub(q).multiplyScalar(CAM_K)); pp.y += LIFT; const qq = q.clone(); qq.y += LIFT;
  return [pp, qq];
}

// ───────── texto (DOM), palavra a palavra com desfoque de movimento ─────────
const $ = (id) => document.getElementById(id);
function build(el) { const spec = el.dataset.t; el.innerHTML = ''; let acc = false; const ws = [];
  spec.split('|').forEach((line, li) => { if (li) el.appendChild(document.createElement('br'));
    line.split(' ').filter(Boolean).forEach((w) => { let t = w; if (t.startsWith('[')) { acc = true; t = t.slice(1); } let end = false; if (t.includes(']')) { end = true; t = t.replace(']', ''); }
      const s = document.createElement('span'); s.className = 'w' + (acc ? ' acc' : ''); s.textContent = t; el.appendChild(s); el.appendChild(document.createTextNode(' ')); ws.push(s); if (end) acc = false; }); });
  el._w = ws; }
document.querySelectorAll('[data-t]').forEach(build);
function words(id, t, tin, tout, dy = 44) { const el = $(id); const q = tout == null ? 0 : eIn(P(t, tout, .28));
  el._w.forEach((s, i) => { const e = tin < 0 ? 1 : eOut(P(t, tin + i * .06, .42)); s.style.opacity = (e * (1 - q)).toFixed(3);
    s.style.transform = `translateY(${((1 - e) * dy - q * 34).toFixed(1)}px) scale(${(1 + (1 - e) * .06).toFixed(3)})`; s.style.filter = (1 - e) * 11 + q * 9 > .1 ? `blur(${((1 - e) * 11 + q * 9).toFixed(1)}px)` : ''; });
  el.style.display = (tin >= 0 && t < tin - .02) || q >= 1 ? 'none' : 'block'; }
function fade(id, t, tin, tout, dy = 20) { const el = $(id); const e = eOut(P(t, tin, .4)), q = tout == null ? 0 : eIn(P(t, tout, .25));
  el.style.opacity = (e * (1 - q)).toFixed(3); el.style.transform = `translateY(${((1 - e) * dy).toFixed(1)}px)`; el.style.display = e * (1 - q) < .002 ? 'none' : (id === 'cta' ? 'flex' : 'block'); }

// ───────── render(t) ─────────
const tmp = new THREE.Vector3();
function render(t) {
  t = clamp(t, 0, DUR - 1e-6);
  const s = (k) => SC[k];
  // ── inversão clara no "Agora"
  const inv = t >= s('agora').t0 - .05 && t < s('agora').t1 ? eOut(P(t, s('agora').t0 - .05, .3)) * (1 - eIn(P(t, s('agora').t1 - .3, .3))) : 0;
  scene.background.copy(DARK).lerp(LIGHT, inv); scene.fog.color.copy(scene.background);
  floorMat.color.set('#0d0f12').lerp(new THREE.Color('#b9bfc5'), inv); grid.material.opacity = .55 * (1 - inv);
  renderer.toneMappingExposure = 1 + .15 * inv;
  document.body.classList.toggle('light', inv > .5);

  // ── câmera
  const [cp, cq] = camAt(t);
  camera.position.copy(cp); camera.lookAt(cq);
  key.position.copy(cq).add(V(4, 7, 5)); key.target.position.copy(cq);
  rim.position.copy(cq).add(V(-5, 3, -4)); rim.target.position.copy(cq);

  // ── 1 gancho: calendário, alerta cai, chip Férias sai (fio condutor)
  const a1 = wt('hook', 'sua');
  { const c = objs.cal1; c.g.rotation.x = -.42 + Math.sin(t * 1.1) * .02; c.g.rotation.y = Math.sin(t * .7) * .04;
    const lift = eIO(P(t, a1 - .05, .5)); c.bar.visible = lift < .02;
    const al = objs.alert; const pa = spring(t - (a1 - .12)); al.visible = t > a1 - .12 && t < s('trinca').t0 + .3;
    al.position.set(X.hook + .1, lerp(4.2, 2.35, pa), .55); al.rotation.set(-.3, 0, Math.sin(t * 40) * .02 * (1 - P(t, a1 + .2, .4)));
  }
  // chip: sai do calendário (gancho) e volta (loop)
  { const ch = objs.chip; let vis = false;
    if (t >= a1 - .05 && t < s('trinca').t0) { vis = true; const p = eIO(P(t, a1 - .05, .9));
      const from = V(X.hook - .0, 1.62, .35), to = V(X.hook - 2.2, 3.4, 1.6); ch.position.copy(from.clone().lerp(to, p)); ch.rotation.set(-.4 + p * .6, p * .8, -p * .5); ch.scale.setScalar(lerp(1, .8, p)); }
    const tl = wt('loop', 'férias?');
    if (t >= s('loop').t0 && t < s('logo').t0) { vis = true; const p = eIO(P(t, tl - .1, .7)), land = eIO(P(t, wt('loop', 'Agora') + .25, .55));
      const from = V(X.loop - 2.3, 3.6, 1.8), mid = V(X.loop - .2, 2.4, .9), end = V(X.loop, 1.62, .34);
      ch.position.copy(from.clone().lerp(mid, p).lerp(end, land)); ch.rotation.set(lerp(.3, -.42, land), lerp(.7, 0, Math.max(p * .5, land)), lerp(-.4, 0, land)); ch.scale.setScalar(lerp(.8, 1, land));
      if (land >= 1) vis = false; objs.cal2.bar.visible = land >= 1; objs.cal2.bar.scale.x = 1; }
    else objs.cal2.bar.visible = false;
    ch.visible = vis; }
  objs.cal2.g.rotation.x = -.42 + Math.sin(t * 1.1) * .02;

  // ── 2 trinca: notificações empilham na fala e transbordam
  { const tv = [wt('trinca', 'você', 0), wt('trinca', 'você', 1), wt('trinca', 'você', 2)];
    const st = [tv[0] - .05, tv[1] - .05, tv[2] - .05, tv[2] + .45, tv[2] + .7];
    const vib = t > tv[2] + .5 ? Math.sin(t * 70) * .015 * P(t, tv[2] + .5, .2) : 0;
    const shrink = eIO(P(t, s('gargalo').t0 - .25, .4));
    objs.notifs.forEach((n, i) => { const p = spring(t - st[i], .75, 12); n.visible = t > st[i] && t < s('gargalo').t0 + .9;
      const y = 2.75 - i * .62; n.position.set(X.trinca + vib + (i % 2 ? .08 : -.08), lerp(y + 1.2, y, p), lerp(.0, .25 * i, p));
      n.rotation.set(-.05, (i % 2 ? -.06 : .06), [0, 0, 0, -.04, .05][i]); n.scale.setScalar(lerp(.8, 1, p));
      if (shrink > 0) { // viram blocos e voam para o funil
        const tgt = V(X.gargalo - .4 + i * .2, 3.4, 0); n.position.lerp(tgt, shrink); n.scale.setScalar(lerp(1, .14, shrink)); }
    }); }

  // ── 3 gargalo: blocos caem no funil e entopem
  { const t0 = s('gargalo').t0; objs.blocks.forEach((b, i) => { const st = t0 + .05 + i * .1; const p = eIn(P(t, st, .55));
      const tx = X.gargalo + [-.08, .12, -.15, .1, 0, -.12, .14, -.02, .06][i], ty = .95 + [0, .05, .25, .3, .5, .52, .75, .8, 1.0][i];
      b.visible = t > st && t < s('agora').t0 + .2;
      const bounce = t > st + .55 ? Math.exp(-(t - st - .55) * 8) * Math.abs(Math.sin((t - st - .55) * 22)) * .12 : 0;
      b.position.set(lerp(X.gargalo + (i - 4) * .35, tx, p), lerp(3.8 + i * .1, ty, p) + bounce, lerp(.3, (i % 3 - 1) * .1, p));
      b.rotation.set(p * (i % 2 ? .6 : -.5), p * i * .3, p * ((i % 3) - 1) * .4);
      if (t > wt('gargalo', 'É')) b.position.x += Math.sin(t * 50 + i) * .006; }); }

  // ── 4 agora / 5 fluxo: o token (esfera) aparece e percorre as plataformas
  { const tk = objs.token; tk.visible = t >= s('agora').t0 + .1 && t < s('fluxo').t1 + .2;
    if (t < s('fluxo').t0) { const p = spring(t - (wt('agora', 'quem') - .1)); tk.position.set(X.agora, lerp(2.6, 1.0, p), 0); tk.scale.setScalar(lerp(.3, 1.6, P(t, s('agora').t0, .3))); }
    else { const names = ['entrada,', 'processo,', 'validação,', 'entrega.']; const tw = names.map((w) => wt('fluxo', w));
      let pos = objs.pads[0].position.clone().add(V(0, .4, .15)); tk.scale.setScalar(1);
      for (let i = 1; i < 4; i++) { const p = eIO(P(t, tw[i] - .32, .32)); if (p > 0) { const a = objs.pads[i - 1].position.clone().add(V(0, .4, .15)), b = objs.pads[i].position.clone().add(V(0, .4, .15));
        pos = a.lerp(b, p); pos.y += Math.sin(p * Math.PI) * .45; } }
      tk.position.copy(pos);
      objs.pads.forEach((pd, i) => { const on = eOut(P(t, tw[i] - .04, .2)); pd.userData.mat.color.set('#2a2f34').lerp(new THREE.Color('#3A6EA5'), on); pd.userData.mat.metalness = lerp(.9, .5, on); }); } }

  // ── 6 método: cartão gira a cada etapa falada
  { const tw = ['diagnóstico,', 'mapeia,', 'padroniza', 'automatiza.'].map((w) => wt('metodo', w)); let k = 0; for (let i = 0; i < 4; i++) if (t >= tw[i] - .15) k = i;
    let ry = 0; for (let i = 1; i < 4; i++) { const st = tw[i] - .38; if (t >= st && t < st + .38) ry = Math.PI * eIO(P(t, st, .38)); }
    const c = objs.mcard; const idx = (i) => objs.mtex[clamp(i, 0, 3)];
    c.fr.material.map = idx(ry > 0 ? k - 0 : k); c.bk.material.map = idx(k + 1);
    if (ry > 0) { c.fr.material.map = idx(k); c.bk.material.map = idx(k + 1); }
    c.g.rotation.set(Math.sin(t * 1.2) * .04, -.22 + ry + Math.sin(t * .8) * .05, 0);
    c.g.position.y = 1.55 + Math.sin(t * 1.4) * .03;
    for (let i = 0; i < 4; i++) { const el = $('m' + i); const act = i === k && t >= tw[0] - .15; el.classList.toggle('on', act); el.style.opacity = (t < s('metodo').t0 ? 0 : act ? 1 : .32) * (1 - eIn(P(t, s('metodo').t1 - .25, .25))); } }

  // ── 7 automático: interruptor liga e ícones orbitam em profundidade
  { const on = eIO(P(t, wt('auto', 'automático.') - .2, .35)); const tg = objs.toggle;
    tg.kn.position.x = lerp(-.5, .5, on); tg.trackMat.color.set('#2a2f34').lerp(new THREE.Color('#3A6EA5'), on);
    tg.g.rotation.set(.35 + Math.sin(t * 1.5) * .05, Math.sin(t * .9) * .15, 0);
    const pop = eOut(P(t, s('auto').t0, .5)), suck = eIn(P(t, s('auto').t1 - .35, .35));
    objs.orbit.forEach((o, i) => { const a = i / 8 * Math.PI * 2 + t * .7; const r = 2.1 * pop * (1 - suck);
      o.position.set(X.auto + Math.cos(a) * r, 1.3 + Math.sin(a * 2) * .25, Math.sin(a) * r * .8); o.rotation.set(Math.sin(t + i) * .3, -a + Math.PI / 2, 0);
      o.scale.setScalar(pop * (1 - suck * .8)); o.visible = t > s('auto').t0 - .1 && t < s('auto').t1 + .1; }); }

  // ── 8 dias: celular troca a tela a cada dia falado
  { const tw = [wt('dias', 'segunda.'), wt('dias', 'quarta.'), wt('dias', 'sexta.')]; let k = 0; for (let i = 0; i < 3; i++) if (t >= tw[i] - .1) k = i;
    objs.phone.s.material.map = objs.ptex[k]; const pin = spring(t - s('dias').t0);
    objs.phone.g.rotation.set(-.08, Math.sin(t * 1.3) * .22, Math.sin(t * .9) * .03); objs.phone.g.scale.setScalar(lerp(.7, 1, pin)); }

  // ── 9 verbos: cubo gira 90° a cada verbo
  { const tw = ['mapeando.', 'padronizando.', 'automatizando.', 'acompanhando.'].map((w) => wt('verbos', w)); let r = 0;
    for (let i = 1; i < 4; i++) r += eIO(P(t, tw[i] - .3, .3));
    objs.cube.rotation.set(.38 + Math.sin(t * 1.1) * .05, -r * Math.PI / 2 + Math.sin(t * .8) * .1, 0); objs.cube.position.y = 1.5 + Math.sin(t * 1.6) * .04;
    let pos = 0; for (let i = 1; i < 4; i++) pos += eIO(P(t, tw[i] - .3, .3));
    for (let i = 0; i < 4; i++) { const el = $('v' + i); const d = i - pos; el.style.top = (1460 + d * 96).toFixed(1) + 'px';
      const a = Math.max(0, 1 - Math.abs(d) * .7) * eOut(P(t, s('verbos').t0, .3)) * (1 - eIn(P(t, s('verbos').t1 - .25, .25)));
      el.style.opacity = a.toFixed(3); el.style.filter = `blur(${(Math.abs(d) * 2.5).toFixed(1)}px)`; el.style.color = Math.abs(d) < .5 ? '#F2F4F6' : '#C0C6CC'; el.style.display = a < .01 ? 'none' : 'block'; } }

  // ── 10 fecho: chips em camadas de profundidade
  objs.life.forEach((g, i) => { const b = g.userData.base; const e = eOut(P(t, s('fecho').t0 + .1 + i * .15, .6)); const out = eIn(P(t, s('fecho').t1 - .3, .3));
    g.position.set(b.x + Math.sin(t * .7 + i) * .12, b.y + Math.cos(t * .6 + i) * .1 + (1 - e) * .4, b.z); g.scale.setScalar(e * (1 - out)); g.visible = e * (1 - out) > .01;
    g.lookAt(camera.position); });

  // ── 12 logo: 4 peças se encaixam, reflexo passa
  { const t0 = s('logo').t0 + .1; const off = [V(-1.4, 0, .6), V(0, 1.2, .8), V(0, -1.3, .8), V(1.4, 0, .6)];
    objs.lp.forEach((g, i) => { const sp = spring(t - (t0 + i * .1), .8, 12); g.position.copy(off[i].clone().multiplyScalar(1 - sp)); g.rotation.y = (1 - sp) * (i % 2 ? .6 : -.6); g.visible = t > t0 + i * .1 - .02; });
    objs.logo.rotation.y = Math.sin(t * .8) * .12; objs.logo.rotation.x = -.05;
    const sw = P(t, t0 + .7, 1.1); sweep.intensity = t > t0 + .7 && t < t0 + 1.8 ? 18 * Math.sin(sw * Math.PI) : 0; sweep.position.set(X.logo + lerp(-2.2, 2.2, eIO(sw)), 2.2, 1.4); }

  // ── texto
  words('a1', t, -1, wt('hook', 'sua') - .25); words('a2', t, wt('hook', 'sua') - .05, s('hook').t1 - .25);
  const tv = [0, 1, 2].map((i) => wt('trinca', 'você', i)); words('b1', t, tv[0] - .05, tv[1] - .3); words('b2', t, tv[1] - .05, tv[2] - .3); words('b3', t, tv[2] - .05, s('trinca').t1 - .25);
  words('c1', t, s('gargalo').v0 - .05, wt('gargalo', 'é', 1) - .3); words('c2', t, wt('gargalo', 'é', 1) - .05, s('gargalo').t1 - .55, 60);
  words('d1', t, wt('agora', 'agora,') - .06, s('agora').t1 - .25, 70); words('d2', t, wt('agora', 'quem') - .05, s('agora').t1 - .25);
  words('e1', t, s('fluxo').t0 + .05, s('fluxo').t1 - .25);
  words('f1', t, s('metodo').t0 + .05, s('metodo').t1 - .25);
  words('g1', t, s('auto').v0, s('auto').t1 - .25);
  const td = ['segunda.', 'quarta.', 'sexta.'].map((w) => wt('dias', w)); words('h1', t, td[0] - .05, td[1] - .2); words('h2', t, td[1] - .05, td[2] - .2); words('h3', t, td[2] - .05, s('dias').t1 - .2);
  fade('seal', t, s('dias').t0 + .2, s('dias').t1 - .2);
  words('j1', t, s('fecho').v0 - .05, wt('fecho', 'o') - .3); words('j2', t, wt('fecho', 'o') - .05, s('fecho').t1 - .25);
  words('k1', t, s('loop').v0 - .05, wt('loop', 'agora') - .3); words('k2', t, wt('loop', 'agora') - .05, s('loop').t1 - .2);
  fade('tech', t, s('logo').t0 + .65, null, 16); fade('cta', t, wt('logo', 'envie') - .15, null, 40);
  const pu = Math.sin(Math.PI * P(t, wt('logo', 'comercial'), .4)); $('ctaKey').style.transform = `scale(${(1 + .08 * pu).toFixed(3)})`;
  $('sheenCta').style.left = lerp(-200, 900, eIO(P(t, wt('logo', 'direct.'), .6))) + 'px';
  // desfoque de movimento nas viagens rápidas de câmera
  let blur = 0; KEYS.forEach((k, i) => { if (i < KEYS.length - 1 && k !== 'gargalo') { const c = s(k).t1; blur = Math.max(blur, Math.max(0, 1 - Math.abs(t - c) / (TRANS / 2)) * 5); } });
  canvas.style.filter = blur > .2 ? `blur(${blur.toFixed(1)}px)` : '';

  renderer.render(scene, camera);
}

window.renderAt = (t) => render(t);
window.DUR = DUR;
document.fonts.ready.then(() => Promise.all(['600 40px Sora', '700 40px Sora', '800 40px Sora', '500 20px Manrope', '600 20px Manrope', '700 20px Manrope'].map((f) => document.fonts.load(f))))
  .then(() => { TX.forEach((t) => { const {c, draw} = t.userData; c.width = c.width; const g = c.getContext('2d'); // reinicia o estado do contexto (alinhamento, fonte)
 draw(g, c.width, c.height); t.needsUpdate = true; }); render(0); window.__ready = true; });
