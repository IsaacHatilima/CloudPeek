/**
 * Root layout. The swipe shell wraps the Stack, so the side menu is mounted
 * once underneath every screen and the Stack itself is the moving surface.
 * The overview (the selected application's environments) is the Stack's first
 * screen; resource lists push over it and an item's detail over those; the
 * scope picker, the connect form, and the action form are sheets and the
 * account screen is a modal, all presented natively above the shell.
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ErrorBoundaryProps } from "expo-router";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "expo-router/react-navigation";
import { Stack } from "expo-router/stack";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { HeaderDoneButton } from "@/features/account/components/header-done-button";
import { StateMessage } from "@/features/resources/components/state-message";
import { ShellLayout } from "@/features/shell";
import { useNavigationPersistence } from "@/features/shell/hooks/use-navigation-persistence";
import { useAppTheme } from "@/theme/use-app-theme";

const ROOT_STYLE = { flex: 1 } as const;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 60_000 },
  },
});

const renderDoneButton = () => <HeaderDoneButton />;

export default function RootLayout() {
  const { colorScheme } = useAppTheme();

  return (
    <GestureHandlerRootView style={ROOT_STYLE}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <ShellLayout>
            <RootNavigator />
          </ShellLayout>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

/** Replaces the whole tree when a render throws; `retry` remounts it. */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const { colors } = useAppTheme();

  return (
    <StateMessage
      action={{ label: "Try again", onPress: () => void retry() }}
      body={error.message}
      colors={colors}
      title="Something went wrong"
    />
  );
}

const SHEET_OPTIONS = {
  gestureEnabled: true,
  presentation: "formSheet",
  sheetGrabberVisible: true,
} as const;

function RootNavigator() {
  const { colorScheme, colors } = useAppTheme();
  useNavigationPersistence();

  return (
    <>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.surfaceBackground },
          // The iOS swipe-back and the open-menu swipe are the same motion;
          // the menu is the primary navigation, so the stack gesture is off.
          gestureEnabled: false,
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="resources/[resource]/index" options={{ animation: "fade" }} />
        <Stack.Screen name="resources/[resource]/[id]" />
        <Stack.Screen name="scope" options={{ ...SHEET_OPTIONS, sheetAllowedDetents: [0.6, 1] }} />
        <Stack.Screen name="action" options={{ ...SHEET_OPTIONS, sheetAllowedDetents: [0.85, 1] }} />
        <Stack.Screen
          name="connect"
          options={{ ...SHEET_OPTIONS, sheetAllowedDetents: [0.7, 1] }}
        />
        <Stack.Screen
          name="account"
          options={{
            gestureEnabled: true,
            headerRight: renderDoneButton,
            headerShadowVisible: false,
            headerShown: true,
            headerStyle: { backgroundColor: colors.surfaceBackground },
            headerTintColor: colors.text,
            presentation: "modal",
            title: "Account",
          }}
        />
      </Stack>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </>
  );
}
