import { Tabs } from 'expo-router';

import { Cartes, Coeur, Reglages } from '@/components/Icones';
import { useStore } from '@/lib/store';
import { C, F } from '@/lib/theme';

export default function TabsLayout() {
  const { favoris } = useStore();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.accent,
        tabBarInactiveTintColor: C.discret,
        tabBarLabelStyle: { fontFamily: F.texteBold, fontSize: 11 },
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: C.trait },
        sceneStyle: { backgroundColor: C.bg },
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Découvrir', tabBarIcon: ({ color }) => <Cartes couleur={color} /> }}
      />
      <Tabs.Screen
        name="favoris"
        options={{
          title: 'Favoris',
          tabBarIcon: ({ color, focused }) => <Coeur couleur={color} plein={focused} />,
          tabBarBadge: favoris.length || undefined,
          tabBarBadgeStyle: { backgroundColor: C.nuit, fontFamily: F.texteBold, fontSize: 11 },
        }}
      />
      <Tabs.Screen
        name="filtres"
        options={{ title: 'Filtres', tabBarIcon: ({ color }) => <Reglages couleur={color} /> }}
      />
    </Tabs>
  );
}
