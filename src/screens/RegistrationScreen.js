import React, { useState, useRef, useEffect } from 'react';
import { 
StyleSheet, 
Text, 
View, 
TouchableOpacity, 
ScrollView, 
Alert,
ActivityIndicator,
TextInput,
Animated
} from 'react-native';
import apiService from '../services/apiService';

export default function RegistrationScreen({ onRegistrationSuccess, switchToLogin, handleAutoLogin }) {
const [username, setUsername] = useState('');
const [password, setPassword] = useState('');
const [email, setEmail] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [isRegistering, setIsRegistering] = useState(false);
const [error, setError] = useState(null);
const [registrationStatus, setRegistrationStatus] = useState('idle'); // 'idle', 'pending', 'success', 'error'

// Animation values
const successOpacity = useRef(new Animated.Value(0)).current;
const successScale = useRef(new Animated.Value(0.9)).current;

// Handle registration status changes
useEffect(() => {
  if (registrationStatus === 'success') {
        // Animate the success message
    Animated.parallel([
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(successScale, {
        toValue: 1,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }
}, [registrationStatus]);

const validateForm = () => {
  if (!username || !password || !email || !confirmPassword) {
    setError('All fields are required');
    return false;
  }
  
  if (password !== confirmPassword) {
    setError('Passwords do not match');
    return false;
  }
  
  // Basic email validation
  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(email)) {
    setError('Please enter a valid email address');
    return false;
  }
  
  if (password.length < 8) {
    setError('Password must be at least 8 characters');
    return false;
  }
  
  return true;
};

const handleRegister = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    // Update UI immediately
    setIsRegistering(true);
    setError(null);
    setRegistrationStatus('pending');
    
    const userData = {
      username,
      password,
      email
    };
    
    // Call API
    const response = await apiService.registerUser(userData);
    
    // Safely handle various response types
    setRegistrationStatus('success');
    
  } catch (err) {
    setRegistrationStatus('error');
    
    // Extract error message safely
    let errorMessage = 'Registration failed. Please try again.';
    if (err && err.response && err.response.data && err.response.data.message) {
      errorMessage = err.response.data.message;
    } else if (err && err.message) {
      errorMessage = err.message;
    }
    
    setError(errorMessage);
    Alert.alert('Registration Failed', errorMessage);
  } finally {
    // Only set isRegistering to false if we're not in success state
    // This prevents UI flicker between states
    if (registrationStatus !== 'success') {
      setIsRegistering(false);
    }
  }
};

// Safe callback for alert
const handleSuccessConfirm = () => {
  try {
    if (typeof onRegistrationSuccess === 'function') {
      onRegistrationSuccess();
    }
    
    // Try to auto-login with the credentials
    if (typeof handleAutoLogin === 'function') {
      handleAutoLogin(username, password);
    } else if (typeof switchToLogin === 'function') {
      // Fall back to manual login if auto-login function isn't provided
      switchToLogin();
    }
  } catch (error) {
    // Silent catch to prevent app crashes
    if (typeof switchToLogin === 'function') {
      switchToLogin();
    }
  }
};

return (
  <ScrollView contentContainerStyle={styles.scrollContainer}>
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {/* Success message with animations */}
      {registrationStatus === 'success' && (
        <Animated.View 
          style={[
            styles.successContainer, 
            { 
              opacity: successOpacity,
              transform: [{ scale: successScale }]
            }
          ]}
        >
          <View style={styles.successContent}>
            <View style={styles.successIcon}>
              <Text style={styles.successIconText}>✓</Text>
            </View>
            <View>
              <Text style={styles.successText}>Registration successful!</Text>
              <Text style={styles.successSubtext}>Logging you in automatically...</Text>
            </View>
          </View>
        </Animated.View>
      )}
      
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          editable={!isRegistering && registrationStatus !== 'success'}
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          editable={!isRegistering && registrationStatus !== 'success'}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!isRegistering && registrationStatus !== 'success'}
          autoComplete="off"
          textContentType="oneTimeCode" // Prevents iOS from suggesting passwords
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          editable={!isRegistering && registrationStatus !== 'success'}
          autoComplete="off"
          textContentType="oneTimeCode" // Prevents iOS from suggesting passwords
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        {registrationStatus !== 'success' ? (
          <TouchableOpacity
            style={[
              styles.button, 
              styles.registerButton,
              isRegistering && styles.disabledButton
            ]}
            onPress={handleRegister}
            disabled={isRegistering || registrationStatus === 'success'}
          >
            {isRegistering ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.buttonText}>Registering...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Register</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.successButton]}
            onPress={handleSuccessConfirm}
          >
            <Text style={styles.buttonText}>Go to Home</Text>
          </TouchableOpacity>
        )}
        
        {registrationStatus !== 'success' && (
          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>Already have an account?</Text>
            <TouchableOpacity onPress={switchToLogin}>
              <Text style={styles.switchLink}>Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  </ScrollView>
);
}

const styles = StyleSheet.create({
scrollContainer: {
  flexGrow: 1,
},
container: {
  flex: 1,
  padding: 20,
  backgroundColor: '#f5f5f5',
},
title: {
  fontSize: 24,
  fontWeight: 'bold',
  marginBottom: 20,
  textAlign: 'center',
},
errorContainer: {
  backgroundColor: '#ffeeee',
  padding: 10,
  borderRadius: 5,
  marginBottom: 15,
  borderWidth: 1,
  borderColor: '#ffcccc',
},
errorText: {
  color: '#cc0000',
},
successContainer: {
  backgroundColor: '#f0f9ff',
  padding: 20,
  borderRadius: 10,
  marginBottom: 20,
  borderLeftWidth: 4,
  borderLeftColor: '#38b2ac',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  elevation: 2,
},
successText: {
  color: '#2c7a7b',
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 5,
},
successSubtext: {
  color: '#4a5568',
  fontSize: 14,
},
formContainer: {
  backgroundColor: '#ffffff',
  padding: 20,
  borderRadius: 10,
  width: '100%',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
},
input: {
  backgroundColor: '#f8f8f8',
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 5,
  padding: 12,
  marginBottom: 15,
  fontSize: 16,
},
button: {
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: 5,
  marginVertical: 10,
  alignItems: 'center',
  justifyContent: 'center',
  height: 50,
},
registerButton: {
  backgroundColor: '#4CAF50',
},
disabledButton: {
  backgroundColor: '#a5d6a7', // Lighter green when disabled
  opacity: 0.8,
},
successButton: {
  backgroundColor: '#38b2ac', // Teal color matching the success icon
  marginTop: 5,
},
buttonContent: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
},
buttonText: {
  color: 'white',
  fontSize: 16,
  fontWeight: 'bold',
},
switchContainer: {
  flexDirection: 'row',
  justifyContent: 'center',
  marginTop: 15,
},
switchText: {
  marginRight: 5,
  color: '#666',
},
switchLink: {
  color: '#3f51b5',
  fontWeight: 'bold',
}
});