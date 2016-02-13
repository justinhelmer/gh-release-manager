(function() {
  'use strict';

  var _ = require('lodash');
  var chalk = require('chalk');
  var gulp = require('gulp');
  var lazypipe = require('lazypipe');
  var path = require('path');
  var rename = require('gulp-rename');
  var tasks = require('../tasks');
  var buildLayouts = require('./build.layouts');
  var buildSass = require('./build.sass');

  module.exports = tasks.create({
    name: 'build',
    hooks: hooks,
    pipeline: pipeline,
    color: 'blue'
  });

  function hooks(options) {
    return {
      done: function done() {
        if (options.verbose) {
          console.log('  -', chalk.bold.blue('[INFO]:'), 'Using \'' + chalk.blue('handlebars') + '\' as the templating engine');
          console.log('  -', chalk.bold.blue('[INFO]:'), 'Looking in \'' + chalk.blue('source/layouts') + '\' for templates');
          console.log('  -', chalk.bold.blue('[INFO]:'), 'Looking in \'' + chalk.blue('source/partials') + '\' for partials');
          console.log('  -', chalk.bold.blue('[INFO]:'), 'Using \'' + chalk.blue('page.html') + '\' as the default layout');
        }
      },

      validate: function validate() {
        if (options.build) {
          return require(path.resolve(process.cwd(), options.build))(options);
        }

        return true;
      }
    }
  }

  function pipeline(options) {
    return lazypipe()
        .pipe(buildLayouts(options))
        .pipe(tasks.util.filter('build.source', 'source/**'))
        .pipe(rename, flatten)
        .pipe(tasks.util.filter('build.sass', '**/*.scss', {restore: true}))
        .pipe(buildSass)
        .pipe(tasks.util.filter.restore('build.sass'))
        .pipe(gulp.dest, 'build');
  }

  function flatten(path) {
    path.dirname = path.dirname.replace(/^source(.*)$/, '$1');
    return path;
  }
})();
