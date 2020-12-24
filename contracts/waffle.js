module.exports = {
  'compilerType': 'solcjs',
  'cacheDirectory': '../.cache',
  'sourceDirectory': process.env.CONTRACT_SRC_DIR || './contract',
  'outputDirectory': './contract-artifact',
  'flattenOutputDirectory': './contract-flatten',
}
