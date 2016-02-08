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
  var repoName = require('../repoName');
  var verbosity = require('../verbosity');

  /**
   * Parse downloaded release(s) for JSDoc headers, and output markdown files with the parsed documentation.
   *
   * @param {object} [options] - The configuration options that specify the behavior.
   * @param {string} [options.docs] - The path to output documentation. Defaults to docs.
   * @param {string} [options.head] - The path to a header markdown file that will be prepended to every file. If not set, will look in the current
   *                                  working directory for a file called 'docs-header.md'. The token '[release]' is replaced with the release name.
   * @param {*} [options.keep] - The location where the release files are kept. Defaults to the temp directory created by grm-download
   * @param {string} [options.path] - The release-relative path to the file that should be downloaded; defaults to index.js
   * @param {boolean} [options.quiet] - Output nothing (suppress STDOUT and STDERR).
   * @param {string} [options.repo] - The org/repo name, which is used for generating URLs within the documentation. If not set, will be prompted.
   * @param {mixed} [options.verbose] - Output more information. Can be a boolean or number. true for more output; higher number (ie 2) for even more.
   * @returns {bluebird Promise}
   *
   * @see https://developer.github.com/v3/git/tags/
   * @see bluebirdjs.com/docs/api-reference.html
   */
  function jsdoc(options) {
    options = options || {};
    var releasesDir = options.keep || path.resolve(__dirname, './tmp');
    var verbose = verbosity(options.verbose);

    return repoName(options).then(function(answer) {
      options.repo = answer;
      return parseAll();
    });

    function parse(filepath) {
      var docsDir = options.docs ? path.resolve(options.docs) : path.resolve('./docs');
      var markdownPath = docsDir + '/' + filepath;
      var markdownDir = path.dirname(markdownPath);
      markdownPath = markdownDir + '/index.md';
      var markdown;

      return convertToMarkdown().then(addHeader).then(store);

      function addHeader() {
        return getHeader().then(prependHeader);

        function getHeader() {
          return new Promise(function(resolve, reject) {
            var headPath = options.head ? path.resolve(options.head) : path.resolve('./docs-header.md');

            fs.readFile(headPath, function(err, head) {
              if (err && options.head) {
                reject(err); // supplied invalid head path
              } else if (err) {
                // Something else went wront; maybe docs-header.md doesn't exist. Continue but warn
                if (verbose > 1) {
                  console.log('  -', chalk.yellow('[WARNING]:'), err.message);
                }

                resolve();
              } else {
                // found head markdown
                resolve(head.toString('utf8'));
              }
            });
          });
        }

        function prependHeader(head) {
          if (head) {
            var release = markdownDir.slice(markdownDir.lastIndexOf('/') + 1);
            markdown = head.replace(/\[release\]/g, release) + markdown;
          }

          return markdown;
        }
      }

      function convertToMarkdown() {
        return new Promise(function(resolve, reject) {
          if (verbose) {
            console.log('  - ' + chalk.bold.blue('[INFO]:'), 'Parsing', '\'' + chalk.magenta(filepath) + '\'');
          }

          try {
            markdown = docdown({
              'path': releasesDir + '/' + filepath,
              'url': 'https://github.com/' + options.repo + '/blob/master/' + (options.path || 'index.js')
            });
          } catch (e) {
            reject(e);
          }

          resolve();
        });
      }

      function store(markdown) {
        return new Promise(function(resolve, reject) {
          mkdirp.sync(markdownDir);

          fs.writeFile(markdownPath, markdown, function(err) {
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
        });
      }
    }

    function parseAll() {
      var promises = [];

      if (!options.quiet) {
        console.log(chalk.magenta('\nParsing documentation...'));
      }

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
    }
  }

  module.exports = jsdoc;
})();
