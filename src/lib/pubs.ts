import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Publicité interstitielle AdMob, toutes les N cartes swipées.
 * Le module est natif : absent d'Expo Go. On le charge donc de façon tolérante,
 * et sans lui l'appli fonctionne simplement sans pubs.
 */
const SWIPES_ENTRE_PUBS = 25;

type Admob = typeof import('react-native-google-mobile-ads');
type Interstitiel = ReturnType<Admob['InterstitialAd']['createForAdRequest']>;

let admob: Admob | null = null;
try {
  admob = require('react-native-google-mobile-ads') as Admob;
} catch {
  admob = null; // Expo Go
}

const config = (Constants.expoConfig?.extra?.admob ?? {}) as {
  interstitielAndroid?: string;
  interstitielIos?: string;
};

/** En développement : toujours les pubs de test (jamais de vraies pubs en dev, risque de blocage du compte). */
function idUniteInterstitielle(): string | null {
  if (!admob) return null;
  if (__DEV__) return admob.TestIds.INTERSTITIAL;
  return (Platform.OS === 'ios' ? config.interstitielIos : config.interstitielAndroid) || null;
}

let pub: Interstitiel | null = null;
let prete = false;
let initialisee = false;
let compteur = 0;

function charger() {
  const id = idUniteInterstitielle();
  if (!admob || !id) return;
  prete = false;
  pub = admob.InterstitialAd.createForAdRequest(id);
  pub.addAdEventListener(admob.AdEventType.LOADED, () => {
    prete = true;
  });
  pub.addAdEventListener(admob.AdEventType.CLOSED, () => charger());
  // En cas d'échec de chargement, on réessaie au prochain palier plutôt qu'en boucle.
  pub.addAdEventListener(admob.AdEventType.ERROR, (erreur) => {
    prete = false;
    console.warn('[pubs] chargement refusé :', erreur?.code, erreur?.message);
  });
  pub.load();
}

/** À appeler une fois au démarrage : consentement (RGPD), puis initialisation du SDK, puis 1re pub. */
export async function initialiserPubs() {
  if (initialisee || !admob || !idUniteInterstitielle()) return;
  initialisee = true;
  try {
    const { canRequestAds } = await admob.AdsConsent.gatherConsent();
    if (!canRequestAds) return;
    await admob.default().initialize();
    charger();
  } catch (e) {
    console.warn('[pubs] initialisation échouée :', e);
    initialisee = false; // on retentera au prochain démarrage
  }
}

/** À appeler après chaque swipe. Affiche la pub tous les SWIPES_ENTRE_PUBS swipes si elle est prête. */
export function compterSwipe() {
  compteur += 1;
  if (compteur < SWIPES_ENTRE_PUBS) return;
  if (!prete || !pub) {
    console.warn('[pubs] palier atteint mais aucune pub prête');
    return;
  }
  compteur = 0;
  prete = false;
  // Petit délai : laisse la carte finir de sortir avant de couvrir l'écran.
  setTimeout(() => {
    pub?.show().catch((e) => {
      console.warn('[pubs] affichage échoué :', e);
      charger();
    });
  }, 350);
}
