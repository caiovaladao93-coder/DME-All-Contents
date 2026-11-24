// Manual §02: títulos Iowan Old Style → Palatino → Georgia; texto Avenir Next → Avenir → Helvetica Neue.
// Fontes comerciais indisponíveis no ambiente → SUBSTITUTAS LIVRES (registrado na validação):
//   Gelasio (OFL) — métrica compatível com Georgia, último item da cadeia de títulos.
//   Nunito Sans (OFL) — humanista geométrica próxima de Avenir Next.
// Ao receber os arquivos licenciados, troque SERIF/SANS para 'Iowan Old Style' e 'Avenir Next'.
export const SERIF = "'Iowan Old Style', 'Palatino Linotype', Palatino, Gelasio, Georgia, serif";
export const SANS = "'Avenir Next', Avenir, 'Nunito Sans', 'Helvetica Neue', sans-serif"; // vinheta (manual)
export const APOIO = "Fieldwork, 'Nunito Sans', sans-serif"; // apoio e legendas: Fieldwork (PENDENTE) → Nunito Sans provisória

export const T = {
  h1: 96, // títulos principais (72–100)
  h2: 60, // secundários (50–72)
  caption: 42, // legenda (manual: 42 px / 1,18, peso 700)
  label: 22, // rótulo dourado, tracking 0,26em
  headlineOnScreen: 50, // manchete sobre telas
};

// Área segura apresentação 1920×1080 (manual): topo/base 96, laterais 150.
export const SAFE = {top: 96, bottom: 96, side: 150};
