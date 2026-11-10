export type PlateKey = 'office' | 'meeting' | 'analysis' | 'table' | 'workstation' | 'window';
/**
 * Fotos licenciadas opcionais (public/assets/photography/<arquivo>). Vazio = plano gerado em código.
 * Ex.: office: 'escritorio.jpg'. Pessoas em fotos de banco não podem ser apresentadas como equipe ou clientes da SGC.
 */
export const PHOTOS: Partial<Record<PlateKey, string>> = {};
