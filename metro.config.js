const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ensure local node_modules resolve (Windows paths / package exports edge cases)
config.resolver.nodeModulesPaths = [
  ...(config.resolver.nodeModulesPaths ?? []),
  require("path").resolve(__dirname, "node_modules"),
];

module.exports = config;
