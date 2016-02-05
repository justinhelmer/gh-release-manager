(function() {
  'use strict';

  var chalk = require('chalk');
  var Promise = require('bluebird');

  function lint(options) {
    //console.log();
    //console.log(chalk.green('linting complete'));
    return Promise.resolve(options);
  }

  module.exports = lint;
})();
