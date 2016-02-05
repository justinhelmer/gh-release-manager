#!/usr/bin/env node
(function() {
  'use strict';

  require('commander')
      .version('0.3.0')
      .description('Description:\n\n    Download releases, generate documentation, build website, deploy, relax.')
      .command('download', 'download recent releases via the GitHub Tags API')
      .command('jsdoc', 'parse JSDoc headers for locally-downloaded releases')
      .command('lint', 'run code quality and code style linting')
      .command('build', 'build the markdown files to HTML using Jekyll')
      .command('deploy', 'deploy a grm-built project to gh-pages')
      .command('release', 'do it all in one go', {isDefault: true})
      .parse(process.argv);
})();

