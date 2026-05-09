const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration for RN 0.85.3
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */

// Get the workspace root (monorepo root)
const workspaceRoot = path.resolve(__dirname, '../..');
const projectRoot = __dirname;

const config = {
  watchFolders: [workspaceRoot],
  resolver: {
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(workspaceRoot, 'node_modules'),
    ],
    // Support for workspace packages
    extraNodeModules: {
      '@kickoff/shared': path.resolve(workspaceRoot, 'packages/shared'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
