(function() {
  'use strict';

  var chalk = require('chalk');
  var filter = require('gulp-filter');
  var gulp = require('gulp');
  var layouts = require('metalsmith-layouts');
  var markdown = require('metalsmith-markdown');
  var metalsmith = require('gulp-metalsmith');
  var sass = require('gulp-sass');
  var gulpApi = require('../gulpApi');
  var gutil = require('gulp-util');

  gulpApi.registerTask({
    name: 'build',
    gulp: gulpBuild,
    before: before,
    done: done
  });

  function build(options) {
    return gulpApi.runTask('build', options);
  }

  function gulpBuild(options) {
    var files = ['source/**', '!source/layouts/**', '!source/partials/**'];
    var sassFilter = filter('**/*.scss', {restore: true});

    return gulpApi.src(files)
        .pipe(metalsmith({
          use: [
            markdown(),
            layouts({
              engine: 'handlebars',
              default: 'page.html',
              directory: 'source/layouts',
              partials: 'source/partials',
              pattern: '**/*.html'
            })
          ]
        }))
        .pipe(sassFilter)
        .pipe(sass({
          includePaths: ['source/css']
        }))
        .pipe(sassFilter.restore)
        .pipe(gulp.dest('build'));
  }

  function before(options) {
    if (!options.quiet) {
      console.log(chalk.blue('\nBuilding website...'));
    }

    return true;
  }

  function done(options) {
    if (options.verbose) {
      console.log('  -', chalk.bold.blue('[INFO]:'), 'Using \'' + chalk.blue('handlebars') + '\' as the templating engine');
      console.log('  -', chalk.bold.blue('[INFO]:'), 'Looking in \'' + chalk.blue('source/layouts') + '\' for templates');
      console.log('  -', chalk.bold.blue('[INFO]:'), 'Looking in \'' + chalk.blue('source/partials') + '\' for partials');
      console.log('  -', chalk.bold.blue('[INFO]:'), 'Using \'' + chalk.blue('page.html') + '\' as the default layout');
    }

    if (!options.quiet) {
      console.log(chalk.blue('Done'));
    }

    return options;
  }

  module.exports = build;
})();
