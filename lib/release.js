(function() {
  'use strict';

  function release(options) {
    return require('./download')(options).then(require('./jsdoc'));
  }

  module.exports = release;
})();
