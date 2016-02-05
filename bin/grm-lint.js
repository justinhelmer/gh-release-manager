#!/usr/bin/env node
(function() {
  'use strict';

  require('../lib/cliAdapter')('lint', 'Run code quality and code style linting', ['q', 'v']);
})();

