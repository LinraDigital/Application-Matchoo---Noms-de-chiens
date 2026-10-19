import type { ColorValue } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

type P = { taille?: number; couleur?: ColorValue; plein?: boolean; epaisseur?: number };

export function Coeur({ taille = 24, couleur = '#000', plein = false, epaisseur = 2 }: P) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24">
      <Path
        d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"
        fill={plein ? couleur : 'none'}
        stroke={couleur}
        strokeWidth={epaisseur}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function Croix({ taille = 24, couleur = '#000', epaisseur = 2.6 }: P) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24">
      <Path d="M6 6l12 12M18 6L6 18" stroke={couleur} strokeWidth={epaisseur} strokeLinecap="round" />
    </Svg>
  );
}

export function Annuler({ taille = 20, couleur = '#000', epaisseur = 2.2 }: P) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24" fill="none">
      <Path d="M9 14L4 9l5-5" stroke={couleur} strokeWidth={epaisseur} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M4 9h10a6 6 0 0 1 0 12h-3" stroke={couleur} strokeWidth={epaisseur} strokeLinecap="round" />
    </Svg>
  );
}

export function Cartes({ taille = 24, couleur = '#000', epaisseur = 2 }: P) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24" fill="none">
      <Rect x={5} y={3} width={14} height={18} rx={3} stroke={couleur} strokeWidth={epaisseur} />
      <Path d="M9 8h6" stroke={couleur} strokeWidth={epaisseur} strokeLinecap="round" />
    </Svg>
  );
}

export function Reglages({ taille = 24, couleur = '#000', epaisseur = 2 }: P) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24" fill="none">
      <Path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12" stroke={couleur} strokeWidth={epaisseur} strokeLinecap="round" />
      <Circle cx={16} cy={6} r={2} stroke={couleur} strokeWidth={epaisseur} />
      <Circle cx={10} cy={12} r={2} stroke={couleur} strokeWidth={epaisseur} />
      <Circle cx={18} cy={18} r={2} stroke={couleur} strokeWidth={epaisseur} />
    </Svg>
  );
}

export function Retour({ taille = 22, couleur = '#000', epaisseur = 2.2 }: P) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24" fill="none">
      <Path d="M15 6l-6 6 6 6" stroke={couleur} strokeWidth={epaisseur} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function Partager({ taille = 20, couleur = '#000', epaisseur = 2 }: P) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"
        stroke={couleur}
        strokeWidth={epaisseur}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function Loupe({ taille = 18, couleur = '#000', epaisseur = 2.2 }: P) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24" fill="none">
      <Circle cx={11} cy={11} r={7} stroke={couleur} strokeWidth={epaisseur} />
      <Path d="M20 20l-4-4" stroke={couleur} strokeWidth={epaisseur} strokeLinecap="round" />
    </Svg>
  );
}

/** Empreinte de patte. */
export function Patte({ taille = 24, couleur = '#000' }: P) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24">
      <Circle cx={6} cy={11} r={2.2} fill={couleur} />
      <Circle cx={10} cy={6.5} r={2.4} fill={couleur} />
      <Circle cx={14.5} cy={6.5} r={2.4} fill={couleur} />
      <Circle cx={18.5} cy={11} r={2.2} fill={couleur} />
      <Path
        d="M12.2 11c-2.6 0-5.2 3.6-5.2 6 0 1.8 1.4 2.6 2.9 2.4 1-.1 1.4-.5 2.3-.5s1.3.4 2.3.5c1.5.2 2.9-.6 2.9-2.4 0-2.4-2.6-6-5.2-6z"
        fill={couleur}
      />
    </Svg>
  );
}