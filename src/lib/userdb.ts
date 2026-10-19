/**
 * Données de l'utilisateur, 100 % hors ligne, dans une base séparée :
 * remplacer noms.db lors d'une mise à jour ne touche jamais aux favoris.
 */
import { openDatabaseSync } from 'expo-sqlite';

import { FILTRES_DEFAUT, type Filtres } from './types';

export const userDb = openDatabaseSync('matchoo-chiens-user.db');

userDb.execSync(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS favoris (nom TEXT PRIMARY KEY, ajoute_le INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS swipes  (nom TEXT PRIMARY KEY, aime INTEGER NOT NULL, le INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS reglages (cle TEXT PRIMARY KEY, valeur TEXT NOT NULL);
`);

export function lireFavoris(): string[] {
  return userDb
    .getAllSync<{ nom: string }>('SELECT nom FROM favoris ORDER BY ajoute_le DESC')
    .map((r) => r.nom);
}

export function ajouterFavori(nom: string) {
  userDb.runSync('INSERT OR REPLACE INTO favoris (nom, ajoute_le) VALUES (?, ?)', [nom, Date.now()]);
}

export function retirerFavori(nom: string) {
  userDb.runSync('DELETE FROM favoris WHERE nom = ?', [nom]);
}

export function lireSwipes(): string[] {
  return userDb.getAllSync<{ nom: string }>('SELECT nom FROM swipes').map((r) => r.nom);
}

export function enregistrerSwipe(nom: string, aime: boolean) {
  userDb.runSync('INSERT OR REPLACE INTO swipes (nom, aime, le) VALUES (?, ?, ?)', [
    nom,
    aime ? 1 : 0,
    Date.now(),
  ]);
}

export function supprimerSwipe(nom: string) {
  userDb.runSync('DELETE FROM swipes WHERE nom = ?', [nom]);
}

/** Remet en jeu les noms passés (les favoris restent exclus du tirage). */
export function oublierPasses() {
  userDb.runSync('DELETE FROM swipes WHERE aime = 0');
}

export function lireFiltres(): Filtres {
  const r = userDb.getFirstSync<{ valeur: string }>("SELECT valeur FROM reglages WHERE cle = 'filtres'");
  if (!r) return FILTRES_DEFAUT;
  try {
    return { ...FILTRES_DEFAUT, ...JSON.parse(r.valeur) };
  } catch {
    return FILTRES_DEFAUT;
  }
}

export function enregistrerFiltres(f: Filtres) {
  userDb.runSync("INSERT OR REPLACE INTO reglages (cle, valeur) VALUES ('filtres', ?)", [JSON.stringify(f)]);
}

