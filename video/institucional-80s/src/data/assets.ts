/**
 * Arquivos externos do filme. Enquanto um valor for null, a cena usa a ilustração vetorial
 * temporária ou fica sem a faixa de áudio correspondente.
 * Para trocar: coloque o arquivo em public/assets/... e informe o caminho relativo a public/.
 *
 * Vídeos: Pexels (licença Pexels — uso comercial livre, sem atribuição obrigatória).
 * As pessoas ilustram situações e NÃO são apresentadas como equipe ou clientes da DME.
 * Todos foram cortados para 1080x1920 a 30 fps e receberam a mesma correção de cor (azul-aço).
 * As fontes brutas (*-raw.mp4) ficam fora do git. Para regenerar, veja scripts/README-videos.md.
 */
export const ASSETS = {
  images: {
    s01: 'assets/video/s01.mp4' as string | null, // Pexels 30284959 · nome no monitor desfocado por rastreamento
    s02a: 'assets/video/s02a.mp4' as string | null, // Pexels 7477059 · Kampus Production
    s04: 'assets/video/s04.mp4' as string | null, // Pexels 8189159 · Kampus Production
    s06a: 'assets/video/s06a.mp4' as string | null, // Pexels 7706633 · MART PRODUCTION
    s06b: 'assets/video/s06b.mp4' as string | null, // Pexels 5716235 · Artem Podrez
    s06c: 'assets/video/s06c.mp4' as string | null, // Pexels 8348725 · Kampus Production
    s07: 'assets/video/s07.mp4' as string | null, // Pexels 8347697 · Kampus Production
    s08: 'assets/video/s08.mp4' as string | null, // Pexels 8632192 · Kampus Production
  },
  narration: null as string | null, // ex.: 'assets/audio/narracao.wav' (locução humana)
  music: null as string | null, // ex.: 'assets/audio/trilha.wav' (licenciada)
};
