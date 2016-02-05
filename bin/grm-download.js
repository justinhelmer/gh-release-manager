#!/usr/bin/env node
(function() {
  'use strict';

  require('../lib/cliAdapter')('download', 'Download recent releases via the GitHub Tags API.', ['k', 'p', 'q', 'r', 't', 'v']);
})();

