/**
 * Arquivos externos do filme. Enquanto um valor for null, a cena usa a ilustração vetorial
 * temporária (fotos) ou fica sem a faixa de áudio correspondente.
 * Para trocar: coloque o arquivo em public/assets/... e informe o caminho relativo a public/.
 * Ex.: images.s01 = 'assets/images/s01-profissional-monitor.jpg'
 */
export const ASSETS = {
  images: {
    // Pexels 30284959 (licença Pexels: uso comercial livre). Logo de terceiros no monitor desfocado por rastreamento
    // (scripts/track.py + scripts/blur.py), cor ajustada para azul-aço. Fonte bruta: public/assets/video/s01-raw.mp4 (fora do git).
    s01: 'assets/video/s01.mp4' as string | null,
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
