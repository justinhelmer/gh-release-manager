#!/usr/bin/env node
(function() {
  'use strict';

  var program = require('../lib/program');
  require('node-alias')('grm deploy', __dirname, {message: !program.quiet});
})();
