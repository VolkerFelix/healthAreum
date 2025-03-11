import { Platform } from 'react-native';
import * as Device from 'expo-device';

// Get device information for acceleration data uploads
export const getDeviceInfo = () => {
  return {
    device_type: Platform.OS === 'ios' ? 'iPhone' : 'Android',
    model: Device.modelName || (Platform.OS === 'ios' ? 'iPhone' : 'Android Device'),
    os_version: `${Platform.OS} ${Platform.Version}`,
    device_id: Device.deviceName || undefined
  };
};

// Format acceleration data for API upload
export const formatAccelerationData = (samples, samplingRateHz = 10) => {
  // Start time is the timestamp of the first sample or current time if no samples
  const startTime = samples.length > 0 
    ? samples[0].timestamp 
    : new Date().toISOString();
  
  return {
    data_type: 'acceleration',
    device_info: getDeviceInfo(),
    sampling_rate_hz: samplingRateHz,
    start_time: startTime,
    samples: samples
  };
};

// Calculate sampling rate based on timestamps
export const calculateSamplingRate = (samples) => {
  if (!samples || samples.length < 2) return 0;
  
  // Get first and last sample timestamps
  const firstTimestamp = new Date(samples[0].timestamp).getTime();
  const lastTimestamp = new Date(samples[samples.length - 1].timestamp).getTime();
  
  // Calculate time difference in seconds
  const timeDiffSeconds = (lastTimestamp - firstTimestamp) / 1000;
  
  // Calculate samples per second (Hz)
  const samplingRate = timeDiffSeconds > 0 
    ? Math.round((samples.length - 1) / timeDiffSeconds) 
    : 0;
  
  return samplingRate;
};