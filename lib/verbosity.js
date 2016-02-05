(function() {
  'use strict';

  var _ =  require('lodash');

  function verbosity(level) {
    if (level === true || level === false) {
      return level;
    }

    var verbosity = parseInt(level);
    if (_.isFinite(verbosity)) {
      return verbosity;
    }

    return false;
  }

  module.exports = verbosity;
})();
