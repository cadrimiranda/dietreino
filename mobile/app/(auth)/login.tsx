import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';

const STORAGE_KEY = '@email_storage_key';
const REMEMBER_EMAIL_KEY = '@remember_email_key';

const saveEmailPreference = async (shouldRemember: boolean, email?: string) => {
  try {
    await AsyncStorage.setItem(REMEMBER_EMAIL_KEY, shouldRemember.toString());
    if (!shouldRemember) {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } else if (email) {
      await AsyncStorage.setItem(STORAGE_KEY, email);
    }
  } catch (error) {
    console.error('Error saving email preferences:', error);
  }
};

const loadEmailPreference = async () => {
  try {
    const savedRememberEmail = await AsyncStorage.getItem(REMEMBER_EMAIL_KEY);
    const savedEmail = savedRememberEmail === 'true' 
      ? await AsyncStorage.getItem(STORAGE_KEY)
      : null;
    return { shouldRemember: savedRememberEmail === 'true', savedEmail };
  } catch (error) {
    console.error('Error loading email preferences:', error);
    return { shouldRemember: false, savedEmail: null };
  }
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberEmail, setRememberEmail] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initializeEmailPreference = async () => {
      const { shouldRemember, savedEmail } = await loadEmailPreference();
      if (shouldRemember && savedEmail) {
        setEmail(savedEmail);
        setRememberEmail(true);
      }
    };

    initializeEmailPreference();
  }, []);

  const handleEmailChange = async (text: string) => {
    setEmail(text);
    if (text.length > 3 && !isValidEmail(text)) {
      setEmailError('Please enter a valid email address');
      // If email becomes invalid, uncheck the checkbox and remove from storage
      if (rememberEmail) {
        setRememberEmail(false);
        await saveEmailPreference(false);
      }
    } else {
      setEmailError('');
    }
  };

  const handleRememberEmailChange = async (value: boolean) => {
    // Only allow checking if email is valid
    if (value && emailError) {
      Alert.alert('Invalid Email', 'Please enter a valid email address before enabling remember email');
      return;
    }

    setRememberEmail(value);
    await saveEmailPreference(value, email);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      // Save email to AsyncStorage if remember is checked
      if (rememberEmail) {
        await saveEmailPreference(true, email);
      }

      // Login using useAuth hook
      await login(email, password);
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          
          <TextInput
            style={[styles.input, emailError ? styles.inputError : null]}
            placeholder="Email"
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={[styles.checkbox, rememberEmail && styles.checkboxChecked]}
              onPress={() => handleRememberEmailChange(!rememberEmail)}
            >
              {rememberEmail && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>Remember Email</Text>
          </View>
          
          <TouchableOpacity
            style={[styles.button, emailError ? styles.buttonDisabled : null]}
            onPress={handleLogin}
            disabled={!!emailError || isLoading}
            >
              {
                isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={[styles.buttonText, emailError ? styles.buttonTextDisabled : null]}>Log In</Text>
                )
              }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonTextDisabled: {
    opacity: 0.7,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 2,
    marginLeft: 4,
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    alignSelf: 'flex-end',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#666',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
  },
  button: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
