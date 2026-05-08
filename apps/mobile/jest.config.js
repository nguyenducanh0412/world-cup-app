module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@tamagui|moti|react-native-reanimated|react-native-gesture-handler)/)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
