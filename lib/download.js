(function() {
  'use strict';

  // If not set, will be prompted
  var GITHUB_REPO = 'lodash/lodash';

  var _ = require('lodash');
  var chalk = require('chalk');
  var fs = require('fs');
  var inquirer = require('inquirer');
  var mkdirp = require('mkdirp');
  var path = require('path');
  var Promise = require('bluebird');
  var github = require('./github');

  function download(options) {
    options = options || {};
    var repo;
    var releasesDir = options.keep || path.resolve(__dirname, './tmp');
    var verbose = _verbose();

    return determineReleases().then(downloadReleases);

    function determineReleases() {
      var getRepo = GITHUB_REPO ? _.partial(Promise.resolve, GITHUB_REPO) : promptForRepo;

      return getRepo().then(function(answer) {
        repo = answer;
        var url = '/repos/' + repo + '/tags';

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
        var endpoint = repo + '/' + release.commit.sha + '/' + filepath;
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
            console.log('  - ' + chalk.bold.green('[SUCCESS]:'), 'Downloaded', '\'' + chalk.cyan(endpoint) + '\'');
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
