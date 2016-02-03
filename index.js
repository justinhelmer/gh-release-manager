(function() {
  'use strict';

  var _ = require('lodash');
  var chalk = require('chalk');
  var fs = require('fs');
  var path = require('path');
  var Promise = require('bluebird');
  var cleanup = require('./lib/cleanup');

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
    op = op || 'release';

    if (_.isFunction(actions[op])) {
      return prepareOptions().then(actions[op]).then(_.partial(cleanup, options));
    }

    return Promise.reject(new Error('unknown op: \'' + op + '\''));

    function prepareOptions() {
      return new Promise(function(resolve, reject) {
        options = options || {};

        /**
         * When used via the CLI, there is a risk of `--opts` not being valid. When set, everything is great. It is great
         * because it overrides default behavior from Commander.prototype.opts: https://github.com/tj/commander.js/blob/master/index.js#L733
         *
         * However, when it is not, the property should be ignored. This is easily identifiable.
         * Maybe not the best idea to use `--opts`, but it is cohesive with other libs (i.e. mocha).
         */
        if (_.isFunction(options.opts)) {
          options.opts = false;
        }

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

              if (key && value && !options[key]) { // allow CLI args to override options from grm.opts
                options[key] = value;
              }
            });

            resolve(options);
          }
        });
      });
    }
  }

  module.exports = grm;
})();
