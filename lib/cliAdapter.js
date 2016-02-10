(function() {
  'use strict';

  var _ = require('lodash');
  var chalk = require('chalk');
  var cjsErr = require('commander.js-error');
  var program = require('commander');

  var exit = require('./exit');
  var grm = require('../index');
  var opts = require('./opts');
  var verbosity = require('./verbosity');

  var map = {
    b: {
      long: 'build',
      helpArgs: ['-b, --build [path]', 'the path to a module that runs custom build tasks']
    }, d: {
      long: 'docs',
      helpArgs: ['-d, --docs [path]', 'the path to output documentation; defaults to docs']
    }, h: {
      long: 'head',
      helpArgs: ['-h, --head [path]', 'path to header markdown file to prepend to all docs']
    }, k: {
      long: 'keep',
      helpArgs: ['-k, --keep [path]', 'the path to keep releases; else they are removed']
    }, l: {
      long: 'lib',
      helpArgs: ['-l, --lib [path]', 'release-relative path to the file; assumes index.js']
    }, o: {
      long: 'opts',
      helpArgs: ['-o, --opts [path]', 'the path to a conf file; cli args take precedence']
    }, p: {
      long: 'port',
      helpArgs: ['-p, --port <n>', 'the port number for serving the website; defaults to 3000']
    }, q: {
      long: 'quiet',
      helpArgs: ['-q, --quiet', 'output nothing (suppress STDOUT and STDERR)']
    }, r: {
      long: 'repo',
      helpArgs: ['-r, --repo [repo]', 'in the format \'org/repo\'; if not set, will be prompted']
    }, t: {
      long: 'top',
      helpArgs: ['-t, --top <n>', 'only download the top <n> most recent releases']
    }, u: {
      long: 'url-base',
      helpArgs: ['-u, --url-base [base]', 'the url base for serving files; added as metadata']
    }, v: {
      long: 'verbose',
      helpArgs: ['-v, --verbose [n]', 'true for more output; higher number (ie 2) for even more', false]
    }
  };

  function cliAdapter(name, description, shorts) {
    program.description('Description:\n\n    ' + description);
    shorts = shorts || [];
    shorts.push('q', 'o', 'v');
    _.uniq(shorts);

    // initialize the options
    _.each(shorts, function(short) {
      program.option.apply(program, map[short].helpArgs);
    });

    // parse the options
    program.parse(process.argv);

    // prepare the options then execute
    prepare(shorts).then(_.partial(execute, name)).done();
  }

  function execute(name, options) {
    var verbose = verbosity(options.verbose);

    return grm(name, _.extend(options, {checkForOpts: false}))
        .then(function() {
          if (verbose || !options.quiet) {
            console.log('\n' + chalk.green('Success') + '; exiting.');
          }

          process.exit();
        })
        .catch(function(err) {
          if (verbose || !options.quiet) {

            if (verbose > 1 && err.stack) {
              console.error(chalk.red(err.stack));
            } else {
              console.error(chalk.red(err.message));
            }
          }

          process.exit(1);
        });
  }

  function prepare(shorts) {
    var options = {};

    _.each(shorts, function(short) {
      var option = map[short].long;
      var value = program[option];

      /**
       * When used via the CLI, there is a risk of `--opts` not being valid. When set, everything is great. It is great
       * because it overrides default behavior from Commander.prototype.opts: https://github.com/tj/commander.js/blob/master/index.js#L733
       *
       * However, when it is not, the property should be ignored. This is easily identifiable.
       * Maybe not the best idea to use `--opts`, but it is cohesive with other libs (i.e. mocha).
       */
      if (option === 'opts' && _.isFunction(value)) {
        value = false;
      }

      options[option] = value;
    });

    return opts(options);
  }

  require('node-clean-exit')();
  module.exports = cliAdapter;
})();
