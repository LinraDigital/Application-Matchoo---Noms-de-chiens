/**
 * Requêtes sur la base des noms de chiens embarquée (lecture seule).
 * Les favoris et swipes sont stockés à part (userdb.ts) et référencés par NOM :
 * les id peuvent changer si la base est régénérée, les noms non.
 */
import type { SQLiteDatabase } from 'expo-sqlite';

import type { Filtres, Nom } from './types';

/** Incrémenter à chaque nouvelle version de assets/noms.db : l'app recopiera la base. */
export const NOMS_DB = 'noms-v1.db';

function construireFiltre(f: Filtres) {
  // Toujours : pas de ponctuation exotique (parenthèses, guillemets, points...) ni de noms à rallonge.
  const cond: string[] = ["name NOT GLOB '*[^A-Za-z -]*'", 'word_count <= 3'];
  const params: (string | number)[] = [];

  if (f.longueur === 'court') cond.push('length(name) <= 4');
  if (f.longueur === 'moyen') cond.push('length(name) BETWEEN 5 AND 7');
  if (f.longueur === 'long') cond.push('length(name) >= 8');

  if (f.mots === 'simple') cond.push('word_count = 1');
  if (f.mots === 'compose') cond.push('word_count >= 2');

  if (f.initiale) {
    cond.push('letter = ?');
    params.push(f.initiale);
  }
  return { cond, params };
}

export function tirerNoms(db: SQLiteDatabase, f: Filtres, exclus: string[], n = 20): Promise<Nom[]> {
  const { cond, params } = construireFiltre(f);
  cond.push('name NOT IN (SELECT value FROM json_each(?))');
  params.push(JSON.stringify(exclus));
  return db.getAllAsync<Nom>(`SELECT * FROM names WHERE ${cond.join(' AND ')} ORDER BY random() LIMIT ?`, [
    ...params,
    n,
  ]);
}

export async function compterNoms(db: SQLiteDatabase, f: Filtres): Promise<number> {
  const { cond, params } = construireFiltre(f);
  const r = await db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM names WHERE ${cond.join(' AND ')}`, params);
  return r?.n ?? 0;
}

export function getNomParNom(db: SQLiteDatabase, nom: string) {
  return db.getFirstAsync<Nom>('SELECT * FROM names WHERE name = ?', [nom]);
}

export function getNomsParNoms(db: SQLiteDatabase, noms: string[]) {
  return db.getAllAsync<Nom>('SELECT * FROM names WHERE name IN (SELECT value FROM json_each(?))', [
    JSON.stringify(noms),
  ]);
}
