/**
 * Assets reais. null = MARCADOR "PENDENTE" visível na versão de revisão.
 * Telas: capturas do app local com dados fictícios (manual §01.6), 2880 px de largura.
 * Fotografias: licenciadas (ex.: Pexels via link), sem dados pessoais.
 */
type Slot = {src: string | null; desc: string};

export const SCREENS: Record<string, Slot> = {
  mlClientes: {src: null, desc: 'Maternidade Legal · Clientes (lista/acompanhamento de clientes)'},
  mlProtocolo: {src: null, desc: 'Maternidade Legal · Protocolo (etapas do caso)'},
  mlDashboard: {src: null, desc: 'Maternidade Legal · Dashboard Executivo'},
  pgDashboard: {src: null, desc: 'Previdenciário Geral · Dashboard Executivo'},
  pgAdministrativo: {src: null, desc: 'Previdenciário Geral · Administrativo'},
  pgJudicial: {src: null, desc: 'Previdenciário Geral · Judicial'},
  pgPrazos: {src: null, desc: 'Previdenciário Geral · Prazos Processuais'},
};

export const PHOTOS: Record<string, Slot> = {
  s01: {src: null, desc: 'Escritório jurídico moderno: dois conjuntos de documentos na mesa, profissional ao fundo no computador (35 mm, 30° acima)'},
  s02a: {src: null, desc: 'Advogado consultando documentos e notebook (sobre o ombro, 45°)'},
  s02b: {src: null, desc: 'Profissional verificando tarefas em uma agenda (plano superior, 65°)'},
  s02c: {src: null, desc: 'Equipe administrativa revisando informações (plano médio lateral, 35°)'},
  s04: {src: null, desc: 'Advogada em reunião revisando documentos (50 mm, plano médio lateral)'},
  s07: {src: null, desc: 'Equipe jurídica analisando andamento de casos (35 mm, luz lateral)'},
  s08: {src: null, desc: 'Profissional jurídico no notebook conversando com colega (50 mm)'},
};

export const AUDIO = {
  narration: null as string | null, // ElevenLabs Leo Antonio (ou Guilherme — decisão pendente), eleven_multilingual_v2
  music: null as string | null, // trilha instrumental da série
};
