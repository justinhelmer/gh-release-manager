(function() {
  'use strict';

  var DEFAULT_PORT = 3000;

  var _ = require('lodash');
  var chalk = require('chalk');
  var gulp = require('gulp');
  var browserSync = require('browser-sync').create();
  var lazypipe = require('lazypipe');
  var opn = require('opn');
  var Promise = require('bluebird');
  var rename = require('gulp-rename');
  var through2 = require('through2');
  var wait = require('wait-stream');

  var buildLayouts = require('./build.layouts');
  var buildSass = require('./build.sass');
  var flatten = require('../flatten');
  var tasks = require('../tasks');

  var _layouts = tasks.create({name: 'layouts', pipeline: layouts});
  var reloaded;

  gulp.task('sass', sass);

  function serve(options) {
    var syncOpts = browserSyncOptions(options);
    gulp.task('serve', serveTask(options, syncOpts));

    setTimeout(function() {
      var base = options.urlBase ? options.urlBase : '/';
      opn('http://localhost:' + syncOpts.port + base);
    }, 1000);

    return tasks.util.gulpStart('serve');
  }

  function serveTask(options, syncOpts) {
    return function(async) { // ensure asynchronous behavior
      console.log(chalk.cyan('\nServing website locally...'));

      browserSync.init(syncOpts);
      gulp.watch('source/css/**/*.scss', ['sass']);
      gulp.watch('source/**/*.html', _.partial(_layouts, options));
      gulp.watch('source/**/*.md', _.partial(_layouts, options));
    }
  }

  function browserSyncOptions(options) {
    var browserSyncOptions = {
      notify: false,
      open: false,
      port: options.port || DEFAULT_PORT
    };

    var logLevel = 'info';

    if (options.verbose > 1) {
      logLevel = 'debug';
    } else if (options.quiet) {
      logLevel = 'silent';
    }

    var server = {baseDir: 'build'};

    if (options.urlBase) {
      server.middleware = function(req, res, next) {
        var re = new RegExp('^' + options.urlBase + '(.+)?$');
        req.url = req.url.replace(re, '$1');

        if (req.url === '') {
          req.url = '/';
        }

        next();
      };
    }

    browserSyncOptions.logLevel = logLevel;
    browserSyncOptions.server = server;

    return browserSyncOptions;
  }

  function layouts(options) {
    reloaded = false;

    return lazypipe()
        .pipe(buildLayouts(options))
        .pipe(tasks.util.filter('layouts.source', ['source/**', '!source/css/**']))
        .pipe(rename, flatten)
        .pipe(gulp.dest, 'build')
        .pipe(reload);
  }

  function reload() {
    return through2.obj(function(chunk, enc, callback) {
      if (!reloaded) {
        setTimeout(function() {
          browserSync.reload({stream: false});
        }, 1000);

        reloaded = true;
      }

      this.push(chunk);
      callback();
    });
  }

  function sass() {
    return gulp.src('source/css/*.scss')
        .pipe(buildSass())
        .pipe(gulp.dest('build/css'))
        .pipe(browserSync.stream());
  }

  module.exports = serve;
})();
