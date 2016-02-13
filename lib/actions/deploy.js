(function() {
  'use strict';

  var pages = require('gulp-gh-pages');
  var lazypipe = require('lazypipe');
  var tasks = require('../tasks');

  module.exports = tasks.create({
    name: 'deploy',
    pipeline: pipeline,
    label: 'deploy to GitHub Pages'
  });

  function pipeline(options) {
    return lazypipe()
        .pipe(tasks.util.filter('deploy.build', 'build/**'))
        .pipe(pages, {force: options.force});
  }
})();
