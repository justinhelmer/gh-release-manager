#!/usr/bin/env node
(function() {
  'use strict';

  require('../lib/cliAdapter')('build', 'Build the markdown files to HTML using Jekyll.', ['q', 'v']);
})();

