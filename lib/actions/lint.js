(function() {
  'use strict';

  var _ = require('lodash');
  var chalk = require('chalk');
  var eslint = require('gulp-eslint');
  var fs = require('fs');
  var gulp = require('gulp');
  var Promise = require('bluebird');
  var gulpApi = require('../gulpApi');

  gulpApi.registerTask({
    name: 'lint',
    gulp: gulpLint,
    before: before,
    done: done
  });

  function lint(options) {
    return gulpApi.runTask('lint', options);
  }

  function gulpLint() {
    var files = ['source/js/main.js'];

    return gulp
        .src(files)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
  }

  function before(options) {
    if (options.verbose || !options.quiet) {
      console.log(chalk.yellow('\nRunning code quality check...'));

      if (options.verbose) {
        console.log('  -', chalk.bold.blue('[INFO]:'), 'Using \'' + chalk.yellow('ESLint') + '\'');
      }
    }

    return checkForESLintConfig(options).then(function(config) {
      return !_.isEmpty(config);
    });
  }

  function checkForESLintConfig(options) {
    return new Promise(function(resolve, reject) {
      var file;
      var configFiles = [
        '.eslintrc.js',
        '.eslintrc.yaml',
        '.eslintrc.yml',
        '.eslintrc.json',
        '.eslintrc'
      ];

      _.each(configFiles, function(configFile) {
        if (!file) {
          try {
            file = fs.statSync(configFile);
          } catch (e) {
            file = null;
          }
        }
      });

      if ((options.verbose || !options.quiet) && !file) {
        console.log('  -', chalk.bold.yellow('[WARNING]:'), 'No \'' + chalk.yellow('ESLint') + '\' configuration found. Skipping.');
      }

      resolve(file);
    });
  }

  function done(options) {
    if (options.verbose || !options.quiet) {
      console.log(chalk.yellow('Done'));
    }

    return options;
  }

  module.exports = lint;
})();
