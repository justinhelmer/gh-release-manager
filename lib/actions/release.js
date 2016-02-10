(function() {
  'use strict';

  var _ = require('lodash');
  var gulpApi = require('../gulpApi');

  function release(options) {
    var pipeline = require('./download')(options)
        .then(require('./jsdoc'))
        .then(require('./test'))
        .then(_.partial(gulpApi.runTasks, ['lint', 'build']));

    if (options.deploy !== false) {
      pipeline = pipeline.then(require('./deploy'));
    }

    return pipeline;
  }

  module.exports = release;
})();
