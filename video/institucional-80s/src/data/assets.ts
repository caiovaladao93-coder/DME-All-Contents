/**
 * Arquivos externos do filme. Enquanto um valor for null, a cena usa a ilustração vetorial
 * temporária (fotos) ou fica sem a faixa de áudio correspondente.
 * Para trocar: coloque o arquivo em public/assets/... e informe o caminho relativo a public/.
 * Ex.: images.s01 = 'assets/images/s01-profissional-monitor.jpg'
 */
export const ASSETS = {
  images: {
    s01: null as string | null, // profissional diante do monitor, close lateral 45°, 50 mm, luz azul de recorte
    s02a: null as string | null, // mesa vista de cima (35°), notebook com planilhas, documentos
    s04: null as string | null, // reunião consultiva, 3–4 pessoas, plano médio lateral 30°, 35 mm
    s06a: null as string | null, // profissional com notebook e headset discreto (atendimento)
    s06b: null as string | null, // sobre o ombro, notebook com etapas comerciais
    s06c: null as string | null, // equipe administrativa analisando uma tela
    s07: null as string | null, // sobre o ombro, profissional observando monitor, luz equilibrada
    s08: null as string | null, // equipe colaborando, imagem mais clara (de preferência a equipe real da DME)
  },
  narration: null as string | null, // ex.: 'assets/audio/narracao.wav' (locução humana)
  music: null as string | null, // ex.: 'assets/audio/trilha.wav' (licenciada)
};
