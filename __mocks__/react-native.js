import * as ReactNative from 'react-native';

// Mock Alert
ReactNative.Alert.alert = jest.fn();

// Mock Dimensions API
ReactNative.Dimensions.get = jest.fn().mockReturnValue({
  width: 375,
  height: 812,
});

// Mock useColorScheme
ReactNative.useColorScheme = jest.fn().mockReturnValue('light');

// Mock Animated
ReactNative.Animated.timing = jest.fn().mockReturnValue({
  start: jest.fn(),
});

// Mock Keyboard
ReactNative.Keyboard.dismiss = jest.fn();

export default ReactNative; 