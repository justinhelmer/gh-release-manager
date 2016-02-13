(function() {
  'use strict';

  var _ = require('lodash');
  var chalk = require('chalk');
  var pages = require('gulp-gh-pages');
  var lazypipe = require('lazypipe');
  var tasks = require('../tasks');
  var write = process.stdout.write;

  module.exports = tasks.create({
    name: 'deploy',
    pipeline: pipeline,
    label: 'deploy to GitHub Pages'
  });

  function pipeline(options) {
    return lazypipe()
        .pipe(tasks.util.filter('build/**'))
        .pipe(pages, {force: options.force});
  }
})();
