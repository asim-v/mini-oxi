const { getDefaultConfig } = require('expo/metro-config');
const { mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
    resolver: {
        assetExts: ['obj', 'mtl','ttf','png','svg'],
    },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
