#!/usr/bin/env node
(function() {
  'use strict';

  require('../lib/cliAdapter')('jsdoc', 'Parse JSDoc headers for locally-downloaded releases.', ['d', 'h', 'k', 'q', 'r', 'v']);
})();

