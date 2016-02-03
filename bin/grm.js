#!/usr/bin/env node
(function() {
  'use strict';

  var _ = require('lodash');
  var chalk = require('chalk');
  var cjsErr = require('commander.js-error');
  var grm = require('../index');
  var program = require('commander');

  program.version('0.0.5')
      .description('Description:\n\n    Download releases, generate documentation, build site, deploy.\n\n')
      .option('-d, --docs [path]', 'the path to output documentation; defaults to ../docs')
      .option('-k, --keep [path]', 'the path to where releases should be kept; else they are cleaned up')
      .option('-p, --path [path]', 'relative path to the file to parse; assumes index.js')
      .option('-r, --recent <n>', 'only parse documentation for the <n> most recent releases')
      .option('-q, --quiet', 'output nothing (suppress STDOUT and STDERR)')
      .option('-v, --verbose [verbosity]', 'output more; optional number (i.e. 2) for even more', false)
      .parse(process.argv);

  grm('release', _.pick(program, ['docs', 'keep', 'path', 'recent', 'verbose']))
      .then(function() {
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

  require('node-clean-exit')();
})();

