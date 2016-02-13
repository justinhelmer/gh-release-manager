(function() {
  'use strict';

  function flatten(path, base) {
    base = base || 'source';
    path.dirname = path.dirname.replace(new RegExp('^' + base + '(.*)$'), '$1');
    return path;
  }

  module.exports = flatten;
})();