import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { Redirect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './context/AuthContext';

const FIRST_VISIT_KEY = '@WildPals:firstVisit';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstVisit, setIsFirstVisit] = useState<boolean | null>(null);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    checkFirstVisit();
  }, []);

  const checkFirstVisit = async () => {
    try {
      const value = await AsyncStorage.getItem(FIRST_VISIT_KEY);
      setIsFirstVisit(value === null);
      if (value === null) {
        // 标记为非首次访问
        await AsyncStorage.setItem(FIRST_VISIT_KEY, 'false');
      }
    } catch (error) {
      console.error('Error checking first visit:', error);
      setIsFirstVisit(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 首次访问，导航到欢迎页面
  if (isFirstVisit) {
    return <Redirect href="/welcome" />;
  }

  // 非首次访问，根据登录状态导航
  return <Redirect href={isAuthenticated ? "/(tabs)/home" : "/authRoot"} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
}); 