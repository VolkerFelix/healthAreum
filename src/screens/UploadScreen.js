import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { Accelerometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/apiService';
import { formatAccelerationData, calculateSamplingRate } from '../utils/accelerometerUtils';
import RegistrationScreen from './RegistrationScreen';

const TOKEN_KEY = '@areum_auth_token';

export default function UploadScreen() {
  const [{ x, y, z }, setData] = useState({ x: 0, y: 0, z: 0 });
  const [subscription, setSubscription] = useState(null);
  const [samples, setSamples] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginInProgress, setLoginInProgress] = useState(false);
  const [error, setError] = useState(null);
  const [showRegistration, setShowRegistration] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    checkAuth();
    return () => _unsubscribe();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      setIsAuthenticated(!!token);
    } catch (err) {
      console.error('Auth check error:', err);
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Username and password are required');
      return;
    }

    try {
      setLoginInProgress(true);
      setError(null);
      
      const response = await apiService.loginUser({ username, password });
      
      if (response && response.token) {
        await AsyncStorage.setItem(TOKEN_KEY, response.token);
        setIsAuthenticated(true);
        setUsername('');
        setPassword('');
        Alert.alert('Success', 'Logged in successfully');
      } else {
        setError('Invalid login response');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
      Alert.alert('Login Failed', 'Invalid credentials or server error');
    } finally {
      setLoginInProgress(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      setIsAuthenticated(false);
      Alert.alert('Success', 'Logged out successfully');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const _subscribe = () => {
    setIsRecording(true);
    setSamples([]);
    setError(null);
    
    // Set update interval (milliseconds)
    Accelerometer.setUpdateInterval(100); // 10Hz sampling rate
    
    const subscription = Accelerometer.addListener(accelerometerData => {
      setData(accelerometerData);
      
      // Add timestamp to sample data
      const sampleWithTimestamp = {
        ...accelerometerData,
        timestamp: new Date().toISOString()
      };
      
      // Add to samples array
      setSamples(currentSamples => [...currentSamples, sampleWithTimestamp]);
    });
    
    setSubscription(subscription);
  };

  const _unsubscribe = () => {
    if (subscription) {
      subscription.remove();
      setSubscription(null);
    }
    setIsRecording(false);
  };

  const handleUpload = async () => {
    if (samples.length === 0) {
      Alert.alert('Error', 'No acceleration data to upload. Please record first.');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      
      // Get token from storage
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) {
        setError('Not authenticated');
        Alert.alert('Error', 'You must be logged in to upload data');
        setIsUploading(false);
        return;
      }
      
      // Calculate actual sampling rate
      const samplingRate = calculateSamplingRate(samples) || 10;
      
      // Format data for upload
      const uploadData = formatAccelerationData(samples, samplingRate);
      
      // Upload data
      const response = await apiService.uploadAccelerationData(uploadData, token);
      
      if (response && response.id) {
        Alert.alert('Success', `Data uploaded successfully. ID: ${response.id}`);
        // Clear samples after successful upload
        setSamples([]);
      } else {
        setError('Invalid upload response');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed');
      Alert.alert('Upload Failed', 'Failed to upload acceleration data');
    } finally {
      setIsUploading(false);
    }
  };

  const formatValue = (value) => {
    return value.toFixed(3);
  };

  const handleRegistrationSuccess = () => {
    setShowRegistration(false);
  };

  const switchToLogin = () => {
    setShowRegistration(false);
    setError(null);
  };

  const switchToRegister = () => {
    setShowRegistration(true);
    setError(null);
  };

  // If showing registration screen
  if (!isAuthenticated && showRegistration) {
    return (
      <RegistrationScreen 
        onRegistrationSuccess={handleRegistrationSuccess}
        switchToLogin={switchToLogin}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Areum Accelerometer</Text>
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {!isAuthenticated ? (
          <View style={styles.authContainer}>
            <Text style={styles.authTitle}>Login to Upload Data</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              editable={!loginInProgress}
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loginInProgress}
            />
            
            <TouchableOpacity
              style={[styles.button, styles.loginButton]}
              onPress={handleLogin}
              disabled={loginInProgress}
            >
              {loginInProgress ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>

            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>Don't have an account?</Text>
              <TouchableOpacity onPress={switchToRegister}>
                <Text style={styles.switchLink}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.sensorContainer}>
              <Text style={styles.sensorTitle}>Live Readings</Text>
              <Text style={styles.sensorValue}>x: {formatValue(x)}</Text>
              <Text style={styles.sensorValue}>y: {formatValue(y)}</Text>
              <Text style={styles.sensorValue}>z: {formatValue(z)}</Text>
              
              <TouchableOpacity
                onPress={isRecording ? _unsubscribe : _subscribe}
                style={[
                  styles.button,
                  isRecording ? styles.stopButton : styles.startButton
                ]}
                disabled={isUploading}
              >
                <Text style={styles.buttonText}>
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.samplesContainer}>
              <Text style={styles.samplesTitle}>
                Samples Collected: {samples.length}
              </Text>
              
              {samples.length > 0 && (
                <TouchableOpacity
                  style={[styles.button, styles.uploadButton]}
                  onPress={handleUpload}
                  disabled={isUploading || samples.length === 0}
                >
                  {isUploading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Upload Data</Text>
                  )}
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={[styles.button, styles.logoutButton]}
                onPress={handleLogout}
                disabled={isUploading}
              >
                <Text style={styles.buttonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
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
  authContainer: {
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
  authTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  sensorContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sensorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  sensorValue: {
    fontSize: 16,
    marginVertical: 5,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  uploadButton: {
    backgroundColor: '#2196F3',
  },
  loginButton: {
    backgroundColor: '#3f51b5',
  },
  logoutButton: {
    backgroundColor: '#607d8b',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  samplesContainer: {
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
  samplesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
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
  },
});