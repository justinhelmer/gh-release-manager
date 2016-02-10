(function() {
  'use strict';

  var filter = require('gulp-filter');
  var layouts = require('metalsmith-layouts');
  var markdown = require('metalsmith-markdown');
  var metalsmith = require('gulp-metalsmith');
  var gulpApi = require('../gulpApi');

  function buildLayouts() {
    var files = ['source/**', '!source/layouts/**', '!source/partials/**'];
    var templateFilter = filter(['**/*.md', '**/*.html'], {restore: true});

    return gulpApi
        .src(files)
        .pipe(templateFilter)
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
        }))
        .pipe(templateFilter.restore);
  }

  module.exports = buildLayouts;
})();
