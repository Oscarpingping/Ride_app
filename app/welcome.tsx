import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from './context/AuthContext';

export default function WelcomeScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/home-root');
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Surface style={styles.surface}>
        <Image 
          source={require('../assets/images/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text variant="headlineMedium" style={styles.title}>
          Welcome to WildPals
        </Text>
        <Text style={styles.subtitle}>
          Join the ride, meet new friends, and explore together!
        </Text>
        <Button 
          mode="contained" 
          style={styles.button} 
          onPress={() => router.push('/authRoot')}
        >
          Login
        </Button>
        <Button 
          mode="outlined" 
          style={styles.button} 
          onPress={() => router.push('/authRoot?register=1')}
        >
          Register
        </Button>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  surface: {
    padding: 32,
    borderRadius: 12,
    elevation: 4,
    alignItems: 'center',
    width: '90%',
    maxWidth: 400,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 32,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    marginVertical: 8,
    minWidth: 200,
    borderRadius: 8,
  },
}); 