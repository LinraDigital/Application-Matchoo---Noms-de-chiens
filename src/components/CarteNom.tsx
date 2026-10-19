import { useImperativeHandle, type Ref } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { C, F, formatLettres } from '@/lib/theme';
import type { Nom } from '@/lib/types';

import { Patte } from './Icones';

export type CarteHandle = { lancer: (aime: boolean) => void };

type Props = {
  nom: Nom;
  nomFamille: string;
  actif: boolean;
  onSwipe: (aime: boolean) => void;
  ref?: Ref<CarteHandle>;
};

export function CarteNom({ nom, nomFamille, actif, onSwipe, ref }: Props) {
  const { width } = useWindowDimensions();
  const x = useSharedValue(0);
  const y = useSharedValue(0);

  const lancer = (aime: boolean) => {
    x.value = withTiming((aime ? 1 : -1) * width * 1.5, { duration: 240 }, (fini) => {
      if (fini) scheduleOnRN(onSwipe, aime);
    });
  };
  useImperativeHandle(ref, () => ({ lancer }));

  const pan = Gesture.Pan()
    .enabled(actif)
    .onUpdate((e) => {
      x.value = e.translationX;
      y.value = e.translationY * 0.4;
    })
    .onEnd((e) => {
      const seuil = width * 0.28;
      if (Math.abs(x.value) > seuil || Math.abs(e.velocityX) > 900) {
        const dir = Math.sign(x.value || e.velocityX);
        x.value = withTiming(dir * width * 1.5, { duration: 220 }, (fini) => {
          if (fini) scheduleOnRN(onSwipe, dir > 0);
        });
        y.value = withTiming(y.value + e.velocityY * 0.1, { duration: 220 });
      } else {
        x.value = withSpring(0);
        y.value = withSpring(0);
      }
    });

  const styleCarte = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { rotate: `${interpolate(x.value, [-width, width], [-14, 14])}deg` },
    ],
  }));
  const styleOui = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [20, width * 0.25], [0, 1], Extrapolation.CLAMP),
  }));
  const styleNon = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [-width * 0.25, -20], [1, 0], Extrapolation.CLAMP),
  }));

  const taillePolice = nom.name.length > 14 ? 38 : nom.name.length > 9 ? 52 : 70;
  const lettres = nom.name.replace(/[^A-Za-z]/g, '').length;

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[s.carte, styleCarte]}>
        <Animated.View style={[s.tampon, s.tamponOui, styleOui]}>
          <Text style={[s.tamponTxt, { color: C.vert }]}>J’AIME</Text>
        </Animated.View>
        <Animated.View style={[s.tampon, s.tamponNon, styleNon]}>
          <Text style={[s.tamponTxt, { color: C.bleu }]}>BOF</Text>
        </Animated.View>

        <View style={s.centre}>
          <View style={s.medaillon}>
            <Patte couleur={C.accent} taille={44} />
          </View>
          <Text style={[s.nom, { fontSize: taillePolice }]} numberOfLines={2} adjustsFontSizeToFit>
            {nom.name}
          </Text>
          {nomFamille ? (
            <Text style={s.nomComplet}>
              {nom.name} {nomFamille}
            </Text>
          ) : null}
        </View>

        <View style={s.infos}>
          <View style={s.info}>
            <Text style={s.infoLabel}>Initiale</Text>
            <Text style={s.infoValeur}>{nom.letter}</Text>
          </View>
          <View style={s.info}>
            <Text style={s.infoLabel}>Longueur</Text>
            <Text style={s.infoValeur}>{formatLettres(lettres)}</Text>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const s = StyleSheet.create({
  carte: {
    ...StyleSheet.absoluteFill,
    backgroundColor: C.carte,
    borderRadius: 28,
    padding: 24,
    shadowColor: C.nuit,
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  medaillon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFE9CC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  nom: { fontFamily: F.titre, color: C.encre, letterSpacing: -2, textAlign: 'center' },
  nomComplet: { fontFamily: F.texteMedium, fontSize: 16, color: C.discret },
  infos: { flexDirection: 'row', gap: 10 },
  info: { flex: 1, backgroundColor: C.bg, borderRadius: 16, padding: 12 },
  infoLabel: { fontFamily: F.texte, fontSize: 12, color: C.discret },
  infoValeur: { fontFamily: F.texteBold, fontSize: 15, color: C.encre, marginTop: 2 },
  tampon: {
    position: 'absolute',
    top: 28,
    zIndex: 2,
    borderWidth: 3,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  tamponOui: { right: 24, borderColor: C.vert, transform: [{ rotate: '12deg' }] },
  tamponNon: { left: 24, borderColor: C.bleu, transform: [{ rotate: '-12deg' }] },
  tamponTxt: { fontFamily: F.titre, fontSize: 26, letterSpacing: 1 },
});
