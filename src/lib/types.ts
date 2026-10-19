/** Une ligne de la table `names` de assets/noms.db. */
export type Nom = {
  id: number;
  name: string;
  letter: string;
  word_count: number;
};

export type Longueur = 'tous' | 'court' | 'moyen' | 'long';
export type Mots = 'tous' | 'simple' | 'compose';

export type Filtres = {
  longueur: Longueur;
  mots: Mots;
  initiale: string | null;
  nomFamille: string; // pour tester la sonorité, ex. « Martin »
};

export const FILTRES_DEFAUT: Filtres = {
  longueur: 'tous',
  mots: 'tous',
  initiale: null,
  nomFamille: '',
};
