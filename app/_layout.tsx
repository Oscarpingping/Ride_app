import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MessageProvider } from './context/MessageContext';
import { RideProvider } from './context/RideContext';
import { ClubProvider } from './context/ClubContext';

// 自定义主题
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#7c3aed', // 主色调
    secondary: '#a78bfa', // 次要色调
    tertiary: '#c4b5fd', // 第三色调
    background: '#f5f5f5', // 背景色
  },
};

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'authRoot';
    const inWelcomeScreen = segments[0] === 'welcome';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!isAuthenticated && !inAuthGroup && !inWelcomeScreen) {
      // 未登录且不在认证页面或欢迎页面，重定向到欢迎页
      router.replace('/welcome');
    } else if (isAuthenticated && (inAuthGroup || inWelcomeScreen)) {
      // 已登录且在认证页面或欢迎页面，重定向到主页
      router.replace('/(tabs)/home');
    }
  }, [isAuthenticated, segments, isLoading]);

  return <Slot />;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <AuthProvider>
          <RideProvider>
            <ClubProvider>
              <MessageProvider>
                <RootLayoutNav />
              </MessageProvider>
            </ClubProvider>
          </RideProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
