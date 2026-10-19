import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { C, F } from '@/lib/theme';

/** Contrôle segmenté (une seule valeur). */
export function Segment<T extends string>({
  options,
  valeur,
  onChange,
}: {
  options: { valeur: T; label: string }[];
  valeur: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={s.segment}>
      {options.map((o) => {
        const actif = o.valeur === valeur;
        return (
          <Pressable
            key={o.valeur}
            onPress={() => onChange(o.valeur)}
            accessibilityRole="button"
            accessibilityState={{ selected: actif }}
            style={[s.segmentBtn, actif && { backgroundColor: C.nuit }]}>
            <Text style={[s.segmentTxt, actif && { color: '#fff', fontFamily: F.texteBold }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Bouton({
  label,
  onPress,
  variante = 'plein',
  icone,
  style,
}: {
  label: string;
  onPress: () => void;
  variante?: 'plein' | 'contour';
  icone?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const plein = variante === 'plein';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        s.bouton,
        plein ? { backgroundColor: C.accent } : { backgroundColor: '#fff', borderWidth: 2, borderColor: C.trait },
        pressed && { opacity: 0.85 },
        style,
      ]}>
      {icone}
      <Text style={[s.boutonTxt, { color: plein ? '#fff' : C.bleu }]}>{label}</Text>
    </Pressable>
  );
}

export function Titre({ children }: { children: ReactNode }) {
  return <Text style={s.titre}>{children}</Text>;
}

const s = StyleSheet.create({
  segment: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 4, gap: 4 },
  segmentBtn: { flex: 1, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  segmentTxt: { fontFamily: F.texteMedium, fontSize: 14, color: C.encre2 },
  bouton: {
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  boutonTxt: { fontFamily: F.texteBold, fontSize: 16 },
  titre: { fontFamily: F.titre, fontSize: 32, letterSpacing: -1, color: C.encre },
});
