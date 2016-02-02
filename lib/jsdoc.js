(function() {
  'use strict';

  var _ = require('lodash');
  var chalk = require('chalk');
  var fs = require('fs');
  var path = require('path');
  var Promise = require('bluebird');
  var spork = require('spork');


  function jsdoc(options) {
    var releasesDir = _.get(options.paths, 'releases') ? path.resolve(options.paths.releases) : path.resolve(__dirname, '../releases');

    if (!options.quiet) {
      console.log(chalk.magenta('\nParsing documentation...'));

      if (_.isFinite(options.verbose) && options.verbose > 1) {
        console.log(chalk.bold.magenta('[DEVELOPER NOTE]:'), 'One of these child `jsdoc` processes dies and kills the parent process');
      }
    }

    return new Promise(function(resolve, reject) {
      var promises = [];

      var sourceDirs = _(fs.readdirSync(releasesDir))
          .map(function(dir) {
            return path.resolve(__dirname, '../releases', dir);
          })
          .value();

      _.each(sourceDirs, function(sourceDir) {
        promises.push(parse(sourceDir));
      });

      Promise.all(promises).then(function() {
        if (!options.quiet) {
          console.log(chalk.magenta('Done'));
        }

        resolve(options); // for chaining
      });
    });

    function parse(sourceDir) {
      return new Promise(function(resolve, reject) {
        var base = path.basename(sourceDir);
        var docsDir = _.get(options.paths, 'docs') ? path.resolve(options.paths.docs) : path.resolve(__dirname, '../docs');
        var args = _.union([sourceDir], ['--destination', docsDir + '/' + base]);

        var pathToJSDoc = _.get(options.paths, 'jsdoc') ? path.resolve(options.paths.jsdoc) : path.resolve(__dirname, '../node_modules/.bin/jsdoc');

        var child = spork(pathToJSDoc, args, {
          quiet: true,
          verbose: _.isFinite(options.verbose) && options.verbose > 1
        }, {exit: true});

        child.on('exit', function(code) {
          if (options.verbose && code === 0) {
            console.log('  - ' + chalk.bold.green('[SUCCESS]:'), 'Parsed', '\'' + chalk.magenta(sourceDir) + '\'');
          } else if (!options.quiet && code !== 0) {
            console.log('  - ' + chalk.bold.yellow('[WARNING]:'), 'Unable to fully parse', '\'' + chalk.magenta(base) + '\'');
          }

          resolve();
        });
      });
    }
  }

  module.exports = jsdoc;
})();
