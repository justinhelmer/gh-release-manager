(function() {
  'use strict';

  var _ = require('lodash');
  var chalk = require('chalk');
  var pages = require('gulp-gh-pages');
  var gulpApi = require('../gulpApi');
  var _pages;

  gulpApi.registerTask({
    name: 'deploy',
    gulp: gulpDeploy,
    before: before,
    done: done
  });

  function deploy(options) {
    return gulpApi.runTask('deploy', options);
  }

  function gulpDeploy() {
    return gulpApi.src('build/**').pipe(_pages());
  }

  function before(options) {
    _pages = _.partial(pages, {
      force: options.force
    });

    if (options.verbose || !options.quiet) {
      console.log(chalk.cyan('\nDeploying to GitHub Pages...'));
    }

    return true;
  }

  function done(options) {
    if (options.verbose || !options.quiet) {
      console.log(chalk.cyan('Done'));
    }

    return options;
  }

  module.exports = deploy;
})();
