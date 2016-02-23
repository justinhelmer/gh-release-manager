(function() {
  'use strict';

  var path = require('path');
  var sass = require('gulp-sass');

  function buildSass() {
    return sass({
      includePaths: ['source/css', path.resolve(__dirname, '../../node_modules/highlight.js/styles')]
    });
  }

  module.exports = buildSass;
})();
