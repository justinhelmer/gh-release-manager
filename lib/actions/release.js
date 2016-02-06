(function() {
  'use strict';

  function release(options) {
    return require('./lint')(options)
        .then(require('./download'))
        .then(require('./jsdoc'))
        .then(require('./build'))
        .then(require('./deploy'));
  }

  module.exports = release;
})();
