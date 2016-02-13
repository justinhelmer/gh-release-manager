(function() {
  'use strict';

  var _ = require('lodash');
  var chalk = require('chalk');
  var Promise = require('bluebird');
  var cleanup = require('./lib/cleanup');
  var opts = require('./lib/opts');
  var timer = new Timer();

  var actions = {
    build: require('./lib/actions/build'),
    deploy: require('./lib/actions/deploy'),
    download: require('./lib/actions/download'),
    jsdoc: require('./lib/actions/jsdoc'),
    lint: require('./lib/actions/lint'),
    release: require('./lib/actions/release'),
    serve: require('./lib/actions/serve'),
    test: require('./lib/actions/test')
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

      timer.start();

      return prepareOptions(options)
          .then(actions[op])
          .then(_.partial(cleanup, options))
          .then(function() {
            if (!options.quiet) {
              var time = timer.stop();
              console.log('\n' + chalk.green('Done with everything') + '; finished in', chalk.cyan(timer.stop().toFixed(3)), 'seconds');
            }
          });
    }

    return Promise.reject(new Error('unknown op: \'' + op + '\''));
  }

  grm.cli = function() {
    require('./lib/cliAdapter').apply(null, arguments);
  };

  function Timer() {
    var timer = this;

    timer.getTime = getTime;
    timer.start = start;
    timer.stop = stop;
    timer.startTime = 0;
    timer.stopTime = 0;

    function start() {
      timer.startTime = new Date().getTime();
    }

    function stop() {
      timer.stopTime = new Date().getTime();
      return getTime();
    }

    function getTime() {
      return (timer.stopTime - timer.startTime) / 1000;
    }
  }

  module.exports = grm;
})();
