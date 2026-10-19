import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Retour } from '@/components/Icones';
import { Bouton, Segment, Titre } from '@/components/ui';
import { decoderFavoris, encoderFavoris, enCommun, MAX_NOMS_QR } from '@/lib/comparer';
import { useStore } from '@/lib/store';
import { C, F } from '@/lib/theme';

type Mode = 'montrer' | 'scanner';

export default function Comparer() {
  const { favoris } = useStore();
  const { width } = useWindowDimensions();
  const [mode, setMode] = useState<Mode>('montrer');
  const [permission, demanderPermission] = useCameraPermissions();
  const [resultat, setResultat] = useState<{ partenaire: number; communs: string[] } | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [verrou, setVerrou] = useState(false);

  const { texte, envoyes } = encoderFavoris(favoris);
  const tailleQr = Math.min(width - 80, 320);

  const recommencer = () => {
    setResultat(null);
    setErreur(null);
    setVerrou(false);
  };

  const surScan = (r: BarcodeScanningResult) => {
    if (verrou) return;
    setVerrou(true);
    const d = decoderFavoris(r.data);
    if (!d.ok) {
      setErreur(d.raison);
      return;
    }
    setResultat({ partenaire: d.noms.length, communs: enCommun(favoris, d.noms) });
  };

  const changerMode = (m: Mode) => {
    recommencer();
    setMode(m);
  };

  return (
    <SafeAreaView style={s.ecran}>
      <View style={s.entete}>
        <Pressable onPress={() => router.back()} style={s.boutonCarre} accessibilityLabel="Retour">
          <Retour couleur={C.nuit} />
        </Pressable>
        <Titre>Comparer</Titre>
      </View>

      <View style={s.corps}>
        <Segment<Mode>
          valeur={mode}
          onChange={changerMode}
          options={[
            { valeur: 'montrer', label: 'Mon QR code' },
            { valeur: 'scanner', label: 'Scanner' },
          ]}
        />

        {mode === 'montrer' ? (
          favoris.length === 0 ? (
            <Text style={s.info}>Ajoutez d’abord des favoris pour pouvoir les comparer.</Text>
          ) : (
            <View style={s.centre}>
              <View style={s.cadreQr}>
                <QRCode value={texte} size={tailleQr} ecl="L" />
              </View>
              <Text style={s.info}>
                Votre partenaire scanne ce code avec son Matchoo (onglet Scanner). {envoyes} favori
                {envoyes > 1 ? 's' : ''} inclus
                {favoris.length > MAX_NOMS_QR ? ` (les ${MAX_NOMS_QR} plus récents)` : ''}.
              </Text>
            </View>
          )
        ) : resultat ? (
          <View style={{ flex: 1, gap: 12 }}>
            <Text style={s.resume}>
              {resultat.communs.length === 0
                ? 'Aucun nom en commun pour l’instant.'
                : `${resultat.communs.length} nom${resultat.communs.length > 1 ? 's' : ''} en commun`}
            </Text>
            <Text style={s.info}>Sur {resultat.partenaire} favoris reçus de votre partenaire.</Text>
            <FlatList
              data={resultat.communs}
              keyExtractor={(n) => n}
              contentContainerStyle={{ gap: 10 }}
              renderItem={({ item }) => (
                <View style={s.ligne}>
                  <Text style={s.nom}>{item}</Text>
                </View>
              )}
            />
            <Bouton label="Scanner à nouveau" variante="contour" onPress={recommencer} />
          </View>
        ) : erreur ? (
          <View style={s.centre}>
            <Text style={s.info}>{erreur}</Text>
            <Bouton label="Réessayer" onPress={recommencer} />
          </View>
        ) : !permission ? (
          <View style={s.centre} />
        ) : !permission.granted ? (
          <View style={s.centre}>
            <Text style={s.info}>
              {permission.canAskAgain
                ? 'La caméra sert uniquement à lire le QR code de votre partenaire.'
                : 'L’accès à la caméra est refusé. Autorisez-le dans les réglages du téléphone.'}
            </Text>
            {permission.canAskAgain ? <Bouton label="Autoriser la caméra" onPress={demanderPermission} /> : null}
          </View>
        ) : (
          <View style={s.cadreCamera}>
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={surScan}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: C.bg },
  entete: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingTop: 12 },
  boutonCarre: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  corps: { flex: 1, padding: 20, gap: 16 },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  cadreQr: { padding: 16, backgroundColor: '#fff', borderRadius: 20 },
  cadreCamera: { flex: 1, borderRadius: 20, overflow: 'hidden' },
  info: { fontFamily: F.texte, fontSize: 14, color: C.discret, textAlign: 'center' },
  resume: { fontFamily: F.titreBold, fontSize: 22, color: C.encre },
  ligne: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  nom: { fontFamily: F.texteBold, fontSize: 17, color: C.encre },
});
