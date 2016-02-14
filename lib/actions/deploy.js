(function() {
  'use strict';

  var _ = require('lodash');
  var chalk = require('chalk');
  var lazypipe = require('lazypipe');
  var pages = require('gulp-gh-pages');
  var wait = require('wait-stream');
  var through2 = require('through2');
  var flatten = require('../flatten');
  var tasks = require('../tasks');
  var write = process.stdout.write;
  var before;
  var done;

  module.exports = tasks.create({
    name: 'deploy',
    callback: callback,
    label: 'deployment'
  });

  function callback(options) {
    var pipeline = lazypipe();

    if (!options.release) {
      pipeline = pipeline
          .pipe(tasks.util.filter('deploy.build', 'build/**'))
          .pipe(flatten, 'build');
    }

    return pipeline
        .pipe(through2.obj, function(chunk, enc, cb) {
          if (!before) {
            if (!options.verbose) {
              process.stdout.write = _.noop;
            }

            before = true;
          }

          this.push(chunk);
          cb();
        })
        .pipe(pages, {force: options.force})
        .pipe(wait, 3000, {once: true})
        .pipe(through2.obj, function(chunk, enc, cb) {
          if (!done) {
            process.stdout.write = write;

            done = true;
          }

          this.push(chunk);
          cb();
        });
  }
})();
