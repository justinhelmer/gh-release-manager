#!/usr/bin/env node
(function() {
  'use strict';

  var chalk = require('chalk');

  console.log();
  console.log(chalk.bold.blue('[INFO]:'), 'You can also use', chalk.bold.blue('ghr'), 'as an alias');
  console.log();

  require('./grm');
})();
