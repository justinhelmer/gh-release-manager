(function() {
  'use strict';

  var sass = require('gulp-sass');

  function buildSass() {
    return sass({
      includePaths: ['source/css']
    });
  }

  module.exports = buildSass;
})();
