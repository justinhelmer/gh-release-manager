(function() {
  'use strict';

  var chalk = require('chalk');
  var Promise = require('bluebird');

  function build(options) {
    //console.log();
    //console.log(chalk.green('build complete'));
    return Promise.resolve(options);
  }

  module.exports = build;
})();
