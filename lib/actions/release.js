(function() {
  'use strict';

  function release(options) {
    return require('./download')(options)
        .then(require('./jsdoc'))
        .then(require('./build'))
        .then(require('./deploy'));
  }

  module.exports = release;
})();
