(function() {
  'use strict';

  var _ = require('lodash');
  var chalk = require('chalk');
  var fs = require('fs');
  var inquirer = require('inquirer');
  var mkdirp = require('mkdirp');
  var path = require('path');
  var Promise = require('bluebird');
  var tildify = require('tildify');
  var cleanup = require('./cleanup');
  var github = require('./github');

  /**
   * Download one or more releases via the GitHub Tags API.
   *
   * @param {object} [options] - The configuration options that specify the behavior.
   * @param {string} [options.repo] - The repository to fetch tags from. If not specified, will be prompted.
   * @param {keep} [options.keep] - The path to store releases. If not set, will be stored in a tmp directory that is removed on success or failure.
   * @returns {bluebird Promise}
   *
   * @see https://developer.github.com/v3/git/tags/
   * @see bluebirdjs.com/docs/api-reference.html
   */
  function download(options) {
    options = options || {};
    var tmpDir = path.resolve(__dirname, './tmp');
    var releasesDir = options.keep || tmpDir;
    var verbose = _verbose();

    return determineReleases().then(downloadReleases).catch(function(err) {
      cleanup(options);
      throw err; // propagate the error to stop process execution
    });

    function determineReleases() {
      var getRepo = options.repo ? _.partial(Promise.resolve, options.repo) : promptForRepo;

      return getRepo().then(function(answer) {
        options.repo = answer;
        var url = '/repos/' + options.repo + '/tags';

        if (options.recent) {
          url += '?per_page=' + options.recent;
        }

        return github(url, {json: true});
      });
    }

    function downloadReleases(releases) {
      if (!options.quiet) {
        console.log(chalk.cyan('\nDownloading...'));
      }

      return Promise.all(_.map(releases, _.ary(downloadRelease, 1)))
          .then(function() {
            if (!options.quiet) {
              console.log(chalk.cyan('Done'));
            }

            return options; // For chaining
          });

      function downloadRelease(release) {
        var filepath = options.path || 'index.js';
        var endpoint = options.repo + '/' + release.commit.sha + '/' + filepath;
        var url = 'https://raw.githubusercontent.com/' + endpoint;

        var dest = path.resolve(releasesDir + '/' + release.name + '/' + filepath);
        mkdirp.sync(path.dirname(dest));

        var write = fs.createWriteStream(dest);
        var response = github(url, write);

        if (verbose) {
          console.log('  - ' + chalk.bold.blue('[INFO]:'), 'Downloading', '\'' + chalk.cyan(endpoint) + '\'');
        }

        return response.then(function() {
          if (verbose > 1) {
            console.log('  - ' + chalk.bold.green('[SUCCESS]:'), 'Downloaded to', '\'' + chalk.cyan(tildify(dest)) + '\'');
          }
        }).catch(function(err) {
          if (verbose > 1) {
            console.log('  - ' + chalk.bold.yellow('[WARNING]:'), 'Unable to download', '\'' + chalk.cyan(endpoint) + '\'');
            console.log(err.message);
          }
        });
      }
    }

    function promptForRepo() {
      return new Promise(function(resolve) {
        inquirer.prompt([{
          name: 'repo',
          message: 'Which repo? [org/repo]:',
          validate: _.partial(validate, 'username')
        }], function(answers) {
          resolve(answers.repo);
        });

        function validate(name, input) {
          if (_.isEmpty(input)) {
            return 'Invalid ' + name;
          }

          return true;
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

  module.exports = download;
})();
