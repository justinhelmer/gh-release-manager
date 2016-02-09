(function() {
  'use strict';

  var _ = require('lodash');
  var chalk = require('chalk');
  var spork = require('spork');
  var Promise = require('bluebird');

  function test(options) {
    options = options || {};
    var verbose = verbosity(options.verbose);

    if (verbose || !options.quiet) {
      console.log(chalk.yellow('\nRunning tests...'));
    }

    return new Promise(function(resolve, reject) {
      var npmOpts = {
        stdio: ['inherit', null, null],
        quiet: !verbose,
        verbose: verbose > 1
      };

      if (verbose) {
        console.log('  -', chalk.bold.blue('[INFO]:'), 'running \'' + chalk.yellow('npm test') + '\'');
      }

      var test = spork('npm', ['test'], npmOpts);

      if (verbose > 1) {
        test.on('stdout', function(data) {
          process.stdout.write(data);
        });
      }

      test.on('error', function(err) {
            reject(err);
          })
          .on('exit:code', function(code) {
            if (code !== 0) {
              reject(new Error(chalk.yellow('npm test') + '\' failed'));
            }

            if (verbose || !options.quiet) {
              console.log(chalk.yellow('Done'));
            }

            resolve(options);
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
