import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { colors } from '@/constants/theme';
import { useAuth } from '@/lib/auth';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const verify = useAuth((s) => s.verify);

  useEffect(() => {
    (async () => {
      await verify();
      SplashScreen.hideAsync().catch(() => {});
    })();
  }, [verify]);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.bg },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: '700' },
            contentStyle: { backgroundColor: colors.bg },
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="contact/[id]" options={{ title: 'Contact' }} />
          <Stack.Screen name="contact/edit" options={{ title: 'Edit', presentation: 'modal' }} />
        </Stack>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
