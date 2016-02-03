(function() {
  'use strict';

  var _ = require('lodash');
  var chalk = require('chalk');
  var docdown = require('docdown');
  var fs = require('fs');
  var mkdirp = require('mkdirp');
  var path = require('path');
  var Promise = require('bluebird');

  function jsdoc(options) {
    options = options || {};
    var releasesDir = options.keep || path.resolve(__dirname, './tmp');
    var verbose = _verbose();

    if (!options.quiet) {
      console.log(chalk.magenta('\nParsing documentation...'));
    }

    var promises = [];

    var paths = _(fs.readdirSync(releasesDir))
        .map(function(dir) {
          return dir + '/' + (options.path || 'index.js');
        })
        .value();

    _.each(paths, function(path) {
      promises.push(parse(path));
    });

    return Promise.all(promises).then(function() {
      if (!options.quiet) {
        console.log(chalk.magenta('Done'));
      }

      return options; // for chaining
    });

    function parse(filepath) {
      return new Promise(function(resolve, reject) {
        var docsDir = options.docs ? path.resolve(options.docs) : path.resolve(__dirname, '../docs');
        var markdownPath = docsDir + '/' + filepath.slice(0, filepath.length - 2) + 'markdown';

        if (verbose) {
          console.log('  - ' + chalk.bold.blue('[INFO]:'), 'Parsing', '\'' + chalk.magenta(filepath) + '\'');
        }

        var markdown = docdown({
          'path': releasesDir + '/' + filepath,
          'url': 'https://github.com/lodash/lodash/blob/master/lodash.js'
        });

        mkdirp.sync(path.dirname(markdownPath));
        fs.writeFile(markdownPath, markdown, function(err) {
          if (err) {
            if (verbose > 1) {
              console.log('  - ' + chalk.bold.green('[SUCCESS]:'), 'Fully parsed', '\'' + chalk.magenta(filepath) + '\'');
            }

            reject(err);
          } else {
            if (verbose > 1) {
              console.log('  - ' + chalk.bold.yellow('[WARNING]:'), 'Unable to fully parse', '\'' + chalk.magenta(filepath) + '\'');
            }

            resolve();
          }
        });
      });
    }

    function _verbose() {
      if (options.verbose === true || options.verbose === false) {
        return options.verbose;
      }

      var verbose = parseInt(options.verbose);
      if (_.isFinite(verbose)) {
        return verbose;
      }

      return false;
    }
  }

  module.exports = jsdoc;
})();
