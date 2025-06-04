import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, Surface, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { authAPI } from '../services/api';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const router = useRouter();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await authAPI.requestPasswordReset(email);
      
      if (result.success) {
        setIsSuccess(true);
        setMessage('Password reset email sent! Please check your email for further instructions.');
        
        // 如果是测试环境，显示额外的调试信息
        if (__DEV__ && result.resetToken) {
          console.log('🔐 Reset Token (for testing):', result.resetToken);
          console.log('🔗 Reset URL (for testing):', result.resetUrl);
        }
      } else {
        setError(result.error || 'Failed to send password reset email');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Password reset request error:', err);
    } finally {
      setLoading(false);
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
            Forgot Password
          </Text>
          
          {!isSuccess ? (
            <>
              <Text variant="bodyMedium" style={styles.description}>
                Enter your email address and we'll send you a link to reset your password.
              </Text>
              
              <TextInput
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                mode="outlined"
                autoCapitalize="none"
                keyboardType="email-address"
                disabled={loading}
              />
              
              {error ? <HelperText type="error" visible={true}>{error}</HelperText> : null}
              {message ? <HelperText type="info" visible={true}>{message}</HelperText> : null}
              
              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.button}
                loading={loading}
                disabled={loading}
              >
                Send Reset Email
              </Button>
            </>
          ) : (
            <>
              <View style={styles.successContainer}>
                <Text style={styles.successIcon}>✅</Text>
                <Text variant="bodyLarge" style={styles.successMessage}>
                  {message}
                </Text>
                
                {__DEV__ && (
                  <Text variant="bodySmall" style={styles.debugInfo}>
                    Development Mode: Check console for reset link
                  </Text>
                )}
              </View>
            </>
          )}
          
          <Button
            mode="text"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            Back to Login
          </Button>
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
  description: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  backButton: {
    marginTop: 16,
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  successMessage: {
    textAlign: 'center',
    marginBottom: 16,
  },
  debugInfo: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
});