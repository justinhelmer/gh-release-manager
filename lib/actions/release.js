(function() {
  'use strict';

  var _ = require('lodash');
  var gulpApi = require('../gulpApi');

  function release(options) {
    return require('./download')(options)
        .then(require('./jsdoc'))
        .then(require('./test'))
        .then(_.partial(gulpApi.runTasks, ['lint', 'build']))
        .then(require('./deploy'));
  }

  module.exports = release;
})();
