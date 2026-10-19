/**
 * Comparaison de favoris entre deux téléphones via QR code (aucun serveur).
 * Format : MATCHOO1|<variante>|Nom1|Nom2|...
 * La variante évite de comparer des noms de chiens avec des prénoms de bébé.
 */

const ENTETE = 'MATCHOO1';
/** Au-delà, le QR devient trop dense pour être scanné facilement. Les plus récents passent d'abord. */
export const MAX_NOMS_QR = 80;

/** Type d'appli Matchoo : évite de comparer avec le QR code d'une autre appli de la famille. */
export const variante = 'chiens';

export function encoderFavoris(favoris: string[]): { texte: string; envoyes: number } {
  const noms = favoris.slice(0, MAX_NOMS_QR);
  return { texte: [ENTETE, variante, ...noms].join('|'), envoyes: noms.length };
}

export type Decodage = { ok: true; noms: string[] } | { ok: false; raison: string };

export function decoderFavoris(texte: string): Decodage {
  const [entete, autreVariante, ...noms] = texte.split('|');
  if (entete !== ENTETE) return { ok: false, raison: 'Ce QR code n’est pas un QR code Matchoo.' };
  if (autreVariante !== variante) {
    return { ok: false, raison: 'Ce QR code vient d’une autre application Matchoo (autre type de noms).' };
  }
  const propres = noms.map((n) => n.trim()).filter((n) => n.length > 0 && n.length <= 40);
  return { ok: true, noms: propres.slice(0, 200) };
}

export const enCommun = (miens: string[], autres: string[]) => {
  const set = new Set(autres);
  return miens.filter((n) => set.has(n));
};

