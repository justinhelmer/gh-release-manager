(function() {
  'use strict';

  var _ = require('lodash');
  var chalk = require('chalk');
  var lazypipe = require('lazypipe');
  var path = require('path');
  var vfs = require('vinyl-fs');

  var buildLayouts = require('./build.layouts');
  var buildSass = require('./build.sass');
  var flatten = require('../flatten');
  var tasks = require('vinyl-tasks');

  module.exports = tasks.create({
    name: 'build',
    hooks: hooks,
    callback: callback,
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

  function callback(options) {
    return lazypipe()
        .pipe(buildLayouts(options))
        .pipe(tasks.filter('build.source', 'source/**'))
        .pipe(flatten)
        .pipe(tasks.filter('build.sass', '**/*.scss', {restore: true}))
        .pipe(buildSass)
        .pipe(tasks.filter.restore('build.sass'))
        .pipe(vfs.dest, 'build');
  }
})();
