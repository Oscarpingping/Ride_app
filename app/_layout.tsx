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
import { ClubModalProvider } from './context/ClubModalContext';
import { Colors } from '../constants/Colors';

// 自定义主题
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.light.tint, // 主色调
    secondary: '#4a6b47', // 次要色调
    tertiary: '#6b8a68', // 第三色调
    background: '#f5f5f5', // 背景色
  },
};

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth_index';
    const inWelcomeScreen = segments[0] === 'welcome';
    const inResetPasswordScreen = segments[0] === 'resetPassword';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!isAuthenticated && !inAuthGroup && !inWelcomeScreen && !inResetPasswordScreen) {
      // 未登录且不在认证页面、欢迎页面或密码重置页面，重定向到欢迎页
      router.replace('/welcome');
    } else if (isAuthenticated && (inAuthGroup || inWelcomeScreen || inResetPasswordScreen)) {
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
                <ClubModalProvider>
                  <RootLayoutNav />
                </ClubModalProvider>
              </MessageProvider>
            </ClubProvider>
          </RideProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
