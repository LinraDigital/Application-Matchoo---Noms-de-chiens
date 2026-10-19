import type { ExpoConfig } from 'expo/config';

/**
 * Matchoo - Noms de chiens.
 * Projet séparé des autres applis Matchoo (copie), avec son propre identifiant.
 */
const ID = 'fr.linradigital.matchoo.chiens';

/**
 * AdMob (compte de Julien, blocs de cette appli à créer). ID d'application (~) = manifeste ; ID de bloc d'annonces (/) = pub interstitielle.
 * En développement (__DEV__), src/lib/pubs.ts utilise toujours les pubs de test de Google, jamais ces blocs.
 */
const ADMOB = {
  androidAppId: 'ca-app-pub-8758882513712192~1546211415',
  iosAppId: 'ca-app-pub-8758882513712192~4384302752',
  interstitielAndroid: 'ca-app-pub-8758882513712192/1629971895',
  interstitielIos: 'ca-app-pub-8758882513712192/4671068203',
};

const config: ExpoConfig = {
  name: 'Matchoo - Noms de chiens',
  slug: 'matchoo-noms-chiens',
  owner: 'linra-digital',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'matchoo-chiens',
  userInterfaceStyle: 'light',
  ios: {
    bundleIdentifier: ID,
    supportsTablet: false,
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#D9E9FB',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
    },
    predictiveBackGestureEnabled: false,
    package: ID,
  },
  web: {
    output: 'single',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#FFFFFF',
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
      },
    ],
    'expo-sqlite',
    [
      'expo-build-properties',
      { android: { enableMinifyInReleaseBuilds: true, enableShrinkResourcesInReleaseBuilds: true } },
    ],
    [
      'react-native-google-mobile-ads',
      {
        androidAppId: ADMOB.androidAppId,
        iosAppId: ADMOB.iosAppId,
        userTrackingUsageDescription:
          'Cet identifiant sert à afficher des publicités plus pertinentes. Vous pouvez refuser.',
      },
    ],
    [
      'expo-camera',
      {
        cameraPermission: 'Matchoo utilise la caméra uniquement pour lire le QR code de votre partenaire.',
        recordAudioAndroid: false,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    admob: {
      interstitielAndroid: ADMOB.interstitielAndroid,
      interstitielIos: ADMOB.interstitielIos,
    },
    eas: { projectId: '17fe1fb3-6730-4965-ba11-145029b84091' },
  },
};

export default config;
