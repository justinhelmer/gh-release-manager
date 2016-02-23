#!/usr/bin/env node
(function() {
  'use strict';

  require('commander')
      .version('0.17.1')
      .description('Description:\n\n    Download releases, generate documentation, build website, deploy, relax.\n    ' +
          'Type \'help [cmd]\' to see the options for a particlar [command].')
      .command('download', 'download recent releases via the GitHub Tags API')
      .command('jsdoc', 'parse JSDoc headers for locally-downloaded releases')
      .command('lint', 'run code quality and code style linting')
      .command('test', 'run \'npm test\', without failing if no tests exist')
      .command('build', 'build the website files using Metalsmith')
      .command('serve', 'serve the website locally for development')
      .command('deploy', 'deploy the build directory to gh-pages')
      .command('release', 'do it all in one go', {isDefault: true})
      .parse(process.argv);
})();

