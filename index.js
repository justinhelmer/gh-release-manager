(function() {
  'use strict';

  var _ = require('lodash');
  var chalk = require('chalk');
  var fs = require('fs');
  var path = require('path');
  var Promise = require('bluebird');

  var actions = {
    release: require('./lib/release')
  };

  /**
   * GitHub Release Manager - Perform various actions related to tags & releases, using the GitHub API.
   *
   * @param {string} [op] - The operation to perform. possible values are defined by whatever "actions" are set up.
   * @param {object} [options] - All [options] specific to the action being performed. Check the action module for details.
   * @returns {bluebird Promise} - For valid actions, the promise is defined by each action.
   *                               For invalid actions, the promise is rejected with an Error.
   */
  function grm(op, options) {
    options = options || {};
    op = op || 'release';

    if (_.isFunction(actions[op])) {
      return actions[op](options).then(function() {
        if (!options.keep) {
          var tmpDir = path.resolve(__dirname, 'lib/tmp');

          if (!options.quiet) {
            console.log('\n' + chalk.blue('Cleaning up...'));

            if (options.verbose) {
              console.log(chalk.blue('Deleting'), tmpDir);
            }
          }

          deleteFolderRecursive(tmpDir);
        }
      });
    }

    return Promise.reject(new Error('unknown op: \'' + op + '\''));
  }

  function deleteFolderRecursive(path) {
    if (fs.existsSync(path)) {
      _.each(fs.readdirSync(path), function(file, index) {
        var curPath = path + '/' + file;

        if (fs.lstatSync(curPath).isDirectory()) {
          deleteFolderRecursive(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
      });

      fs.rmdirSync(path);
    }
  }

  module.exports = grm;
})();
