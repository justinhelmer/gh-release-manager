(function() {
  'use strict';

  var layouts = require('metalsmith-layouts');
  var markdown = require('metalsmith-markdown');
  var metalsmith = require('gulp-metalsmith');
  var gulpApi = require('../gulpApi');

  function buildLayouts() {
    var files = ['source/**', '!source/layouts/**', '!source/partials/**'];

    return gulpApi
        .src(files)
        .pipe(metalsmith({
          use: [
            markdown(),
            layouts({
              engine: 'handlebars',
              default: 'page.html',
              directory: 'source/layouts',
              partials: 'source/partials',
              pattern: '**/*.html'
            })
          ]
        }));
  }

  module.exports = buildLayouts;
})();
