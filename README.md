# Areum Health - Accelerometer Tracking App

A React Native mobile application for tracking and uploading acceleration data from iPhone devices to the Areum backend.

## Features

- Accelerometer data tracking and collection
- Real-time display of acceleration values
- User authentication (login/logout)
- Upload collected data to the Areum backend

## Prerequisites

- Node.js (v14 or higher)
- Expo CLI
- iOS development environment (for iOS testing)
- Physical device for accelerometer testing (recommended)

## Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```
3. Install Expo CLI if not already installed:
   ```
   npm install -g expo-cli
   ```

## Configuration

Update the API base URL in `src/utils/apiConstants.js` to point to your Areum backend:

```javascript
// Change this to your backend URL
export const API_BASE_URL = 'http://your-backend-url:8080';

// If testing on a physical device, use your computer's local IP address
// For example: export const API_BASE_URL = 'http://192.168.1.100:8080';
```

## Running the App

1. Start the Expo development server:
   ```
   npx expo start
   ```

2. To run on an iOS simulator:
   ```
   npx expo start --ios
   ```

3. To run on a physical device:
   - Install the Expo Go app on your device
   - Scan the QR code displayed in the terminal with your device's camera
   - Make sure your device and computer are on the same network

## Usage

1. **Login**: Enter your Areum backend credentials to authenticate
2. **Record Data**: Press "Start Recording" to begin collecting accelerometer data
3. **Stop Recording**: Press "Stop Recording" when you have collected enough data
4. **Upload Data**: Press "Upload Data" to send the collected data to the Areum backend
5. **Logout**: Press "Logout" to end your session

## Project Structure

```
AreumHealth/
├── App.js                           # Application entry point
├── src/
│   ├── screens/
│   │   ├── AccelerometerScreen.js   # Basic accelerometer testing screen
│   │   └── UploadScreen.js          # Main screen with login and upload functionality
│   ├── services/
│   │   └── apiService.js            # API communication service
│   └── utils/
│       ├── accelerometerUtils.js    # Utilities for accelerometer data
│       └── apiConstants.js          # API endpoint configuration
```

## Development

### Adding Features

1. **Data Visualization**: Add charts to visualize acceleration patterns
2. **User Registration**: Add ability to register new users
3. **Historical Data View**: Allow users to view previously uploaded data
4. **Background Tracking**: Implement background tracking functionality
5. **Additional Sensors**: Add gyroscope or other sensor data collection

### Testing

The app uses a test-driven development approach. Add tests for new features in a `__tests__` directory.

## Troubleshooting

- **API Connection Issues**: Ensure your backend URL is correctly set and accessible from your device
- **Accelerometer Not Working**: On simulators, accelerometer data is simulated. For accurate testing, use a physical device
- **Authentication Failed**: Verify your backend is running and the user credentials are valid

## License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.