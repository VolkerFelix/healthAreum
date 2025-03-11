import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Accelerometer } from 'expo-sensors';

export default function AccelerometerScreen() {
  const [{ x, y, z }, setData] = useState({ x: 0, y: 0, z: 0 });
  const [subscription, setSubscription] = useState(null);
  const [samples, setSamples] = useState([]);
  const [isRecording, setIsRecording] = useState(false);

  const _subscribe = () => {
    setIsRecording(true);
    setSamples([]);
    
    // Set update interval (milliseconds)
    Accelerometer.setUpdateInterval(100); // 10 readings per second
    
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

  useEffect(() => {
    return () => _unsubscribe();
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      _unsubscribe();
    } else {
      _subscribe();
    }
  };

  // Format acceleration values for display
  const formatValue = (value) => {
    return value.toFixed(3);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Accelerometer Test</Text>
        
        <View style={styles.sensorContainer}>
          <Text style={styles.sensorTitle}>Live Readings</Text>
          <Text style={styles.sensorValue}>x: {formatValue(x)}</Text>
          <Text style={styles.sensorValue}>y: {formatValue(y)}</Text>
          <Text style={styles.sensorValue}>z: {formatValue(z)}</Text>
        </View>
        
        <TouchableOpacity 
          onPress={toggleRecording} 
          style={[
            styles.button, 
            isRecording ? styles.stopButton : styles.startButton
          ]}
        >
          <Text style={styles.buttonText}>
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.samplesContainer}>
          <Text style={styles.samplesTitle}>
            Recorded Samples: {samples.length}
          </Text>
          
          {samples.length > 0 && (
            <View style={styles.samplesList}>
              <Text style={styles.samplesSubtitle}>Last 5 samples:</Text>
              {samples.slice(-5).map((sample, index) => (
                <View key={index} style={styles.sampleItem}>
                  <Text>x: {formatValue(sample.x)}, y: {formatValue(sample.y)}, z: {formatValue(sample.z)}</Text>
                  <Text style={styles.timestamp}>
                    {new Date(sample.timestamp).toLocaleTimeString('en-US', { 
                      hour12: false,
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      fractionalSecondDigits: 3
                    })}
                  </Text>
                </View>
              ))}
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
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
    paddingHorizontal: 30,
    borderRadius: 25,
    marginVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#F44336',
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
    marginTop: 10,
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
  samplesSubtitle: {
    fontSize: 16,
    marginVertical: 10,
  },
  samplesList: {
    width: '100%',
  },
  sampleItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  timestamp: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
});