(function() {
  'use strict';

  var _ = require('lodash');
  var chalk = require('chalk');
  var filter = require('gulp-filter');
  var gulp = require('gulp');
  var path = require('path');
  var gulpApi = require('../gulpApi');
  var buildLayouts = require('./build.layouts');
  var buildSass = require('./build.sass');
  var _buildLayouts;

  gulpApi.registerTask({
    name: 'build',
    gulp: gulpBuild,
    before: before,
    done: done
  });

  function build(options) {
    return gulpApi.runTask('build', options);
  }

  function gulpBuild() {
    var sassFilter = filter('**/*.scss', {restore: true});

    return _buildLayouts()
        .pipe(sassFilter)
        .pipe(buildSass())
        .pipe(sassFilter.restore)
        .pipe(gulp.dest('build'));
  }

  function before(options) {
    _buildLayouts = _.partial(buildLayouts, options);

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
