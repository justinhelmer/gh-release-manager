(function() {
  'use strict';

  var _ = require('lodash');
  var chalk = require('chalk');
  var fs = require('fs');
  var mkdirp = require('mkdirp');
  var path = require('path');
  var Promise = require('bluebird');
  var request = require('request');
  var verbosity = require('./verbosity');

  /**
   * Make a request to the github API, promisified.
   *
   * @param {string} url - The API URL. Does not need to include "https://api.github.com"
   * @param {mixed} [dest] - Optionally supply the path to open a writable dest for piping the response.
   * @param {object} [options] - Options to modify the behavior. If dest is omitted, [options]
   *                             can be the second parameter to the function.
   * @returns {bluebird|exports|module.exports}
   * @see https://github.com/request/request
   */
  function github(url, dest, options) {
    var getCredentials;

    if (_.isObject(dest)) {
      options = dest;
      dest = null;
    }

    options = options || {};
    var verbose = verbosity(options.verbose);

    if (!_.isString(url)) {
      return Promise.reject(new Error('URL is required'));
    }

    if (url.indexOf('http') === -1) {
      url = 'https://api.github.com' + url;
    }

    return new Promise(function(resolve, reject) {
      var requestOptions = _.extend({
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'justinhelmer/lodocs'
        }
      }, options.requestOptions || {});

      var separator = url.indexOf('?') === -1 ? '?' : '&';
      url += separator + 'access_token=9a312b8fe188ac28fa629b35ef36d3952aac6c35'; // pulbic access token (no scope)

      if (dest) {
        var r = request.get(url, requestOptions)
            .on('response', function(resp) {
              if (resp.statusCode === 200) {
                r.pipe(stream(dest, resolve));
              } else {
                reject(new Error('Request responded with a \'' + chalk.cyan(resp.statusCode) + '\''));
              }
            });
      } else {
        request.get(url, requestOptions, fulfill);
      }

      function fulfill(err, resp, body) {
        var statusCode = _.get(resp, 'statusCode');

        if (err) {
          reject(err);
        } else if (statusCode < 200 || statusCode > 299) {
          reject(new Error(_.get(body, 'message') || body));
        } else {
          resolve(body);
        }
      }
    });
  }

  function stream(dest, resolve) {
    mkdirp.sync(path.dirname(dest));
    var stream = fs.createWriteStream(dest);

    stream.on('close', resolve);
    return stream;
  }

  module.exports = github;
})();
