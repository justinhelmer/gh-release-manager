(function() {
  'use strict';

  var _ = require('lodash');
  var chalk = require('chalk');
  var eslint = require('gulp-eslint');
  var fs = require('fs');
  var lazypipe = require('lazypipe');
  var Promise = require('bluebird');
  var tasks = require('../tasks');

  module.exports = tasks.create({
    name: 'lint',
    hooks: hooks,
    callback: callback,
    color: 'yellow',
    label: 'code quality check'
  });

  function hooks(options) {
    return {
      before: function before() {
        if (options.verbose) {
          console.log('  -', chalk.bold.blue('[INFO]:'), 'Using \'' + chalk.yellow('ESLint') + '\'');
        }
      },

      validate: function validate() {
        return checkForESLintConfig(options).then(function(config) {
          return !_.isEmpty(config);
        });
      }
    }
  }

  function callback(options) {
    return lazypipe()
        .pipe(tasks.util.filter('lint.javascript', ['**/*.js', '!build/**'], {restore: true}))
        .pipe(eslint)
        .pipe(eslint.format)
        .pipe(eslint.failAfterError)
        .pipe(tasks.util.filter.restore('lint.javascript'));
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
})();
