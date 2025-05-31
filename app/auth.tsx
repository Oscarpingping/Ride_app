import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Linking } from 'react-native';
import { Text, TextInput, Button, Surface, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from './context/AuthContext';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, register } = useAuth();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleSubmit = async () => {
    try {
      setError('');
      setIsLoading(true);

      if (!validateEmail(email)) {
        setError('Please enter a valid email address');
        return;
      }

      if (isLogin) {
        if (!validatePassword(password)) {
          setError('Password must be at least 6 characters');
          return;
        }
        await login({ email, password });
      } else {
        if (!name.trim()) {
          setError('Please enter your name');
          return;
        }
        if (!validatePassword(password)) {
          setError('Password must be at least 6 characters');
          return;
        }
        await register({ email, password, name });
      }
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed, please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    // TODO: 实现找回密码功能
    Linking.openURL(`mailto:support@wildpals.com?subject=Password Recovery&body=My email is: ${email}`);
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
              autoCapitalize="none"
              disabled={isLoading}
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
            disabled={isLoading}
          />
          
          {!isForgotPassword && (
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              mode="outlined"
              secureTextEntry
              disabled={isLoading}
            />
          )}
          
          {error ? <HelperText type="error" visible={true}>{error}</HelperText> : null}
          
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
            loading={isLoading}
            disabled={isLoading}
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </Button>

          {isLogin && (
            <View style={styles.actionsContainer}>
              <Button
                mode="text"
                onPress={() => setIsForgotPassword(!isForgotPassword)}
                style={styles.actionButton}
              >
                {isForgotPassword ? 'Back to Sign In' : 'Forgot Password?'}
              </Button>
              {isForgotPassword ? (
                <Button
                  mode="contained-tonal"
                  onPress={handleForgotPassword}
                  style={styles.actionButton}
                >
                  Send Reset Email
                </Button>
              ) : (
                <Button
                  mode="text"
                  onPress={() => setIsLogin(false)}
                  style={styles.actionButton}
                >
                  New User? Sign Up
                </Button>
              )}
            </View>
          )}

          {!isLogin && (
            <Button
              mode="text"
              onPress={() => setIsLogin(true)}
              style={styles.switchButton}
            >
              Already have an account? Sign In
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
  actionsContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
  },
  switchButton: {
    marginTop: 16,
  },
}); 