(function() {
  'use strict';

  var _ = require('lodash');
  var chalk = require('chalk');
  var spork = require('spork');
  var Promise = require('bluebird');

  function test(options) {
    options = options || {};

    if (options.verbose || !options.quiet) {
      console.log(chalk.yellow('\nRunning tests...'));
    }

    return new Promise(function(resolve, reject) {
      var npmOpts = {
        exit: false,
        stdio: ['inherit', null, null],
        quiet: !options.verbose,
        verbose: options.verbose > 1
      };

      if (options.verbose) {
        console.log('  -', chalk.bold.blue('[INFO]:'), 'running \'' + chalk.yellow('npm test') + '\'');
      }

      var test = spork('npm', ['test'], npmOpts);

      var outputBuffer = '';
      test.on('stdout', function(data) {
        outputBuffer += data;

        if (options.verbose > 1) {
          process.stdout.write(data);
        }
      });

      var errorBuffer = '';
      test.on('stderr', function(data) {
        errorBuffer += data;
      });

      test.on('error', function(err) {
            reject(err);
          })
          .on('exit:code', function(code) {
            if (code === 0) {
              if (options.verbose || !options.quiet) {
                console.log(chalk.yellow('Done'));
              }

              resolve(options);
            } else {
              var error = '\'' + chalk.yellow('npm test') + '\' failed';

              if (options.verbose) {
                if (options.verbose > 1) {
                  error += ':\n\n' + errorBuffer;
                } else {
                  console.log(outputBuffer);
                }
              }

              reject(new Error(error));
            }
          });
    });
  }

  function verbosity(level) {
    if (level === true || level === false) {
      return level;
    }

    var verbosity = parseInt(level);
    if (_.isFinite(verbosity)) {
      return verbosity;
    }

    return false;
  }

  module.exports = test;
})();
