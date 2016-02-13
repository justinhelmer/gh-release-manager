(function() {
  'use strict';

  var _ = require('lodash');
  var tasks = require('../tasks');
  require('./build');

  function release(options) {
    var pipeline = require('./download')(options)
        .then(require('./jsdoc'))
        .then(require('./test'))
        .then(tasks.pipeline(['lint', 'build'], options));

    if (options.deploy !== false) {
      pipeline = pipeline.then(_.partial(require('./deploy'), options));
    }

    return pipeline;
  }

  module.exports = release;
})();
