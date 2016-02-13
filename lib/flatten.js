(function() {
  'use strict';

  var rename = require('gulp-rename');

  function flatten(base) {
    return rename(function(path) {
      base = base || 'source';
      path.dirname = path.dirname.replace(new RegExp('^' + base + '(.*)$'), '$1');
      return path;
    });
  }

  module.exports = flatten;
})();