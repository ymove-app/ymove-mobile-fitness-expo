// Metro needs help to follow the `file:` link to the SDK package outside this
// project root. Once `ymove-exercise-api` ships on npm and we swap the link
// for `^1.0.0`, this whole file can be deleted.

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Tell Metro to watch the SDK source folder as well.
const sdkPath = path.resolve(__dirname, '../../ymove-frontend/packages/sdk');
config.watchFolders = [sdkPath];

// Resolve SDK deps from this project's node_modules.
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(sdkPath, 'node_modules'),
];

module.exports = config;
