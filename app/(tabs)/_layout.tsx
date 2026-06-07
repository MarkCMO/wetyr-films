import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '@/constants/theme';

// Lightweight emoji tab icons keep the bundle lean (no icon font dependency).
function Icon({ glyph, color }: { glyph: string; color: string }) {
  return <Text style={{ fontSize: 20, color }}>{glyph}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '800' },
        headerShadowVisible: false,
        tabBarStyle: { backgroundColor: colors.panel, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.dim,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Titles', tabBarIcon: ({ color }) => <Icon glyph="🎬" color={color} /> }} />
      <Tabs.Screen name="boxoffice" options={{ title: 'Box Office', tabBarIcon: ({ color }) => <Icon glyph="📊" color={color} /> }} />
      <Tabs.Screen name="briefing" options={{ title: 'Briefing', tabBarIcon: ({ color }) => <Icon glyph="📰" color={color} /> }} />
      <Tabs.Screen name="casting" options={{ title: 'Casting', tabBarIcon: ({ color }) => <Icon glyph="📣" color={color} /> }} />
      <Tabs.Screen name="rolodex" options={{ title: 'Rolodex', tabBarIcon: ({ color }) => <Icon glyph="📇" color={color} /> }} />
    </Tabs>
  );
}
