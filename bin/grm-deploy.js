#!/usr/bin/env node
(function() {
  'use strict';

  require('../lib/cliAdapter')('deploy', 'Deploy the build directory to gh-pages.', ['f']);
})();

