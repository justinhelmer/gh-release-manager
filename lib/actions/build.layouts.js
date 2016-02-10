(function() {
  'use strict';

  var chalk = require('chalk');
  var filter = require('gulp-filter');
  var layouts = require('metalsmith-layouts');
  var markdown = require('metalsmith-markdown');
  var metadata = require('metalsmith-metadata');
  var metalsmith = require('gulp-metalsmith');
  var path = require('path');
  var gulpApi = require('../gulpApi');
  var verbosity = require('../verbosity');

  function buildLayouts(options) {
    var files = ['grm.metadata.json', 'source/**', '!source/layouts/**', '!source/partials/**'];
    var metalsmithFilter = filter(['grm.metadata.json', '**/*.html', '**/*.md'], {restore: true});
    var verbose = verbosity(options.verbose);
    var use = [];
    var meta;

    try {
      meta = require(path.resolve(process.cwd(), 'grm.metadata.json'));
    } catch (e) {
      if (verbose > 1) {
        console.log('  -', chalk.bold.yellow('[WARNING]:'), 'No \'' + chalk.blue('grm.metadata.json') + '\' file found');
      }
    }

    if (meta) {
      use.push(metadata({site: 'grm.metadata.json'}));
    }

    use.push(markdown(), layouts({
      engine: 'handlebars',
      default: 'page.html',
      directory: 'source/layouts',
      partials: 'source/partials',
      pattern: '**/*.html'
    }));

    return gulpApi
        .src(files)
        .pipe(metalsmithFilter)
        .pipe(metalsmith({use: use}))
        .pipe(metalsmithFilter.restore)
        .pipe(filter(['**', '!grm.metadata.json']));
  }

  module.exports = buildLayouts;
})();
