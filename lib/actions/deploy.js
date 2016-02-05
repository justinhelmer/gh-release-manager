(function() {
  'use strict';

  var chalk = require('chalk');
  var Promise = require('bluebird');

  function deploy(options) {
    //console.log();
    //console.log(chalk.green('deploy complete'));
    return Promise.resolve(options);
  }

  module.exports = deploy;
})();
