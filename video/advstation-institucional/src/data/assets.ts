import {Screen} from '../components/ProductScreenshot';

/**
 * Capturas REAIS enviadas pelo cliente (app, Escritório Demonstração, dados fictícios).
 * src null = "CAPTURA PENDENTE" visível na revisão. Não há fotografias de pessoas neste filme
 * (decisão do cliente): todo visual é motion design gerado em código + telas reais.
 */
export const SCREENS: Record<string, Screen> = {
  mlDashboard: {src: 'assets/maternidade-legal/dashboard.png', w: 1918, h: 1078, desc: 'Maternidade Legal · Dashboard Executivo'},
  mlClientes: {src: 'assets/maternidade-legal/clientes.png', w: 1915, h: 1075, desc: 'Maternidade Legal · Clientes'},
  mlProtocolo: {src: 'assets/maternidade-legal/protocolo.png', w: 1918, h: 1075, desc: 'Maternidade Legal · Setor de Protocolo'},
  pgDashboard: {src: 'assets/previdenciario-geral/dashboard.png', w: 1918, h: 1078, desc: 'Previdenciário Geral · Dashboard Executivo'},
  pgAdministrativo: {src: 'assets/previdenciario-geral/administrativo.png', w: 1918, h: 1077, desc: 'Previdenciário Geral · Administrativo'},
  // ainda não enviadas (o filme não depende delas nesta versão):
  pgJudicial: {src: null, w: 1918, h: 1078, desc: 'Previdenciário Geral · Judicial'},
  pgPrazos: {src: null, w: 1918, h: 1078, desc: 'Previdenciário Geral · Prazos Processuais'},
};

export const AUDIO = {
  // Voz do comercial de referência (manual, roteiro comercial.json): ElevenLabs "Guilherme"
  // voice_id CS07DI8x8kLXeSktyWLG · eleven_multilingual_v2 · stability 0.6 · similarity_boost 0.8 ·
  // style 0.12 · use_speaker_boost true · speed 0.94 · convert_with_timestamps (áudio + alinhamento).
  narration: null as string | null,
  music: null as string | null,
};
