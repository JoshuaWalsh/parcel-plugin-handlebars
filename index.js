module.exports = bundler => {
  // process handlebars files by .hbs and .handlebars extensions
  const HbsAsset = require.resolve('./lib/HbsAsset')(bundler);
  bundler.addAssetType('hbs', HbsAsset);
  bundler.addAssetType('handlebars', HbsAsset);
  bundler.addAssetType('html', HbsAsset);
};
