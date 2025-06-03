import { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Surface, HelperText } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from './context/AuthContext';
import { AuthApi } from '../shared/api/auth';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const { login, register } = useAuth();

  useEffect(() => {
    // 检查 URL 参数，设置登录/注册状态
    if (params.register === '1') {
      setIsLogin(false);
    }
  }, [params]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async () => {
    // 如果是忘记密码模式，不执行登录/注册逻辑
    if (isForgotPassword) {
      return;
    }

    try {
      setError('');
      setIsLoading(true);

      if (!validateEmail(email)) {
        setError('Please enter a valid email address');
        return;
      }

      if (isLogin) {
        if (!password) {
          setError('Please enter your password');
          return;
        }
        await login({ email, password });
      } else {
        if (!name.trim()) {
          setError('Please enter your name');
          return;
        }
        if (!password) {
          setError('Please enter a password');
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        await register({ email, password, name });
      }
      router.replace('/(tabs)/home');
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
    
    try {
      setIsLoading(true);
      setError('');
      
      const response = await AuthApi.requestPasswordReset({ email });
      
      if (response.success) {
        Alert.alert(
          'Password Reset Sent',
          'If an account exists with this email, you will receive a password reset link shortly.',
          [
            {
              text: 'OK',
              onPress: () => {
                setIsForgotPassword(false);
                setEmail('');
              }
            }
          ]
        );
      } else {
        setError(response.error || 'Failed to send password reset email');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
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
            {isForgotPassword ? 'Reset Password' : (isLogin ? 'Welcome Back' : 'Create Account')}
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
            <View>
              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                mode="outlined"
                secureTextEntry
                disabled={isLoading}
              />
              {!isLogin && (
                <TextInput
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  style={styles.input}
                  mode="outlined"
                  secureTextEntry
                  disabled={isLoading}
                />
              )}
            </View>
          )}
          
          {error ? <HelperText type="error" visible={true}>{error}</HelperText> : null}
          
          {!isForgotPassword && (
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.button}
              loading={isLoading}
              disabled={isLoading}
            >
              {isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
          )}

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