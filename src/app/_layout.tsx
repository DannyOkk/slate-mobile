import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { SlateColors } from "@/constants/theme";
import { AuthProvider } from "@/context/AuthContext";
import { setupAndroidNotificationChannel } from "@/services/notificationService";

SplashScreen.preventAutoHideAsync();

const SlateTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: SlateColors.background,
    card: SlateColors.background,
    border: SlateColors.border,
    notification: SlateColors.primarySoft,
  },
};

export default function RootLayout() {
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(SlateColors.background).catch((error) => {
      console.warn(
        "[RootLayout] No se pudo establecer el fondo nativo:",
        error,
      );
    });
    setupAndroidNotificationChannel();
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider value={SlateTheme}>
        <AnimatedSplashOverlay />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: SlateColors.background },
            animation: "fade",
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="client-detail" />
          <Stack.Screen name="settings" />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}
