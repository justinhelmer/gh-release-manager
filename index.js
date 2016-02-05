(function() {
  'use strict';

  var _ = require('lodash');
  var Promise = require('bluebird');
  var cleanup = require('./lib/cleanup');
  var opts = require('./lib/opts');

  var actions = {
    download: require('./lib/actions/download'),
    jsdoc: require('./lib/actions/jsdoc'),
    lint: require('./lib/actions/lint'),
    build: require('./lib/actions/build'),
    deploy: require('./lib/actions/deploy'),
    release: require('./lib/actions/release')
  };

  /**
   * GitHub Release Manager - Perform various actions related to tags & releases, using the GitHub API.
   *
   * @param {string} [op] - The operation to perform. possible values are defined by whatever "actions" are set up.
   * @param {object} [options] - All [options] specific to the action being performed, plus:
   * @param {boolean} [options.checkForOpts=true] - Whether or not to check for `grm.opts`; defaults to true.
   * @returns {bluebird Promise} - For valid actions, the promise is defined by each action.
   *                               For invalid actions, the promise is rejected with an Error.
   */
  function grm(op, options) {
    op = op || 'release';

    if (_.isFunction(actions[op])) {
      var prepareOptions;

      if (_.get(options, 'checkForOpts') === false) {
        prepareOptions = Promise.resolve;
      } else {
        prepareOptions = opts;
      }

      return prepareOptions(options)
          .then(actions[op])
          .then(_.partial(cleanup, options));
    }

    return Promise.reject(new Error('unknown op: \'' + op + '\''));
  }

  grm.cli = function() {
    require('./lib/cliAdapter').apply(null, arguments);
  };

  module.exports = grm;
})();
