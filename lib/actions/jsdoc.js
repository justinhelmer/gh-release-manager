(function() {
  'use strict';

  var _ = require('lodash');
  var chalk = require('chalk');
  var fs = require('fs');
  var path = require('path');
  var Promise = require('bluebird');
  var spork = require('spork');

  /**
   * Parse downloaded release(s) for JSDoc headers, and output markdown files with the parsed documentation.
   *
   * @param {object} [options] - The configuration options that specify the behavior.
   * @param {*} [options.keep] - The location where the release files are kept. Defaults to the temp directory created by grm-download
   * @param {boolean} [options.quiet] - Output nothing (suppress STDOUT and STDERR).
   * @param {mixed} [options.verbose] - Output more information. Can be a boolean or number. true for more output; higher number (ie 2) for even more.
   * @returns {bluebird Promise}
   *
   * @see https://developer.github.com/v3/git/tags/
   * @see bluebirdjs.com/docs/api-reference.html
   */
  function jsdoc(options) {
    var releasesDir = options.keep || path.resolve(__dirname, './tmp');
    var promises = [];

    try {
      var releases = fs.readdirSync(releasesDir);
    } catch(err) {
      return Promise.reject(err);
    }

    _.each(releases, function(release) {
      promises.push(new Promise(function(resolve, reject) {
        var args = [
          releasesDir + '/' + release,
          '--configure', 'jsdoc.conf.json',
          '--destination', 'build/docs/' + release,
          '--encoding', 'utf8',
          '--recurse', true
        ];

        spork('./node_modules/.bin/jsdoc', args, {quiet: options.quiet, verbose: (options.verbose > 1 ? options.verbose : false)})
            .on('exit:code', function(code) {
              if (code === 0) {
                if (options.verbose) {
                  console.log('  -', chalk.bold.blue('[INFO]:'), 'Parsed documentation for release \'' + chalk.magenta(release) + '\'');
                }

                resolve();
              } else {
                reject(new Error('JSDoc failed'));
              }
            });
      }));
    });

    if (options.verbose || !options.quiet) {
      console.log(chalk.magenta('\nParsing documentation...'));
    }

    return Promise.all(promises).then(function() {
      if (options.verbose || !options.quiet) {
        console.log(chalk.magenta('Done'));
      }

      return options;
    });
  }

  module.exports = jsdoc;
})();
