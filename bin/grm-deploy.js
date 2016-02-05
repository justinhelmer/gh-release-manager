#!/usr/bin/env node
(function() {
  'use strict';

  require('../lib/cliAdapter')('deploy', 'Deploy a grm-built project to gh-pages.', ['q', 'r', 'v']);
})();

