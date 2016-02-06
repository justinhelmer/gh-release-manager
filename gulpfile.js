(function() {
  'use strict';

  var gulp = require('gulp');
  var eslint = require('gulp-eslint');

  gulp.task('lint', lint);

  function lint() {
    var files = ['*.js', '**/*.js', '!node_modules/**'];

    return gulp
        .src(files)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
  }
})();
