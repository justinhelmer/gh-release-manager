(function() {
  'use strict';

  var _ = require('lodash');
  var inquirer = require('inquirer');
  var Promise = require('bluebird');

  function repo(options) {
    options = options || {};

    if (options.repo) {
      return Promise.resolve(options.repo);
    }

    return promptForRepo();
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

  module.exports = repo;
})();
