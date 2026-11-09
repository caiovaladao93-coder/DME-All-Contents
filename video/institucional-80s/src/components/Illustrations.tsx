import React from 'react';

/*
 * Ilustrações vetoriais TEMPORÁRIAS que substituem as fotografias do storyboard
 * (bancos de imagem indisponíveis neste ambiente e sem fotos oficiais da DME).
 * Não mostram pessoas: ambientes, objetos e telas, com luz cinematográfica.
 * Troque por fotos reais em data/assets.ts quando houver arquivos licenciados.
 */

const SV: React.FC<{children: React.ReactNode; id: string}> = ({children}) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>{children}</svg>
);

const Bokeh: React.FC<{id: string; pts: Array<[number, number, number, string]>}> = ({id, pts}) => (
  <g filter={`url(#blur-${id})`}>
    {pts.map(([x, y, r, c], i) => <circle key={i} cx={x} cy={y} r={r} fill={c} />)}
  </g>
);

const BlurDef: React.FC<{id: string; s?: number}> = ({id, s = 10}) => (
  <filter id={`blur-${id}`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={s} /></filter>
);

const ScreenUI: React.FC<{x: number; y: number; w: number; h: number; tone?: number}> = ({x, y, w, h, tone = 1}) => (
  <g opacity={0.9 * tone}>
    <rect x={x + w * 0.04} y={y + h * 0.08} width={w * 0.22} height={h * 0.84} rx={8} fill="rgba(255,255,255,.10)" />
    {[0, 1, 2].map((i) => <rect key={i} x={x + w * 0.3} y={y + h * (0.08 + i * 0.29)} width={w * 0.64} height={h * 0.22} rx={8} fill={i === 1 ? 'rgba(160,195,230,.35)' : 'rgba(255,255,255,.12)'} />)}
  </g>
);

/* ---------- CENA 01: escritório noturno, monitor iluminando o ambiente ---------- */
export const OfficeNight: React.FC = () => (
  <SV id="on">
    <defs>
      <linearGradient id="on-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0B1118" /><stop offset="1" stopColor="#05070A" /></linearGradient>
      <radialGradient id="on-spill" cx="0.62" cy="0.52" r="0.55"><stop offset="0" stopColor="rgba(140,180,230,.42)" /><stop offset="1" stopColor="rgba(140,180,230,0)" /></radialGradient>
      <linearGradient id="on-screen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#DCE8F5" /><stop offset=".55" stopColor="#7FA3C8" /><stop offset="1" stopColor="#3A5F86" /></linearGradient>
      <linearGradient id="on-desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#141A22" /><stop offset="1" stopColor="#040506" /></linearGradient>
      <linearGradient id="on-glass" x1="0" x2="1"><stop offset="0" stopColor="rgba(90,130,180,.10)" /><stop offset="1" stopColor="rgba(90,130,180,.02)" /></linearGradient>
      <BlurDef id="on" s={12} />
      <filter id="soft-on"><feGaussianBlur stdDeviation="30" /></filter>
    </defs>
    <rect width={1080} height={1920} fill="url(#on-wall)" />
    {/* painéis de vidro com cidade desfocada */}
    {[0, 1, 2, 3].map((i) => <g key={i}><rect x={-20 + i * 170} y={260} width={160} height={980} fill="url(#on-glass)" /><rect x={-20 + i * 170 + 158} y={260} width={4} height={980} fill="#141C26" /></g>)}
    <Bokeh id="on" pts={[[80, 520, 26, 'rgba(110,150,200,.22)'], [210, 690, 18, 'rgba(110,150,200,.18)'], [330, 460, 34, 'rgba(90,130,190,.16)'], [450, 820, 22, 'rgba(220,190,140,.12)'], [140, 980, 30, 'rgba(110,150,200,.14)'], [560, 600, 16, 'rgba(110,150,200,.2)']]} />
    {/* faixa de luz no teto */}
    <rect x={0} y={170} width={1080} height={3} fill="rgba(200,220,240,.3)" />
    <ellipse cx={540} cy={172} rx={520} ry={40} fill="rgba(140,180,230,.12)" filter="url(#soft-on)" />
    {/* luz do monitor no ambiente */}
    <rect width={1080} height={1920} fill="url(#on-spill)" />
    {/* mesa */}
    <polygon points="0,1290 1080,1250 1080,1920 0,1920" fill="url(#on-desk)" />
    <polygon points="0,1290 1080,1250 1080,1256 0,1296" fill="rgba(180,205,230,.25)" />
    <ellipse cx={760} cy={1330} rx={330} ry={40} fill="rgba(150,185,225,.18)" filter="url(#soft-on)" />
    {/* monitor em perspectiva */}
    <polygon points="500,780 1030,700 1030,1170 500,1150" fill="#0B0F14" />
    <polygon points="515,795 1015,718 1015,1152 515,1136" fill="url(#on-screen)" opacity={0.85} />
    <ScreenUI x={540} y={760} w={440} h={340} tone={0.6} />
    <polygon points="740,1160 820,1160 840,1262 720,1262" fill="#0E1319" />
    {/* teclado */}
    <polygon points="380,1340 860,1318 930,1390 400,1420" fill="#0E131A" stroke="rgba(160,190,225,.12)" />
    {/* recorte de luz azul na lateral */}
    <polygon points="0,300 70,300 300,1300 0,1300" fill="rgba(90,140,200,.06)" />
  </SV>
);

/* ---------- CENA 02A: mesa vista de cima (35°), notebook, papéis ---------- */
export const DeskTop: React.FC = () => (
  <SV id="dt">
    <defs>
      <linearGradient id="dt-desk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1A1F26" /><stop offset="1" stopColor="#07090B" /></linearGradient>
      <radialGradient id="dt-lamp" cx=".7" cy=".3" r=".6"><stop offset="0" stopColor="rgba(150,185,225,.25)" /><stop offset="1" stopColor="rgba(150,185,225,0)" /></radialGradient>
      <linearGradient id="dt-scr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#C9D9EA" /><stop offset="1" stopColor="#5A7FA6" /></linearGradient>
      <filter id="sh-dt"><feDropShadow dx="0" dy="18" stdDeviation="16" floodColor="#000" floodOpacity=".55" /></filter>
    </defs>
    <rect width={1080} height={1920} fill="url(#dt-desk)" />
    {Array.from({length: 14}).map((_, i) => <line key={i} x1={0} y1={140 * i} x2={1080} y2={140 * i + 220} stroke="rgba(255,255,255,.02)" strokeWidth={2} />)}
    <rect width={1080} height={1920} fill="url(#dt-lamp)" />
    {/* papéis espalhados */}
    {[[120, 1180, -9], [300, 1290, 6], [640, 1240, -4], [700, 520, 12], [60, 560, -14]].map(([x, y, r], i) => (
      <g key={i} transform={`rotate(${r} ${x + 160} ${y + 110})`} filter="url(#sh-dt)">
        <rect x={x} y={y} width={320} height={220} rx={6} fill="#D9DEE3" opacity={0.9} />
        {[0, 1, 2, 3, 4].map((k) => <rect key={k} x={x + 26} y={y + 30 + k * 34} width={[240, 200, 260, 170, 220][k]} height={12} rx={6} fill="rgba(40,48,58,.35)" />)}
      </g>
    ))}
    {/* notebook em perspectiva */}
    <g filter="url(#sh-dt)">
      <polygon points="250,700 860,660 900,1060 230,1110" fill="#1A1F25" />
      <polygon points="270,716 842,678 878,1046 252,1094" fill="url(#dt-scr)" opacity={0.9} />
      {Array.from({length: 7}).map((_, r) => <line key={'r' + r} x1={270 + r * 2} y1={760 + r * 48} x2={842 + r * 5} y2={722 + r * 48} stroke="rgba(30,45,62,.35)" strokeWidth={2} />)}
      {Array.from({length: 6}).map((_, c) => <line key={'c' + c} x1={270 + c * 96} y1={716 - c * 6} x2={252 + c * 104} y2={1094 - c * 8} stroke="rgba(30,45,62,.3)" strokeWidth={2} />)}
      <polygon points="230,1110 900,1060 960,1170 200,1230" fill="#22282F" />
    </g>
    {/* caneta */}
    <rect x={760} y={1380} width={240} height={14} rx={7} fill="#2C333B" transform="rotate(-22 880 1387)" />
  </SV>
);

/* ---------- CENA 04: reunião consultiva — mesa, laptop, fluxogramas (2 camadas) ---------- */
export const MeetingBack: React.FC = () => (
  <SV id="mb">
    <defs>
      <linearGradient id="mb-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#101720" /><stop offset="1" stopColor="#07090C" /></linearGradient>
      <linearGradient id="mb-win" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="rgba(170,200,230,.22)" /><stop offset="1" stopColor="rgba(90,130,180,.05)" /></linearGradient>
      <filter id="soft-mb"><feGaussianBlur stdDeviation="26" /></filter>
    </defs>
    <rect width={1080} height={1920} fill="url(#mb-wall)" />
    {[0, 1, 2].map((i) => <rect key={i} x={60 + i * 330} y={240} width={300} height={700} rx={4} fill="url(#mb-win)" />)}
    <ellipse cx={720} cy={420} rx={360} ry={220} fill="rgba(200,215,230,.12)" filter="url(#soft-mb)" />
    {/* luminária pendente */}
    <line x1={540} y1={0} x2={540} y2={300} stroke="#1A222C" strokeWidth={3} />
    <ellipse cx={540} cy={310} rx={150} ry={22} fill="#1B232D" />
    <ellipse cx={540} cy={330} rx={260} ry={60} fill="rgba(200,220,240,.12)" filter="url(#soft-mb)" />
    {/* encostos de cadeiras (sem pessoas) */}
    {[140, 420, 700].map((x, i) => <rect key={i} x={x} y={900} width={240} height={300} rx={60} fill="#0D1116" stroke="rgba(160,190,225,.08)" />)}
  </SV>
);
export const MeetingFront: React.FC = () => (
  <SV id="mf">
    <defs>
      <linearGradient id="mf-table" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1C232C" /><stop offset="1" stopColor="#06080A" /></linearGradient>
      <linearGradient id="mf-scr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#BFD2E6" /><stop offset="1" stopColor="#4F7399" /></linearGradient>
      <filter id="sh-mf"><feDropShadow dx="0" dy="14" stdDeviation="14" floodColor="#000" floodOpacity=".6" /></filter>
    </defs>
    <polygon points="-100,1120 1180,1080 1180,1920 -100,1920" fill="url(#mf-table)" />
    <polygon points="-100,1120 1180,1080 1180,1086 -100,1126" fill="rgba(190,210,230,.25)" />
    {/* papéis com fluxograma */}
    {[[90, 1250, -6], [610, 1300, 5]].map(([x, y, r], i) => (
      <g key={i} transform={`rotate(${r} ${x + 180} ${y + 120})`} filter="url(#sh-mf)">
        <rect x={x} y={y} width={360} height={250} rx={6} fill="#DADFE4" />
        <rect x={x + 30} y={y + 40} width={90} height={50} rx={6} fill="none" stroke="#2D3A48" strokeWidth={4} />
        <rect x={x + 210} y={y + 40} width={90} height={50} rx={6} fill="none" stroke="#2D3A48" strokeWidth={4} />
        <rect x={x + 120} y={y + 160} width={110} height={50} rx={6} fill="none" stroke="#264B71" strokeWidth={4} />
        <path d={`M${x + 120} ${y + 65} H${x + 210} M${x + 75} ${y + 90} V${y + 185} H${x + 120} M${x + 255} ${y + 90} V${y + 185} H${x + 230}`} stroke="#2D3A48" strokeWidth={3} fill="none" />
      </g>
    ))}
    {/* laptop */}
    <g filter="url(#sh-mf)">
      <polygon points="300,1000 780,980 800,1230 290,1250" fill="#151A20" />
      <polygon points="314,1014 766,995 784,1218 304,1236" fill="url(#mf-scr)" opacity={0.85} />
      <polygon points="290,1250 800,1230 860,1320 240,1345" fill="#232A31" />
    </g>
    {/* xícaras */}
    {[[150, 1560], [900, 1520]].map(([x, y], i) => (
      <g key={i} filter="url(#sh-mf)"><ellipse cx={x} cy={y} rx={60} ry={24} fill="#1A1F25" /><ellipse cx={x} cy={y - 6} rx={46} ry={16} fill="#0B0D10" /></g>
    ))}
  </SV>
);

/* ---------- CENA 06A: atendimento — notebook e headset ---------- */
export const AttendanceDesk: React.FC = () => (
  <SV id="ad">
    <defs>
      <linearGradient id="ad-wall" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#111A24" /><stop offset="1" stopColor="#06080B" /></linearGradient>
      <radialGradient id="ad-light" cx=".3" cy=".35" r=".6"><stop offset="0" stopColor="rgba(150,185,225,.28)" /><stop offset="1" stopColor="rgba(150,185,225,0)" /></radialGradient>
      <filter id="sh-ad"><feDropShadow dx="0" dy="16" stdDeviation="14" floodColor="#000" floodOpacity=".6" /></filter>
    </defs>
    <rect width={1080} height={1920} fill="url(#ad-wall)" />
    <rect width={1080} height={1920} fill="url(#ad-light)" />
    {[0, 1].map((i) => <rect key={i} x={80 + i * 480} y={200} width={420} height={560} fill="rgba(140,175,215,.06)" />)}
    <polygon points="0,1100 1080,1060 1080,1920 0,1920" fill="#0B0E12" />
    <polygon points="0,1100 1080,1060 1080,1066 0,1106" fill="rgba(190,210,230,.22)" />
    <g filter="url(#sh-ad)">
      <polygon points="200,640 820,620 840,1060 190,1080" fill="#151A20" />
      <polygon points="214,656 806,637 824,1046 204,1064" fill="#1D2A38" />
      <polygon points="190,1080 840,1060 920,1160 120,1185" fill="#232A31" />
    </g>
    {/* headset */}
    <g filter="url(#sh-ad)" transform="translate(760 1230)">
      <path d="M0 120 C0 0 220 0 220 120" fill="none" stroke="#2A3139" strokeWidth={22} strokeLinecap="round" />
      <rect x={-26} y={100} width={58} height={96} rx={24} fill="#20262D" /><rect x={188} y={100} width={58} height={96} rx={24} fill="#20262D" />
      <path d="M20 190 C40 250 110 260 140 240" fill="none" stroke="#2A3139" strokeWidth={8} strokeLinecap="round" />
    </g>
  </SV>
);

/* ---------- CENA 06B: comercial — laptop sobre o ombro (tela grande) ---------- */
export const CommercialLaptop: React.FC = () => (
  <SV id="cl">
    <defs>
      <linearGradient id="cl-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0E141B" /><stop offset="1" stopColor="#050607" /></linearGradient>
      <filter id="sh-cl"><feDropShadow dx="0" dy="20" stdDeviation="18" floodColor="#000" floodOpacity=".6" /></filter>
      <filter id="soft-cl"><feGaussianBlur stdDeviation="22" /></filter>
    </defs>
    <rect width={1080} height={1920} fill="url(#cl-bg)" />
    <ellipse cx={540} cy={900} rx={560} ry={420} fill="rgba(120,160,210,.14)" filter="url(#soft-cl)" />
    <g filter="url(#sh-cl)">
      <polygon points="70,560 1010,600 990,1250 90,1270" fill="#12171D" />
      <polygon points="92,582 988,620 970,1230 110,1248" fill="#16212D" />
      <polygon points="90,1270 990,1250 1080,1400 0,1420" fill="#1F252C" />
    </g>
    {/* "ombro" desfocado em primeiro plano: forma abstrata escura (sem pessoa reconhecível) */}
    <ellipse cx={-60} cy={1700} rx={420} ry={300} fill="#050607" filter="url(#soft-cl)" />
  </SV>
);

/* ---------- CENA 06C: gestão — tela grande na parede ---------- */
export const ManagementScreen: React.FC = () => (
  <SV id="ms">
    <defs>
      <linearGradient id="ms-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#121A23" /><stop offset="1" stopColor="#06080A" /></linearGradient>
      <filter id="soft-ms"><feGaussianBlur stdDeviation="30" /></filter>
    </defs>
    <rect width={1080} height={1920} fill="url(#ms-wall)" />
    <ellipse cx={540} cy={880} rx={600} ry={420} fill="rgba(130,170,220,.16)" filter="url(#soft-ms)" />
    <rect x={60} y={560} width={960} height={680} rx={16} fill="#0B0F14" stroke="#1C242E" strokeWidth={6} />
    <rect x={80} y={580} width={920} height={640} rx={8} fill="#121C27" />
    <polygon points="-60,1420 1140,1380 1140,1920 -60,1920" fill="#0A0D10" />
    <polygon points="-60,1420 1140,1380 1140,1386 -60,1426" fill="rgba(190,210,230,.2)" />
    {[180, 470, 760].map((x, i) => <rect key={i} x={x} y={1290} width={160} height={150} rx={40} fill="#0C1015" />)}
  </SV>
);

/* ---------- CENA 07: monitor em ambiente equilibrado ---------- */
export const MonitorCalm: React.FC = () => (
  <SV id="mc">
    <defs>
      <linearGradient id="mc-wall" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#18222D" /><stop offset="1" stopColor="#090C10" /></linearGradient>
      <radialGradient id="mc-win" cx=".85" cy=".2" r=".7"><stop offset="0" stopColor="rgba(210,225,240,.25)" /><stop offset="1" stopColor="rgba(210,225,240,0)" /></radialGradient>
      <linearGradient id="mc-scr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2A3E55" /><stop offset="1" stopColor="#152131" /></linearGradient>
      <filter id="sh-mc"><feDropShadow dx="0" dy="20" stdDeviation="20" floodColor="#000" floodOpacity=".5" /></filter>
    </defs>
    <rect width={1080} height={1920} fill="url(#mc-wall)" />
    <rect width={1080} height={1920} fill="url(#mc-win)" />
    <polygon points="0,1300 1080,1280 1080,1920 0,1920" fill="#0D1115" />
    <polygon points="0,1300 1080,1280 1080,1286 0,1306" fill="rgba(200,215,230,.25)" />
    <g filter="url(#sh-mc)">
      <rect x={150} y={640} width={780} height={500} rx={18} fill="#0C1015" />
      <rect x={166} y={656} width={748} height={468} rx={10} fill="url(#mc-scr)" />
      <ScreenUI x={166} y={656} w={748} h={468} tone={0.8} />
      <polygon points="500,1140 580,1140 600,1290 480,1290" fill="#11161C" />
    </g>
    {/* planta (formas) */}
    <g opacity={0.8}>{[[-30, 0], [20, -10], [60, 10], [-60, 20]].map(([dx, r], i) => <ellipse key={i} cx={980 + dx} cy={1120 - i * 40} rx={22} ry={90} fill="#13201C" transform={`rotate(${r * 2 - 10} ${980 + dx} ${1120 - i * 40})`} />)}
      <rect x={930} y={1180} width={110} height={110} rx={12} fill="#1A1F25" /></g>
  </SV>
);

/* ---------- CENA 08: escritório mais claro, colaborativo (sem pessoas) ---------- */
export const OfficeBright: React.FC = () => (
  <SV id="ob">
    <defs>
      <linearGradient id="ob-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2A3542" /><stop offset="1" stopColor="#10151B" /></linearGradient>
      <linearGradient id="ob-win" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8EA6BF" /><stop offset="1" stopColor="#3D5168" /></linearGradient>
      <filter id="soft-ob"><feGaussianBlur stdDeviation="24" /></filter>
    </defs>
    <rect width={1080} height={1920} fill="url(#ob-wall)" />
    {[0, 1, 2, 3].map((i) => (
      <g key={i}>
        <rect x={40 + i * 255} y={220} width={235} height={820} rx={4} fill="url(#ob-win)" opacity={0.32} />
        {[0, 1, 2].map((k) => <rect key={k} x={40 + i * 255} y={420 + k * 210} width={235} height={4} fill="#1A222C" />)}
        <rect x={40 + i * 255 + 40 + (i % 2) * 60} y={300 + (i % 3) * 90} width={60} height={600 - (i % 3) * 90} fill="rgba(40,55,72,.45)" />
      </g>
    ))}
    <ellipse cx={540} cy={600} rx={600} ry={340} fill="rgba(220,230,240,.1)" filter="url(#soft-ob)" />
    <polygon points="0,1180 1080,1150 1080,1920 0,1920" fill="#151B22" />
    {/* mesas e telas ao fundo */}
    {[[90, 1060], [420, 1040], [750, 1060]].map(([x, y], i) => (
      <g key={i}><rect x={x} y={y} width={240} height={150} rx={10} fill="#1C2733" stroke="rgba(200,215,230,.15)" /><rect x={x + 100} y={y + 150} width={40} height={60} fill="#141B23" /></g>
    ))}
    <rect x={-40} y={1240} width={1160} height={40} rx={10} fill="#202A35" />
    {[160, 480, 800].map((x, i) => <rect key={i} x={x} y={1320} width={160} height={190} rx={50} fill="#121820" />)}
  </SV>
);
