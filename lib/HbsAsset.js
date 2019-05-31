const frontMatter = require('front-matter');
const handlebars = require('handlebars');
const handlebarsWax = require('handlebars-wax');
const HTMLAsset = require('parcel-bundler/src/assets/HTMLAsset');
const { loadUserConfig, parseSimpleLayout } = require('./utils');

function init(bundler) {
  const userConfig = loadUserConfig();
  const config = Object.assign({}, {
    data: ['src/markup/data/**/*.{json,js}'],
    decorators: ['src/markup/decorators/**/*.js'],
    helpers: ['src/markup/helpers/**/*.js'],
    partials: ['src/markup/partials/**/*.{hbs,handlebars,js}', 'src/markup/layouts/**/*.{hbs,handlebars,js}'],
  }, userConfig);
  
  class HbsAsset extends HTMLAsset {
    resolveDependencies(arr) {
      return arr.map(dep => this.resolveDependency(dep)).resolved;
    }

    constructor(name, pkg, options) {
      super(name, pkg, options);
      this.wax = handlebarsWax(handlebars)
        .helpers(config.helpers.map(this.resolveDependencies))
        .data(config.data.map(this.resolveDependencies))
        .decorators(config.decorators.map(this.resolveDependencies))
        .partials(config.partials.map(this.resolveDependencies));
    }
  
    parse(code) {
      // process any frontmatter yaml in the template file
      const frontmatter = frontMatter(code);
  
      // process simple layout mapping that does not use handlebars-layouts. i.e {{!< base}}
      const content = parseSimpleLayout(frontmatter.body, config);
  
      // combine frontmatter data with NODE_ENV variable for use in the template
      const data = Object.assign({}, frontmatter.attributes, { NODE_ENV: process.env.NODE_ENV });
  
      // compile template into html markup and assign it to this.contents. super.generate() will use this variable.
      this.contents = this.wax.compile(content)(data);
  
      // Return the compiled HTML
      return super.parse(this.contents);
    }
  }
  return HbsAsset;
}

module.exports = init;
