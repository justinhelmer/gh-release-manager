(function() {
  'use strict';

  var chalk = require('chalk');
  var highlight = require('highlight.js');
  var layouts = require('metalsmith-layouts');
  var lazypipe = require('lazypipe');
  var markdown = require('metalsmith-markdown');
  var metadata = require('metalsmith-metadata');
  var metalsmith = require('gulp-metalsmith');
  var path = require('path');
  var tasks = require('vinyl-tasks');

  function buildLayouts(options) {
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

    use.push(markdown({
      langPrefix: 'hljs ',
      smartypants: true,
      gfm: true,
      tables: true,
      highlight: function (code) {
        return highlight.highlightAuto(code).value;
      }
    }), layouts({
      engine: 'handlebars',
      default: 'page.html',
      directory: 'source/layouts',
      partials: 'source/partials',
      pattern: '**/*.html'
    }));

    return lazypipe()
        .pipe(tasks.filter('build.layouts', ['grm.metadata.json', '**/*.html', '**/*.md'], {restore: true}))
        .pipe(metalsmith, {use: use})
        .pipe(tasks.filter.restore('build.layouts'));
  }

  module.exports = buildLayouts;
})();
