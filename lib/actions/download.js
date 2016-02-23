(function() {
  'use strict';

  var _ = require('lodash');
  var chalk = require('chalk');
  var fs = require('fs');
  var inquirer = require('inquirer');
  var path = require('path');
  var Promise = require('bluebird');
  var tildify = require('tildify');
  var cleanup = require('../cleanup');
  var github = require('../github');
  var releaseRegExp = require('../releaseRegExp');
  var repoName = require('../repoName');

  /**
   * Download one or more releases via the GitHub Tags API.
   *
   * @param {object} [options] - The configuration options that specify the behavior.
   * @param {string} [options.keep] - The path to store releases. If not set, will be stored in a tmp directory that is removed on success or failure.
   * @param {string} [options.lib] - The release-relative path to the file that should be downloaded; defaults to index.js
   * @param {boolean} [options.quiet] - Output nothing (suppress STDOUT and STDERR).
   * @param {string} [options.repo] - The repository to fetch tags from. If not specified, will be prompted.
   * @param {number} [options.top] - The number of recent releases to fetch. If not specified, fetches the default amount.
   * @param {mixed} [options.verbose] - Output more information. Can be a boolean or number. true for more output; higher number (ie 2) for even more.
   * @returns {bluebird Promise}
   *
   * @see https://developer.github.com/v3/git/tags/
   * @see bluebirdjs.com/docs/api-reference.html
   */
  function download(options) {
    var tmpDir = path.resolve(__dirname, './tmp');
    var releasesDir = options.keep || tmpDir;

    return determineReleases().then(downloadReleases).catch(function(err) {
      cleanup(options);
      throw err; // propagate the error to stop process execution
    });

    function determineReleases() {
      var promises = [];

      return repoName(options).then(function(answer) {
        var pages = Math.ceil((options.top || 1) / 100);
        var top = options.top || 1;
        options.repo = answer;

        // GitHub API paging maxes out at 100/page, so multiple calls are necessary if requesting > 100 results.
        for (var page = 1; page <= pages; page++) {
          var perPage = (pages > 1) ? 100 : top;
          var url = '/repos/' + options.repo + '/tags?per_page=' + perPage + '&page=' + page;

          promises.push(github(url, _.extend({requestOptions: {json: true}}, options)).then(function(releases) {
            return _(releases)
                .filter(function(release) {
                  return release.name.match(releaseRegExp);
                })
                .slice(0, top)
                .value();
          }));
        }

        return Promise.all(promises).then(function(releaseSets) {
          var releases = [];

          _.each(releaseSets, function(releaseSet) {
            releases = _.union(releaseSet, releases);
          });

          return releases;
        });
      });
    }

    function downloadReleases(releases) {
      if (options.verbose || !options.quiet) {
        console.log(chalk.cyan('\nDownloading releases...'));
      }

      return Promise.all(_.map(releases, _.ary(downloadRelease, 1)))
          .then(function() {
            if (options.verbose || !options.quiet) {
              console.log(chalk.cyan('Done'));
            }

            return options; // For chaining
          });

      function downloadRelease(release) {
        var filepath = options.lib || 'index.js';
        var endpoint = release.commit.sha + '/' + filepath;
        var uri = options.repo + '/' + endpoint;
        var url = 'https://raw.githubusercontent.com/' + uri;

        var dest = path.resolve(releasesDir + '/' + release.name + '/' + filepath);
        var response = github(url, dest, options);

        if (options.verbose) {
          console.log('  -', chalk.bold.blue('[INFO]:'), 'Downloading', '\'' + chalk.cyan(endpoint) + '\'');
        }

        return response
            .then(function() {
              if (options.verbose > 1) {
                console.log('  -', chalk.bold.green('[SUCCESS]:'), 'Downloaded to', '\'' + chalk.cyan(tildify(dest)) + '\'');
              }
            })
            .catch(function(err) {
              if (options.verbose > 1) {
                console.log('  -', chalk.bold.yellow('[WARNING]:'), 'Unable to download', '\'' + chalk.cyan(endpoint) + '\'');
                console.log('              ', err.message);
              }
            });
      }
    }
  }

  module.exports = download;
})();
