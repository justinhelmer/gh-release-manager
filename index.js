(function() {
  'use strict';

  var _ = require('lodash');
  var chalk = require('chalk');
  var Promise = require('bluebird');

  var actions = {
    download: require('./lib/download'),
    jsdoc: require('./lib/jsdoc')
  };

  /**
   * GitHub Release Manager - Perform various actions related to tags & releases, using the GitHub API.
   *
   * @param {string} op - The operation to perform. possible values are defined by whatever "actions" are set up.
   * @param {object} [options] - All [options] specific to the action being performed. Check the action module for details.
   * @returns {bluebird Promise} - For valid actions, the promise is defined by each action.
   *                               For invalid actions, the promise is rejected with an Error.
   */
  function grm(op, options) {
    if (op === 'suite') {
      return runAll();
    }

    if (_.isFunction(actions[op])) {
      return actions[op](options);
    }

    return Promise.reject(new Error('unknown op: \'' + op + '\''));

    function runAll() {
      return actions.download(options).then(actions.jsdoc);
    }
  }

  module.exports = grm;
})();
