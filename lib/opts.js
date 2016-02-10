(function() {
  'use strict';

  var _ = require('lodash');
  var chalk = require('chalk');
  var fs = require('fs');
  var path = require('path');
  var Promise = require('bluebird');
  var tildify = require('tildify');
  var verbosity = require('./verbosity');

  function opts(options) {
    return new Promise(function(resolve, reject) {
      options = options || {};
      var optsPath = path.resolve(options.opts || 'grm.opts');
      var verbose = verbosity(options.verbose);

      fs.readFile(optsPath, function(err, file) {
        if (err && options.opts) {
          reject(err); // supplied invalid opts path
        } else if (err) {
          // Something else went wront; maybe grm.opts doesn't exist. Continue but warn
          if (verbose > 1) {
            console.log(chalk.yellow('[WARNING]:'), err.message);
          }

          resolve(normalize(options));
        } else {
          // found grm.opts
          resolve(normalize(optsFile(file)));
        }
      });

      function optsFile(file) {
        var args = file.toString('utf8').split('\n');

        _.each(args, function(arg) {
          var kv = _.compact(arg.split(/\s+/));
          var key = (kv[0] || '').replace('--', '');
          var value = kv.length == 2 ? kv[1] : !_.startsWith(key, 'no-'); // simple flags should be represented as their boolean values

          if (key && _.isUndefined(options[normalizeKey(key)])) { // allow CLI args to override options from grm.opts
            options[key] = value;
          }
        });

        if (options.verbose) {
          console.log('\n' + chalk.bold.blue('[INFO]:'), 'Using options from \'' + chalk.blue(tildify(optsPath)) + '\'');
        }

        return options;
      }
    });
  }

  function normalize(options) {
    return _.transform(options, function(result, value, key) {
      result[normalizeKey(key)] = value;
    }, {});
  }

  function normalizeKey(key) {
    return _.camelCase(key.replace(/^no-(.+)$/, '$1'));
  }

  module.exports = opts;
})();
