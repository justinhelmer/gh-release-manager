#!/usr/bin/env node
(function() {
  'use strict';

  var program = require('commander');
  program
      .option('-q, --quiet', 'output nothing (suppress STDOUT and STDERR)')
      .option('-v, --verbose', 'output more, and show full stack-trace on error')
      .parse(process.argv);

  require('../lib/exit')(require('../index')('suite', {
    quiet: program.quiet,
    verbose: program.verbose
  }));
})();

