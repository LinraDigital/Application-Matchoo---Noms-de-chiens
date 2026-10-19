import { router } from 'expo-router';
import { useRef, useState, useEffect } from 'react';
import { FlatList, Pressable, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Coeur, Loupe, Partager } from '@/components/Icones';
import { Titre } from '@/components/ui';
import { useStore } from '@/lib/store';
import { C, F } from '@/lib/theme';

export default function Favoris() {
  const { favoris, basculerFavori, filtres } = useStore();
  const [recherche, setRecherche] = useState('');

  const q = recherche.trim().toLowerCase();
  const liste = favoris.filter((n) => !q || n.toLowerCase().includes(q));

  // Retrait avec possibilité d'annuler pendant quelques secondes.
  const [retire, setRetire] = useState<string | null>(null);
  const minuteur = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => void (minuteur.current && clearTimeout(minuteur.current)), []);

  const retirer = (nom: string) => {
    if (!favoris.includes(nom)) return; // balayage + tap : on ne retire qu'une fois
    basculerFavori(nom);
    setRetire(nom);
    if (minuteur.current) clearTimeout(minuteur.current);
    minuteur.current = setTimeout(() => setRetire(null), 5000);
  };
  const annulerRetrait = () => {
    if (retire && !favoris.includes(retire)) basculerFavori(retire);
    if (minuteur.current) clearTimeout(minuteur.current);
    setRetire(null);
  };

  const partager = () =>
    Share.share({ message: `Nos noms de chien coup de cœur sur Matchoo :\n${favoris.join(', ')}` });

  return (
    <SafeAreaView style={s.ecran} edges={['top']}>
      <View style={s.entete}>
        <View style={s.ligneTitre}>
          <Titre>Favoris</Titre>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <Pressable onPress={() => router.push('/comparer')} style={s.boutonComparer} accessibilityRole="button">
              <Text style={s.comparerTxt}>Comparer</Text>
            </Pressable>
            {favoris.length > 0 ? (
              <Pressable onPress={partager} style={s.boutonCarre} accessibilityLabel="Partager la liste">
                <Partager couleur={C.nuit} />
              </Pressable>
            ) : null}
          </View>
        </View>
        <View style={s.champ}>
          <Loupe couleur={C.discret} />
          <TextInput
            value={recherche}
            onChangeText={setRecherche}
            placeholder={`Rechercher parmi ${favoris.length} favori${favoris.length > 1 ? 's' : ''}`}
            placeholderTextColor={C.discret}
            style={s.input}
            accessibilityLabel="Rechercher dans les favoris"
          />
        </View>
      </View>

      <FlatList
        data={liste}
        keyExtractor={(n) => n}
        contentContainerStyle={{ padding: 20, paddingTop: 12, gap: 10 }}
        ListEmptyComponent={
          <Text style={s.vide}>
            {favoris.length === 0
              ? 'Aucun favori pour l’instant. Swipez à droite sur un nom pour l’ajouter ici.'
              : 'Aucun favori ne correspond.'}
          </Text>
        }
        renderItem={({ item }) => (
          <ReanimatedSwipeable
            overshootRight={false}
            onSwipeableOpen={() => retirer(item)}
            renderRightActions={() => (
              <View style={s.actionRetirer}>
                <Text style={s.actionRetirerTxt}>Retirer</Text>
              </View>
            )}>
            <View style={s.ligne}>
              <View style={s.initiale}>
                <Text style={s.initialeTxt}>{item.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.nom}>{item}</Text>
                {filtres.nomFamille ? <Text style={s.sous}>{item} {filtres.nomFamille}</Text> : null}
              </View>
              <Pressable onPress={() => retirer(item)} hitSlop={10} accessibilityLabel={`Retirer ${item} des favoris`}>
                <Coeur couleur={C.accent} plein />
              </Pressable>
            </View>
          </ReanimatedSwipeable>
        )}
      />

      {retire ? (
        <View style={s.toast}>
          <Text style={s.toastTxt}>{retire} retiré</Text>
          <Pressable onPress={annulerRetrait} hitSlop={10} accessibilityRole="button">
            <Text style={s.toastAnnuler}>Annuler</Text>
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  boutonComparer: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  comparerTxt: { fontFamily: F.texteBold, fontSize: 14, color: C.bleu },
  actionRetirer: {
    width: 100,
    marginLeft: 10,
    borderRadius: 16,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRetirerTxt: { fontFamily: F.texteBold, fontSize: 14, color: '#fff' },
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: C.encre,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toastTxt: { fontFamily: F.texte, fontSize: 15, color: '#fff' },
  toastAnnuler: { fontFamily: F.texteBold, fontSize: 15, color: '#fff', textDecorationLine: 'underline' },
  ecran: { flex: 1, backgroundColor: C.bg },
  entete: { paddingHorizontal: 20, paddingTop: 12, gap: 14 },
  ligneTitre: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  boutonCarre: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  champ: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 48,
  },
  input: { flex: 1, fontFamily: F.texte, fontSize: 15, color: C.encre },
  ligne: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 12,
    paddingRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  initiale: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE9CC',
  },
  initialeTxt: { fontFamily: F.titre, fontSize: 20, color: C.accent },
  nom: { fontFamily: F.texteBold, fontSize: 17, color: C.encre },
  sous: { fontFamily: F.texte, fontSize: 13, color: C.discret, marginTop: 2 },
  vide: { fontFamily: F.texte, fontSize: 15, color: C.discret, textAlign: 'center', marginTop: 40, lineHeight: 22 },
});
