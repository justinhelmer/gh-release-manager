#!/usr/bin/env node
(function() {
  'use strict';

  require('commander')
      .version('0.0.2')
      .description('Description:\n\n    ' + 'A variety of tools for managing github tags/releases.\n\n    ' +
          'If [command] is excluded, `suite` is run by default.\n    ' +
          'For command-specific options. Use `help [command]` for details.')
      .command('download', 'DL assets for all recent tags (only if the format is [v]X.X.X)')
      .command('jsdoc', 'parse JSDocs from all recent releases')
      .command('suite', 'do all of the things', {isDefault: true})
      .parse(process.argv);
})();

