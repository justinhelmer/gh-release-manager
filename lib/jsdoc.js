(function() {
  'use strict';

  var _ = require('lodash');
  var chalk = require('chalk');
  var docdown = require('docdown');
  var fs = require('fs');
  var mkdirp = require('mkdirp');
  var path = require('path');
  var Promise = require('bluebird');
  var tildify = require('tildify');

  function jsdoc(options) {
    options = options || {};
    var releasesDir = options.keep || path.resolve(__dirname, './tmp');
    var verbose = _verbose();

    if (!options.repo) {
      return Promise.reject(new Error('Cannot parse documentation without a release name'));
    }

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
        var docsDir = options.docs ? path.resolve(options.docs) : path.resolve('./docs');
        var markdownPath = docsDir + '/' + filepath.slice(0, filepath.length - 2) + 'markdown';
        var markdownDir = path.dirname(markdownPath);
        var release = markdownDir.slice(markdownDir.lastIndexOf('/') + 1);

        if (verbose) {
          console.log('  - ' + chalk.bold.blue('[INFO]:'), 'Parsing', '\'' + chalk.magenta(filepath) + '\'');
        }

        var markdown = docdown({
          'path': releasesDir + '/' + filepath,
          'url': 'https://github.com/' + options.repo + '/blob/master/' + (options.path || 'index.js')
        });

        var headPath = options.head ? path.resolve(options.head) : path.resolve('./docs-header.md');

        fs.readFile(headPath, function(err, head) {
          if (err) {
            if (verbose > 1) {
              console.log('  - ' + chalk.bold.yellow('[WARNING]:'), 'Unable to read head from', '\'' + chalk.magenta(tildify(headPath)) + '\'');
            }

            reject(err);
          } else {
            writeHeaderAndStore(head.toString('utf8'));
          }
        });

        function writeHeaderAndStore(head) {
          if (head) {
            markdown = head.replace(/\[release\]/g, release) + markdown;
          }

          mkdirp.sync(markdownDir);
          fs.writeFile(markdownPath.replace('lodash.markdown', 'index.markdown'), markdown, function(err) {
            if (err) {
              if (verbose > 1) {
                console.log('  - ' + chalk.bold.yellow('[WARNING]:'), 'Unable to fully parse to', '\'' + chalk.magenta(tildify(markdownDir)) + '\'');
              }

              reject(err);
            } else {
              if (verbose > 1) {
                console.log('  - ' + chalk.bold.green('[SUCCESS]:'), 'Fully parsed to', '\'' + chalk.magenta(tildify(markdownDir)) + '\'');
              }

              resolve();
            }
          });
        }
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
