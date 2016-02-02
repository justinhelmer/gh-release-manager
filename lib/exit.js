/**
 * @file exit.js
 *
 * The program teardown shared by all sub-commands.
 */
(function() {
  'use strict';

  var _ = require('lodash');
  var chalk = require('chalk');
  var cjsErr = require('commander.js-error');
  var program = require('commander');

  function exit(promise) {
    if (!promise) {
      cjsErr(new Error(chalk.red('Aborting:') + ' couldn\'t find promise chain to end.\n' + _.repeat(' ', 9) +
          'Perhaps \'' + chalk.blue('.done()') + '\' was already called.'));
      process.exit(1);
    }

    return promise.then(function() {
          if (!program.quiet) {
            console.log('\n' + chalk.green('Success') + '; exiting.');
          }

          process.exit();
        })
        .catch(function(err) {
          if (!program.quiet) {
            cjsErr({verbose: program.verbose}, err);
          }

          process.exit(1);
        })
        .done();
  }

  require('node-clean-exit')({verbose: 2});
  module.exports = exit;
})();
