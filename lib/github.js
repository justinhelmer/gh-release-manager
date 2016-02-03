(function() {
  'use strict';

  var _ = require('lodash');
  var chalk = require('chalk');
  var Promise = require('bluebird');
  var request = require('request');

  /**
   * Make a request to the github API, promisified.
   *
   * @param {string} url - The API URL. Does not need to include "https://api.github.com"
   * @param {mixed} [stream] - Optionally supply a writable stream for piping the response.
   * @param {object} [options] - Options to pass to the request. If stream is omitted, [options]
   *                             can be the second parameter to the function.
   * @returns {bluebird|exports|module.exports}
   * @see https://github.com/request/request
   */
  function github(url, stream, options) {
    var getCredentials;

    if (!_.isString(url)) {
      return Promise.reject(new Error('URL is required'));
    }

    if (url.indexOf('api.github.com') === -1) {
      url = 'https://api.github.com' + url;
    }

    return new Promise(function(resolve, reject) {
      var streaming = true;

      if (!isReadableStream(stream)) {
        options = stream;
        streaming = false;
      }

      options = _.extend({
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'justinhelmer/lodocs'
        }
      }, options || {});

      if (options.verbose) {
        console.log(chalk.bold.blue('GET'), url);
      }

      url += '?access_token=9a312b8fe188ac28fa629b35ef36d3952aac6c35'; // pulbic access token (no scope)
      if (streaming) {
        stream.on('close', resolve);
        request.get(url, options).pipe(stream);
      } else {
        request.get(url, options, fulfill);
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

  function isReadableStream(stream) {
    // unclear if this is reliable
    return _.get(stream, '_readableState.pipesCount');
  }

  module.exports = github;
})();
