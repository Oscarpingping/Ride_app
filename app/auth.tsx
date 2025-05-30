import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from './context/AuthContext';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login, register } = useAuth();

  const handleSubmit = async () => {
    try {
      setError('');
      if (isLogin) {
        await login({ email, password });
      } else {
        await register({ email, password, name });
      }
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.surface}>
          <Text variant="headlineMedium" style={styles.title}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </Text>
          
          {!isLogin && (
            <TextInput
              label="Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
              mode="outlined"
            />
          )}
          
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            mode="outlined"
            secureTextEntry
          />
          
          {error ? <Text style={styles.error}>{error}</Text> : null}
          
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </Button>

          {isLogin && (
            <View style={styles.registerPrompt}>
              <Text variant="bodyMedium" style={styles.registerText}>
                New to WildPals?
              </Text>
              <Button
                mode="text"
                onPress={() => setIsLogin(false)}
                style={styles.registerButton}
              >
                Create an account
              </Button>
            </View>
          )}

          {!isLogin && (
            <Button
              mode="text"
              onPress={() => setIsLogin(true)}
              style={styles.switchButton}
            >
              Already have an account? Login
            </Button>
          )}
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  surface: {
    padding: 20,
    borderRadius: 10,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  error: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  registerPrompt: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerText: {
    marginBottom: 8,
    color: '#666',
  },
  registerButton: {
    marginTop: 4,
  },
  switchButton: {
    marginTop: 16,
  },
}); 