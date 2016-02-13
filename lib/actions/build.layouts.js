(function() {
  'use strict';

  var chalk = require('chalk');
  var filter = require('gulp-filter');
  var layouts = require('metalsmith-layouts');
  var lazypipe = require('lazypipe');
  var markdown = require('metalsmith-markdown');
  var metadata = require('metalsmith-metadata');
  var metalsmith = require('gulp-metalsmith');
  var path = require('path');
  var tasks = require('../tasks');

  function buildLayouts(options) {
    var metalsmithFilter = filter(['grm.metadata.json', '**/*.html', '**/*.md'], {restore: true});
    var use = [];
    var meta;

    try {
      meta = require(path.resolve(process.cwd(), 'grm.metadata.json'));
    } catch (e) {
      if (options.verbose > 1) {
        console.log('  -', chalk.bold.yellow('[WARNING]:'), 'No \'' + chalk.blue('grm.metadata.json') + '\' file found');
      }
    }

    if (meta) {
      use.push(metadata({site: 'grm.metadata.json'}));
    }

    if (options.urlBase) {
      use.push(function(files, metalsmith, done) {
        var metadata = metalsmith.metadata();

        if (!metadata.site) {
          metadata.site = {};
        }

        metadata.site.urlBase = options.urlBase;
        done();
      });
    }

    use.push(markdown(), layouts({
      engine: 'handlebars',
      default: 'page.html',
      directory: 'source/layouts',
      partials: 'source/partials',
      pattern: '**/*.html'
    }));

    return lazypipe()
        .pipe(tasks.util.filter('build.layouts', ['grm.metadata.json', '**/*.html', '**/*.md'], {restore: true}))
        .pipe(metalsmith, {use: use})
        .pipe(tasks.util.filter.restore('build.layouts'));
  }

  module.exports = buildLayouts;
})();
