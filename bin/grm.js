#!/usr/bin/env node
(function() {
  'use strict';

  var _ = require('lodash');
  var chalk = require('chalk');
  var cjsErr = require('commander.js-error');
  var grm = require('../index');
  var program = require('commander');

  program.version('0.2.1')
      .description('Description:\n\n    Download releases, generate documentation, build site, deploy.')
      .option('-o, --opts [path]', 'the path to a conf file; cli args take precedence')
      .option('-d, --docs [path]', 'the path to output documentation; defaults to ../docs')
      .option('-k, --keep [path]', 'the path to keep releases; else they are removed')
      .option('-p, --path [path]', 'release-relative path to the JSDoc file; assumes index.js')
      .option('-q, --quiet', 'output nothing (suppress STDOUT and STDERR)')
      .option('-r, --repo [repo]', 'in the format \'org/repo\'; if not set, will be prompted')
      .option('-t, --top <n>', 'only parse docs for the top <n> most recent releases')
      .option('-v, --verbose [n]', 'true for more output; higher number (ie 2) for even more', false)
      .parse(process.argv);

  grm('release', _.pick(program, ['docs', 'keep', 'opts', 'path', 'quiet', 'recent', 'verbose']))
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

