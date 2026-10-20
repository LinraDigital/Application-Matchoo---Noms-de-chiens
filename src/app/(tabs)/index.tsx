import { Link, router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CarteNom, type CarteHandle } from '@/components/CarteNom';
import { Annuler, Coeur, Croix, Reglages } from '@/components/Icones';
import { Bouton } from '@/components/ui';
import { getNomParNom, tirerNoms } from '@/lib/noms';
import { compterSwipe } from '@/lib/pubs';
import { useStore } from '@/lib/store';
import { C, F } from '@/lib/theme';
import type { Filtres, Nom } from '@/lib/types';

function resumeFiltres(f: Filtres): string[] {
  const r: string[] = [];
  if (f.longueur !== 'tous') r.push({ court: 'Court', moyen: 'Moyen', long: 'Long' }[f.longueur]);
  if (f.mots !== 'tous') r.push(f.mots === 'simple' ? 'Un seul mot' : 'Composé');
  return r;
}

export default function Decouvrir() {
  const db = useSQLiteContext();
  const { filtres, setFiltres, vus, favoris, swiper, annulerDernier, revoirPasses } = useStore();
  const [pile, setPile] = useState<Nom[]>([]);
  const [epuise, setEpuise] = useState(false);
  const [toast, setToast] = useState('');
  const carteRef = useRef<CarteHandle>(null);
  const generation = useRef(0);
  const enCours = useRef(false);

  const remplir = async (base: Nom[], gen: number) => {
    if (enCours.current) return;
    enCours.current = true;
    try {
      const exclus = [...vus, ...favoris, ...base.map((p) => p.name)];
      const nouveaux = await tirerNoms(db, filtres, exclus, 20);
      if (gen !== generation.current) return; // filtres changés entre-temps
      if (nouveaux.length === 0 && base.length === 0) setEpuise(true);
      setPile((p) => [...p, ...nouveaux.filter((n) => !p.some((x) => x.name === n.name))]);
    } finally {
      enCours.current = false;
    }
  };

  // Nouveaux filtres → nouvelle pile (le nom de famille n'influence pas le tirage).
  const { nomFamille: _nf, ...filtresTirage } = filtres;
  const cleFiltres = JSON.stringify(filtresTirage);
  useEffect(() => {
    generation.current += 1;
    enCours.current = false;
    setPile([]);
    setEpuise(false);
    remplir([], generation.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cleFiltres]);

  // Recharge quand il reste peu de cartes.
  useEffect(() => {
    if (pile.length > 0 && pile.length < 5) remplir(pile, generation.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pile.length]);

  const montrerToast = (t: string) => {
    setToast(t);
    setTimeout(() => setToast(''), 1300);
  };

  const onSwipe = (aime: boolean) => {
    const haut = pile[0];
    if (!haut) return;
    swiper(haut.name, aime);
    setPile((p) => p.slice(1));
    compterSwipe();
    if (aime) montrerToast(`${haut.name} ajouté aux favoris`);
  };

  const annuler = async () => {
    const nom = annulerDernier();
    if (!nom) return;
    const p = await getNomParNom(db, nom);
    if (p) setPile((pl) => [p, ...pl.filter((x) => x.name !== nom)]);
    setEpuise(false);
    montrerToast('Annulé');
  };

  return (
    <SafeAreaView style={s.ecran} edges={['top']}>
      <View style={s.entete}>
        <Text style={s.logoTxt}>Découvrir</Text>
        <Link href="/filtres" asChild>
          <Pressable style={s.boutonCarre} accessibilityLabel="Filtres">
            <Reglages couleur={C.nuit} taille={22} />
          </Pressable>
        </Link>
      </View>

      <View style={s.puces}>
        {resumeFiltres(filtres).map((t) => (
          <View key={t} style={s.puce}>
            <Text style={s.puceTxt}>{t}</Text>
          </View>
        ))}
        {filtres.initiale ? (
          <Pressable
            style={[s.puce, s.puceActive]}
            onPress={() => setFiltres({ ...filtres, initiale: null })}
            accessibilityRole="button"
            accessibilityLabel={`Supprimer le filtre « Commence par ${filtres.initiale} »`}>
            <Text style={[s.puceTxt, { color: '#fff' }]}>Commence par {filtres.initiale}</Text>
            <Croix couleur="#fff" taille={12} epaisseur={2.6} />
          </Pressable>
        ) : null}
      </View>

      <View style={s.zone}>
        {pile.length > 0 ? (
          <>
            <View style={[s.fond, { left: 22, right: 22, top: 22, bottom: 0, backgroundColor: '#F6E2C8' }]} />
            <View style={[s.fond, { left: 11, right: 11, top: 11, bottom: 11, backgroundColor: '#FBEBD5' }]} />
            <View style={s.cartes}>
              {pile
                .slice(0, 2)
                .reverse()
                .map((p) => {
                  const actif = p.name === pile[0].name;
                  return (
                    <CarteNom
                      key={p.name}
                      ref={actif ? carteRef : undefined}
                      nom={p}
                      nomFamille={filtres.nomFamille}
                      actif={actif}
                      onSwipe={onSwipe}
                    />
                  );
                })}
            </View>
          </>
        ) : epuise ? (
          <View style={s.vide}>
            <Text style={s.videTitre}>Vous avez tout vu !</Text>
            <Text style={s.videTxt}>Plus aucun nom ne correspond à ces filtres.</Text>
            <Bouton label="Revoir les noms passés" onPress={revoirPasses} />
            <Bouton label="Modifier les filtres" variante="contour" onPress={() => router.push('/filtres')} />
          </View>
        ) : null}
        {toast ? (
          <View style={s.toast} pointerEvents="none">
            <Text style={s.toastTxt}>{toast}</Text>
          </View>
        ) : null}
      </View>

      <View style={s.actions}>
        <Pressable
          style={[s.rond, s.rondGrand]}
          accessibilityLabel="Passer"
          onPress={() => carteRef.current?.lancer(false)}>
          <Croix couleur={C.bleu} taille={28} />
        </Pressable>
        <Pressable style={[s.rond, s.rondPetit]} accessibilityLabel="Annuler" onPress={annuler}>
          <Annuler couleur={C.discret} />
        </Pressable>
        <Pressable
          style={[s.rond, s.rondGrand, { backgroundColor: C.accent }]}
          accessibilityLabel="Ajouter aux favoris"
          onPress={() => carteRef.current?.lancer(true)}>
          <Coeur couleur="#fff" plein taille={28} epaisseur={1.5} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: C.bg },
  entete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  logoTxt: { fontFamily: F.titre, fontSize: 24, letterSpacing: -0.5, color: C.encre },
  boutonCarre: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  puces: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 20, paddingBottom: 14 },
  puce: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  puceActive: { backgroundColor: C.nuit },
  puceTxt: { fontFamily: F.texteMedium, fontSize: 13, color: C.encre2 },
  zone: { flex: 1, marginHorizontal: 20 },
  fond: { position: 'absolute', borderRadius: 28 },
  cartes: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 22 },
  vide: { flex: 1, justifyContent: 'center', gap: 12 },
  videTitre: { fontFamily: F.titre, fontSize: 28, color: C.encre, textAlign: 'center' },
  videTxt: { fontFamily: F.texte, fontSize: 15, color: C.discret, textAlign: 'center', marginBottom: 12 },
  toast: {
    position: 'absolute',
    top: 18,
    alignSelf: 'center',
    backgroundColor: C.encre,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    zIndex: 10,
  },
  toastTxt: { fontFamily: F.texteMedium, fontSize: 13, color: '#fff' },
  actions: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 18, paddingVertical: 16 },
  rond: {
    borderRadius: 999,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.nuit,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  rondGrand: { width: 64, height: 64 },
  rondPetit: { width: 48, height: 48 },
});
