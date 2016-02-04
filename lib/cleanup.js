(function() {
  'use strict';

  var _ = require('lodash');
  var chalk = require('chalk');
  var fs = require('fs');
  var path = require('path');
  var tildify = require('tildify');

  /**
   * Synchronous teardown. Recursively deletes the tmp directory, if exists.
   *
   * @param {object} [options] - The configuration that defines the behavior of cleanup().
   * @param {string} [options.quiet] - Don't output anything.
   * @param {string} [options.verbose] - Output more information.
   */
  function cleanup(options) {
    var tmpDir = path.resolve(__dirname, './tmp');

    if (!options.quiet) {
      console.log('\n' + chalk.grey('Cleaning up...'));
    }

    if (fs.existsSync(tmpDir)) {
      deleteDirectory(tmpDir, true);
    } else if (options.verbose) {
      console.log('  - ' + chalk.bold.blue('[INFO]:'), 'Nothing to clean up');
    }

    if (!options.quiet) {
      console.log(chalk.grey('Done'));
    }

    function deleteDirectory(path, skipExistenceCheck) {
      if (skipExistenceCheck || fs.existsSync(path)) {
        if (options.verbose) {
          console.log('  - ' + chalk.bold.blue('[INFO]:'), 'Deleting', '\'' + chalk.grey(tildify(path)) + '\'');
        }

        _.each(fs.readdirSync(path), function(file, index) {
          var current = path + '/' + file;

          if (fs.lstatSync(current).isDirectory()) {
            deleteDirectory(current);
          } else {
            fs.unlinkSync(current);
          }
        });

        fs.rmdirSync(path);
      }
    }
  }

  module.exports = cleanup;
})();
