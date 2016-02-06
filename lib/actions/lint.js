(function() {
  'use strict';

  var _ = require('lodash');
  var chalk = require('chalk');
  var fs = require('fs');
  var gulp = require('gulp');
  var Promise = require('bluebird');

  function lint(options) {
    if (!options.quiet) {
      console.log(chalk.yellow('\nRunning code quality check...'));

      if (options.verbose) {
        console.log('  -', chalk.bold.blue('[INFO]:'), 'Using \'' + chalk.yellow('ESLint') + '\'');
      }
    }

    return checkForESLintConfig(options).then(function(config) {
      if (config) {
        return runESLint(options).then(done);
      }

      return done(options);
    });
  }

  function checkForESLintConfig(options) {
    return new Promise(function(resolve, reject) {
      var configFiles = ['.eslintrc', '.eslintrc.js'];
      var file;

      _.each(configFiles, function(configFile) {
        try {
          file = fs.statSync(configFile);
        } catch (e) {
          file = null;
        }
      });

      if (!options.quiet && !file) {
        console.log('  -', chalk.bold.yellow('[WARNING]:'), 'No \'' + chalk.yellow('ESLint') + '\' configuration found. Skipping.');
      }

      resolve(file);
    });
  }

  function done(options) {
    if (!options.quiet) {
      console.log(chalk.yellow('Done'));
    }

    return options;
  }

  function runESLint(options) {
    return new Promise(function(resolve, reject) {
      require('../../gulpfile'); // this will change the CWD to the location of the gulpfile

      gulp.on('stop', function() {
        resolve(options);
      });

      gulp.on('err', function(reason) {
        reject(reason.err);
      });

      gulp.start('lint');
    });
  }

  module.exports = lint;
})();
