/**
 * @file program.js
 *
 * The program setup shared by all sub-commands.
 */
(function() {
  'use strict';

  var _ = require('lodash');
  var program = require('commander');

  program
      .option('-q, --quiet', 'output nothing (suppress STDOUT and STDERR)')
      .option('-v, --verbose [verbosity]', 'output more; optional number (i.e. 2) for even more', false)
      .parse(process.argv);

  if (program.verbose) {
    var verbosity = parseInt(program.verbose);
    if (_.isFinite(verbosity)) {
      program.verbose = verbosity;
    }
  }

  module.exports = program;
})();
