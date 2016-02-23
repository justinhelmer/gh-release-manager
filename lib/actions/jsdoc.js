(function() {
  'use strict';

  var chalk = require('chalk');
  var path = require('path');
  var parse = require('jsdoc-parse');
  var Promise = require('bluebird');
  var tasks = require('vinyl-tasks');
  var vfs = require('vinyl-fs');
  var parsed;
  var releasesDir;

  function jsdoc(options) {
    var jsdoc = tasks.create({
      name: 'jsdoc',
      hooks: hooks,
      callback: callback,
      chainable: false,
      color: 'magenta',
      label: 'documentation generation'
    });

    return jsdoc(options).then(generate);

    function callback(options) {
      return function() {
        return new Promise(function(resolve, reject) {
          parse({src: releasesDir + '/**/*.js'})
              .on('data', function(data) {
                parsed = data;
                resolve();
              })
              .on('error', function(err) {
                reject(err);
              });
        });
      };
    }

    function generate() {
      if (!parsed && options.verbose) {
        console.log('  -', chalk.bold.yellow('[WARNING]:'), 'No JSDoc headers to parse');
      }

      //console.log(parsed);

      // Should return a promise
      return Promise.resolve(parsed);
    }

    function hooks(options) {
      return {
        before: function before() {
          releasesDir = options.keep || path.resolve(__dirname, './tmp');

          if (options.verbose) {
            console.log('  -', chalk.bold.blue('[INFO]:'), 'Parsing releases at \'' + chalk.magenta(releasesDir) + '\'');
          }
        }
      }
    }
  }

  module.exports = jsdoc;
})();
