(function() {
  'use strict';

  var _ = require('lodash');
  var tasks = require('vinyl-tasks');
  require('./build');

  function release(options) {
    var pipeline = ['lint', 'build'];
    options.release = true;

    if (options.deploy !== false) {
      pipeline.push('deploy');
    }

    return require('./download')(options)
        .then(require('./jsdoc'))
        .then(require('./test'))
        .then(tasks.pipeline(pipeline, options));
  }

  module.exports = release;
})();
