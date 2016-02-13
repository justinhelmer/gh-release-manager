(function() {
  'use strict';

  var _ = require('lodash');
  var lazypipe = require('lazypipe');
  var pages = require('gulp-gh-pages');
  var rename = require('gulp-rename');
  var wait = require('wait-stream');
  var tasks = require('../tasks');
  var write = process.stdout.write;

  module.exports = tasks.create({
    name: 'deploy',
    hooks: hooks,
    pipeline: pipeline,
    label: 'deployment'
  });

  function hooks(options) {
    return {
      before: function before() {
        if (!options.verbose) {
          process.stdout.write = _.noop;
        }
      },

      done: function before() {
        process.stdout.write = write;
      }
    };
  }

  function pipeline(options) {
    var pipeline = lazypipe();

    if (!options.release) {
      pipeline = pipeline
          .pipe(tasks.util.filter('deploy.build', 'build/**'))
          .pipe(rename, flatten);
    }

    return pipeline
        .pipe(pages, {force: options.force})
        .pipe(wait, 3000);
  }

  function flatten(path) {
    path.dirname = path.dirname.replace(/^build(.*)$/, '$1');
    return path;
  }
})();
