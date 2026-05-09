module.exports = {
  root: true,
  extends: '@react-native',
  parserOptions: {
    requireConfigFile: false,
  },
  rules: {
    // Disable deprecated rules that were removed in RN 0.85.3
    '@react-native/no-deep-imports': 'off',
  },
};
