#!/usr/bin/env node
(function() {
  'use strict';

  var program = require('../lib/program');

  require('../lib/exit')(require('../index')('suite', {
    quiet: program.quiet,
    verbose: program.verbose
  }));
})();

