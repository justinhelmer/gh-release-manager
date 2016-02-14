(function() {
  'use strict';

  var _ = require('lodash');
  var addsrc = require('gulp-add-src')
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
        .pipe(addsrc, 'build/**')
        .pipe(through2.obj, function(chunk, enc, cb) {
          if (!options.verbose) {
            process.stdout.write = _.noop;
          }

          this.push(chunk);
          cb();
        })
        .pipe(pages, {force: options.force})
        .pipe(wait, 3000, {once: true});
  }
})();
