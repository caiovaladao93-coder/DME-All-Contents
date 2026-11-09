// Hierarquia tipográfica (px) — palco 1080x1920.
export const T = {
  display: 112, // palavra de impacto
  title: 88, // título principal (76–94)
  subtitle: 60, // título secundário (48–64)
  ui: 30, // rótulos de interface (24–34)
  caption: 40, // legendas (38–44)
  support: 30, // apoio (26–32)
};

export const FONT_TITLE = 'Sora, sans-serif';
export const FONT_UI = 'Manrope, sans-serif';

export const TITLE_STYLE: React.CSSProperties = {
  fontFamily: FONT_TITLE,
  fontWeight: 700,
  color: '#F4F6F8',
  textTransform: 'uppercase',
  letterSpacing: '-0.01em',
  lineHeight: 1.04,
};
