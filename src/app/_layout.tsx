// Import par graisse : n'embarque que les polices utilisées.
import { BricolageGrotesque_700Bold } from '@expo-google-fonts/bricolage-grotesque/700Bold';
import { BricolageGrotesque_800ExtraBold } from '@expo-google-fonts/bricolage-grotesque/800ExtraBold';
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { Suspense, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { NOMS_DB } from '@/lib/noms';
import { initialiserPubs } from '@/lib/pubs';
import { AppProvider } from '@/lib/store';
import { C } from '@/lib/theme';

function Chargement() {
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={C.accent} size="large" />
    </View>
  );
}

export default function RootLayout() {
  const [policesOk] = useFonts({
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });
  useEffect(() => {
    initialiserPubs();
  }, []);

  if (!policesOk) return <Chargement />;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar style="dark" />
      <Suspense fallback={<Chargement />}>
        {/* Au premier lancement, assets/noms.db est copiée sur l'appareil (lecture seule ensuite). */}
        <SQLiteProvider databaseName={NOMS_DB} assetSource={{ assetId: require('../../assets/noms.db') }} useSuspense>
          <AppProvider>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg } }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="comparer" options={{ presentation: 'modal' }} />
            </Stack>
          </AppProvider>
        </SQLiteProvider>
      </Suspense>
    </GestureHandlerRootView>
  );
}
