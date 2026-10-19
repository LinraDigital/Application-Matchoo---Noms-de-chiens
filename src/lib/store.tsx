import { createContext, useContext, useState, type ReactNode } from 'react';

import type { Filtres } from './types';
import * as U from './userdb';

type Store = {
  filtres: Filtres;
  setFiltres: (f: Filtres) => void;
  favoris: string[];
  estFavori: (nom: string) => boolean;
  basculerFavori: (nom: string) => void;
  /** Noms déjà vus (likés ou passés) : exclus du tirage. */
  vus: Set<string>;
  swiper: (nom: string, aime: boolean) => void;
  annulerDernier: () => string | null;
  revoirPasses: () => void;
};

const Ctx = createContext<Store | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [filtres, setFiltresState] = useState(() => U.lireFiltres());
  const [favoris, setFavoris] = useState(() => U.lireFavoris());
  const [vus, setVus] = useState(() => new Set(U.lireSwipes()));
  const [historique, setHistorique] = useState<{ nom: string; aime: boolean }[]>([]);

  const setFiltres = (f: Filtres) => {
    U.enregistrerFiltres(f);
    setFiltresState(f);
  };

  const basculerFavori = (nom: string) => {
    if (favoris.includes(nom)) {
      U.retirerFavori(nom);
      setFavoris(favoris.filter((n) => n !== nom));
    } else {
      U.ajouterFavori(nom);
      setFavoris([nom, ...favoris]);
    }
  };

  const swiper = (nom: string, aime: boolean) => {
    U.enregistrerSwipe(nom, aime);
    if (aime && !favoris.includes(nom)) {
      U.ajouterFavori(nom);
      setFavoris((f) => [nom, ...f]);
    }
    setVus((v) => new Set(v).add(nom));
    setHistorique((h) => [...h.slice(-49), { nom, aime }]);
  };

  const annulerDernier = () => {
    const dernier = historique.at(-1);
    if (!dernier) return null;
    U.supprimerSwipe(dernier.nom);
    if (dernier.aime) {
      U.retirerFavori(dernier.nom);
      setFavoris((f) => f.filter((n) => n !== dernier.nom));
    }
    setVus((v) => {
      const s = new Set(v);
      s.delete(dernier.nom);
      return s;
    });
    setHistorique((h) => h.slice(0, -1));
    return dernier.nom;
  };

  const revoirPasses = () => {
    U.oublierPasses();
    setVus(new Set(U.lireSwipes()));
    setHistorique([]);
  };

  return (
    <Ctx.Provider
      value={{
        filtres,
        setFiltres,
        favoris,
        estFavori: (nom) => favoris.includes(nom),
        basculerFavori,
        vus,
        swiper,
        annulerDernier,
        revoirPasses,
      }}>
      {children}
    </Ctx.Provider>
  );
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore doit être utilisé dans <AppProvider>');
  return s;
}

