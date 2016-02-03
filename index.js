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
      return prepareOptions().then(actions[op]).then(cleanup);
    }

    return Promise.reject(new Error('unknown op: \'' + op + '\''));

    function cleanup() {
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
    }

    function prepareOptions() {
      return new Promise(function(resolve, reject) {
        var optsPath = path.resolve(options.opts || 'grm.opts');

        fs.readFile(optsPath, function(err, file) {
          if (err) {
            reject(err);
          } else {
            var args = file.toString('utf8').split('\n');
            _.each(args, function(arg) {
              var kv = _.compact(arg.split(/\s+/));
              var key = (kv[0] || '').replace('--', '');
              var value = kv.length == 2 ? kv[1] : true; // simple switches should represent the boolean value `true`

              if (key && value && !options[key]) { // allow CLI args to take precedence
                options[key] = value;
              }
            });

            resolve(options);
          }
        });
      });
    }
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
