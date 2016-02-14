(function() {
  'use strict';

  var DEFAULT_PORT = 3000;

  var _ = require('lodash');
  var chalk = require('chalk');
  var browserSync = require('browser-sync').create();
  var gaze = require('gaze');
  var lazypipe = require('lazypipe');
  var opn = require('opn');
  var Promise = require('bluebird');
  var through2 = require('through2');
  var vfs = require('vinyl-fs');
  var wait = require('wait-stream');

  var buildLayouts = require('./build.layouts');
  var buildSass = require('./build.sass');
  var flatten = require('../flatten');
  var tasks = require('vinyl-tasks');
  var reloaded;

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
    return tasks.create({name: 'layouts', callback: layoutsTask});
  }

  function layoutsTask(options) {
    reloaded = false;

    return lazypipe()
        .pipe(buildLayouts(options))
        .pipe(tasks.filter('layouts.source', ['source/**', '!source/css/**']))
        .pipe(flatten)
        .pipe(vfs.dest, 'build')
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

  function sass(options) {
    return tasks.create({
      name: 'sass',
      callback: sassTask,
      chainable: false,
      lazy: false
    });
  }

  function sassTask() {
    return function() {
      return vfs.src('source/css/*.scss')
          .pipe(buildSass())
          .pipe(vfs.dest('build/css'))
          .pipe(browserSync.stream());
    };
  }

  function serve(options) {
    var syncOpts = browserSyncOptions(options);

    setTimeout(function() {
      var base = options.urlBase ? options.urlBase : '/';
      opn('http://localhost:' + syncOpts.port + base);
    }, 1000);

    return tasks.create({
      name: 'serve',
      callback: _.partial(serveTask, syncOpts),
      chainable: false,
      lazy: false
    })(options);
  }

  function serveTask(syncOpts, options) {
    return function(async) { // ensure asynchronous behavior
      console.log(chalk.cyan('\nServing website locally...'));

      browserSync.init(syncOpts);
      watch('source/css/**/*.scss', sass);
      watch('source/**/*.@(md|html)', layouts);
    };

    function watch(glob, callback) {
      gaze(glob, function(err) {
        if (err) {
          throw err;
        } else {
          this.on('changed', callback(options));
        }
      });
    }
  }

  module.exports = serve;
})();
