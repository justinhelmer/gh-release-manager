(function() {
  'use strict';

  var _ = require('lodash');
  var chalk = require('chalk');
  var gulp = require('gulp');
  var browserSync = require('browser-sync').create();
  var sass = require('gulp-sass');
  var opn = require('opn');
  var gulpApi = require('../gulpApi');
  var buildLayouts = require('./build.layouts');
  var buildSass = require('./build.sass');
  var verbosity = require('../verbosity');
  var DEFAULT_PORT = 3000;
  var _buildLayouts;
  var server;

  gulpApi.registerTask({
    name: 'serve',
    gulp: gulpServe,
    before: before
  });

  gulp.task('layouts', function() {
    return _buildLayouts()
        .pipe(gulp.dest('build'))
        .pipe(browserSync.stream());
  });

  gulp.task('layouts-watch', ['layouts'], browserSync.reload);

  gulp.task('sass', function() {
    return gulpApi
        .src('source/css/*.scss')
        .pipe(buildSass())
        .pipe(gulp.dest('build/css'))
        .pipe(browserSync.stream());
  });

  function before(options) {
    _buildLayouts = _.partial(buildLayouts, options);

    if (options.verbose || !options.quiet) {
      console.log(chalk.cyan('\nServing website locally...'));
    }

    return true;
  }

  function gulpServe(options) {
    server();
    gulp.watch('source/css/**/*.scss', ['sass']);
    gulp.watch('source/**/*.html', ['layouts-watch']);
    gulp.watch('source/**/*.md', ['layouts-watch']);
  }

  function serve(options) {
    var logLevel = 'info';

    if (options.verbose && verbosity(options.verbose) > 1) {
      logLevel = 'debug';
    } else if (options.quiet) {
      logLevel = 'silent';
    }

    var syncOptions = {
      port: options.port || DEFAULT_PORT,
      logLevel: logLevel,
      notify: false,
      open: false
    };

    var serverOpts = {
      baseDir: 'build'
    };

    var base = '/';
    if (options.urlBase) {
      serverOpts.middleware = function(req, res, next) {
        var re = new RegExp('^' + options.urlBase + '(.+)?$');
        req.url = req.url.replace(re, '$1');

        if (req.url === '') {
          req.url = '/';
        }

        next();
      };

      base = options.urlBase;
    }

    syncOptions.server = serverOpts;
    server = _.partial(browserSync.init, syncOptions);
    setTimeout(function() {
      opn('http://localhost:' + syncOptions.port + base);
    }, 1000);
    return gulpApi.runTask('serve', options);
  }

  module.exports = serve;
})();
