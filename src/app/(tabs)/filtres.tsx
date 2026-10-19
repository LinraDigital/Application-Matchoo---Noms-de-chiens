import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Bouton, Segment, Titre } from '@/components/ui';
import { compterNoms } from '@/lib/noms';
import { useStore } from '@/lib/store';
import { C, F, formatNombre } from '@/lib/theme';
import type { Longueur, Mots } from '@/lib/types';

const LETTRES = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function Filtres() {
  const db = useSQLiteContext();
  const { filtres, setFiltres, revoirPasses } = useStore();
  const [nombre, setNombre] = useState<number | null>(null);

  const cle = JSON.stringify(filtres);
  useEffect(() => {
    compterNoms(db, filtres).then(setNombre);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cle]);

  return (
    <SafeAreaView style={s.ecran} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 12, gap: 22 }} keyboardShouldPersistTaps="handled">
        <View>
          <Titre>Vos envies</Titre>
          <Text style={s.sous}>
            {nombre == null ? ' ' : `${formatNombre(nombre)} noms correspondent, disponibles hors ligne.`}
          </Text>
        </View>

        <View style={s.bloc}>
          <Text style={s.label}>Longueur</Text>
          <Segment<Longueur>
            valeur={filtres.longueur}
            onChange={(longueur) => setFiltres({ ...filtres, longueur })}
            options={[
              { valeur: 'court', label: 'Court' },
              { valeur: 'moyen', label: 'Moyen' },
              { valeur: 'long', label: 'Long' },
              { valeur: 'tous', label: 'Tous' },
            ]}
          />
        </View>

        <View style={s.bloc}>
          <Text style={s.label}>Style</Text>
          <Segment<Mots>
            valeur={filtres.mots}
            onChange={(mots) => setFiltres({ ...filtres, mots })}
            options={[
              { valeur: 'simple', label: 'Un seul mot' },
              { valeur: 'compose', label: 'Composé' },
              { valeur: 'tous', label: 'Tous' },
            ]}
          />
        </View>

        <View style={s.bloc}>
          <Text style={s.label}>Initiale</Text>
          <View style={s.lettres}>
            <Pressable
              onPress={() => setFiltres({ ...filtres, initiale: null })}
              style={[s.lettre, s.lettreToutes, !filtres.initiale && s.lettreActive]}>
              <Text style={[s.lettreTxt, !filtres.initiale && { color: '#fff' }]}>Toutes</Text>
            </Pressable>
            {LETTRES.map((l) => {
              const actif = filtres.initiale === l;
              return (
                <Pressable
                  key={l}
                  onPress={() => setFiltres({ ...filtres, initiale: actif ? null : l })}
                  style={[s.lettre, actif && s.lettreActive]}
                  accessibilityLabel={`Initiale ${l}`}>
                  <Text style={[s.lettreTxt, actif && { color: '#fff' }]}>{l}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={s.bloc}>
          <Text style={s.label}>
            Votre nom de famille <Text style={{ fontFamily: F.texte, color: C.discret }}>(facultatif)</Text>
          </Text>
          <TextInput
            value={filtres.nomFamille}
            onChangeText={(nomFamille) => setFiltres({ ...filtres, nomFamille })}
            placeholder="Ex. Martin"
            placeholderTextColor={C.discret}
            style={s.input}
            autoCapitalize="words"
            accessibilityLabel="Votre nom de famille"
          />
          <Text style={s.aide}>Chaque carte affichera « Nom + nom de famille » pour tester la sonorité.</Text>
        </View>

        <Bouton label="Commencer à swiper" onPress={() => router.navigate('/')} />
        <Bouton
          label="Revoir les noms passés"
          variante="contour"
          onPress={() =>
            Alert.alert('Revoir les noms passés ?', 'Les noms écartés reviendront dans le tirage. Vos favoris sont conservés.', [
              { text: 'Annuler', style: 'cancel' },
              { text: 'Revoir', onPress: revoirPasses },
            ])
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: C.bg },
  sous: { fontFamily: F.texte, fontSize: 14, color: C.discret, marginTop: 4 },
  bloc: { gap: 10 },
  label: { fontFamily: F.texteBold, fontSize: 14, color: C.encre },
  lettres: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  lettre: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lettreToutes: { width: 94 },
  lettreActive: { backgroundColor: C.nuit },
  lettreTxt: { fontFamily: F.texteBold, fontSize: 15, color: C.encre2 },
  input: {
    height: 50,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: C.trait,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    fontFamily: F.texte,
    fontSize: 16,
    color: C.encre,
  },
  aide: { fontFamily: F.texte, fontSize: 13, color: C.discret },
});
