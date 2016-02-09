(function() {
  'use strict';

  var _ = require('lodash');
  var chalk = require('chalk');
  var gulp = require('gulp');
  var browserSync = require('browser-sync').create();
  var sass = require('gulp-sass');
  var gulpApi = require('../gulpApi');
  var buildLayouts = require('./build.layouts');
  var buildSass = require('./build.sass');
  var verbosity = require('../verbosity');
  var DEFAULT_PORT = 3000;
  var server;

  gulpApi.registerTask({
    name: 'serve',
    gulp: gulpServe,
    before: before
  });

  gulp.task('layouts', function() {
    return buildLayouts()
        .pipe(gulp.dest('build'))
        .pipe(browserSync.stream());
  });

  gulp.task('sass', function() {
    return gulp.src('source/css/*.scss')
        .pipe(buildSass())
        .pipe(gulp.dest('build/css'))
        .pipe(browserSync.stream());
  });

  function before(options) {
    if (options.verbose || !options.quiet) {
      console.log(chalk.cyan('\nServing website locally...'));
    }

    return true;
  }

  function gulpServe(options) {
    server();
    gulp.watch('source/css/**/*.scss', ['sass']);
    gulp.watch('source/**/*.html', ['layouts']);
    gulp.watch('source/**/*.md', ['layouts']);
  }

  function serve(options) {
    var logLevel = 'info';

    if (options.verbose && verbosity(options.verbose) > 1) {
      logLevel = 'debug';
    } else if (options.quiet) {
      logLevel = 'silent';
    }

    var syncOptions = {
      server: 'build',
      port: options.port || DEFAULT_PORT,
      logLevel: logLevel,
      notify: false
    };

    server = _.partial(browserSync.init, syncOptions);

    return gulpApi.runTask('serve', options);
  }

  module.exports = serve;
})();
