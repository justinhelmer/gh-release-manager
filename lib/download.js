#!/usr/bin/env node
(function() {
  'use strict';

  // If not set, will be prompted
  var GITHUB_REPO = 'lodash/lodash';

  var _ = require('lodash');
  var chalk = require('chalk');
  var inquirer = require('inquirer');
  var path = require('path');
  var Promise = require('bluebird');
  var targz = require('tar.gz');
  var github = require('./github');

  function download(options) {
    options = options || {};
    var releases = [];
    var releasesDir = (options.path) ? path.resolve(options.path) : path.resolve(__dirname, '../releases');

    return determineReleases().then(downloadReleases);

    function determineReleases() {
      var getRepo = GITHUB_REPO ? _.partial(Promise.resolve, GITHUB_REPO) : promptForRepo;

      return getRepo().then(function(repo) {
        return github('/repos/' + repo + '/tags', {json: true}).then(parseTarballUrls);
      });

      function parseTarballUrls(body) {
        return _(body)
            .filter(function(release) {
              return release.name.match(/^v?\d+[\.\d]+$/); // allowed format(s): [v]X.X.X (i.e. 1.2.3 or v1.2.3)
            })
            .map(function(release) {
              releases.push(release);
              return release[_.snakeCase('tarballUrl')];
            })
            .value();
      }
    }

    function downloadReleases(tarballUrls) {
      if (!options.quiet) {
        console.log(chalk.cyan('\nDownloading & extracting...'));
      }

      return Promise.all(_.map(tarballUrls, _.ary(downloadRelease, 1)))
          .then(function() {
            if (!options.quiet) {
              console.log(chalk.cyan('Done'));
            }

            return options; // For chaining
          });

      function downloadRelease(tarballUrl) {
        var write = targz().createWriteStream(releasesDir);
        var response = github(tarballUrl, write, {gzip: true});

        if (options.verbose) {
          return response.then(function() {
            console.log('  - ' + chalk.bold.green('[SUCCESS]:'), 'Fully extracted', '\'' + chalk.cyan(tarballUrl) + '\'');
          });
        }

        return response;
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
  }

  module.exports = download;
})();
