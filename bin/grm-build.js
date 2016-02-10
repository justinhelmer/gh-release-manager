#!/usr/bin/env node
(function() {
  'use strict';

  require('../lib/cliAdapter')('build', 'Build the website files using Metalsmith.', ['b', 'u']);
})();

