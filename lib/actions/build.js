(function() {
  'use strict';

  var chalk = require('chalk');
  var filter = require('gulp-filter');
  var gulp = require('gulp');
  var path = require('path');
  var gulpApi = require('../gulpApi');
  var buildLayouts = require('./build.layouts');
  var buildSass = require('./build.sass');

  gulpApi.registerTask({
    name: 'build',
    gulp: buildGulp,
    before: before,
    done: done
  });

  function build(options) {
    return gulpApi.runTask('build', options);
  }

  function buildGulp() {
    var sassFilter = filter('**/*.scss', {restore: true});

    return buildLayouts()
        .pipe(sassFilter)
        .pipe(buildSass())
        .pipe(sassFilter.restore)
        .pipe(gulp.dest('build'));
  }

  function before(options) {
    if (options.verbose || !options.quiet) {
      console.log(chalk.blue('\nBuilding website...'));
    }

    if (options.build) {
      return require(path.resolve(process.cwd(), options.build))(options);
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

    if (options.verbose || !options.quiet) {
      console.log(chalk.blue('Done'));
    }

    return options;
  }

  module.exports = build;
})();
