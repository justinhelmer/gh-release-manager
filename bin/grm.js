#!/usr/bin/env node
(function() {
  'use strict';

  var _ = require('lodash');
  var chalk = require('chalk');
  var cjsErr = require('commander.js-error');
  var grm = require('../index');
  var program = require('commander');

  program.version('0.0.6')
      .description('Description:\n\n    Download releases, generate documentation, build site, deploy.')
      .option('-o, --opts [path]', 'the path to a conf file; cli args take precedence')
      .option('-d, --docs [path]', 'the path to output documentation; defaults to ../docs')
      .option('-k, --keep [path]', 'the path to keep releases; else they are removed')
      .option('-p, --path [path]', 'release-relative path to the JSDoc file; assumes index.js')
      .option('-q, --quiet', 'output nothing (suppress STDOUT and STDERR)')
      .option('-r, --recent <n>', 'only parse documentation for the <n> most recent releases')
      .option('-v, --verbose [n]', 'true for more output; higher number (ie 2) for even more', false)
      .parse(process.argv);

  var options = ['docs', 'keep', 'path', 'quiet', 'recent', 'verbose'];

  /**
   * When `--opts` is set, everything is great. It is great because it overrides default behavior from
   * Commander.prototype.opts: https://github.com/tj/commander.js/blob/master/index.js#L733
   *
   * However, when it is not, the property should be ignored. This is easily identifiable.
   * Maybe not the best idea to use `--opts`, but it is cohesive with other libs (i.e. mocha).
   */
   if (!_.isFunction(program.opts)) {
     options.push('opts');
   }

   grm('release', _.pick(program, options))
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

