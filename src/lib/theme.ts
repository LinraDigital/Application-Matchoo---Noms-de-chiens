/** Palette « adoption d'animaux » : orange chaud (accent), violet (sélection), fond pêche très clair. */
export const C = {
  bg: '#FFF5E8',
  carte: '#FFFFFF',
  encre: '#251A4D',
  encre2: '#4D4274',
  discret: '#8B82A8',
  trait: '#F6E2C8',
  nuit: '#8E4DE0', // violet : éléments sélectionnés
  accent: '#E8922A', // orange : boutons principaux
  or: '#FFD58A',
  bleu: '#7A3FD0', // violet foncé : textes d'action secondaires
  vert: '#2F9E78',
} as const;

export const F = {
  titre: 'BricolageGrotesque_800ExtraBold',
  titreBold: 'BricolageGrotesque_700Bold',
  texte: 'DMSans_400Regular',
  texteMedium: 'DMSans_500Medium',
  texteBold: 'DMSans_700Bold',
} as const;

export const formatNombre = (n: number) => n.toLocaleString('fr-FR');

/** « 1 lettre », « 5 lettres » : en français, le pluriel commence à 2. */
export const formatLettres = (n: number) => `${n} lettre${n >= 2 ? 's' : ''}`;
