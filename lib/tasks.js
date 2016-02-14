(function() {
  'use strict';

  var _ = require('lodash');
  var chalk = require('chalk');
  var gFilter = require('gulp-filter');
  var Orchestrator = require('orchestrator');
  var plumber = require('gulp-plumber');
  var Promise = require('bluebird');
  var vfs = require('vinyl-fs');

  var orchestrator = new Orchestrator();
  var write = process.stdout.write;
  var filters = {};
  var taskList = [];

  module.exports = {
    create: create,
    pipeline: pipeline,
    util: util()
  };

  /**
   * Create a task runner for the given task object.
   *
   * @param {object} task - The configuration options that define the task.
   * @param {string} task.name - The unique task name for identification.
   * @param {function} task.callback - The callback for performing all operations related to the task. Can be a generic callback or a lazy pipeline.
   * @param {boolean} [task.chainable] - If true, creates a new top-level vinyl stream from all files, except node modules. Defaults to true.
   * @param {string} [task.color] - The chalk color to use when logging certain characteristics about the task.
   * @param {object} [task.hooks] - An object containing hooks for tapping into the tasks workflow.
   * @param {function} [task.hooks.before] - A function run before the task callback, after validation is successful.
   * @param {function} [task.hooks.done] - A function run after the task callback successfully completes.
   * @param {function} [task.hooks.validate] - A function to validate whether or not the task should be run. Should return `true` or `false` to
   *                                           indicate whether or not to run the task. Can also return a bluebird promise that resolves with
   *                                           the value of `true` or `false`.
   * @param {string} [task.label] - The label to use when logging to identify the task action.
   * @param {boolean} [task.lazy] - If true, the callback is executed at runtime. Useful for creating tasks with lazypipe callbacks. Defaults to true.
   *
   * @return {function} - A runner for the task that can be invoked with [options] to modify the behavior per-run.
   * @see https://github.com/OverZealous/lazypipe
   * @see https://github.com/gulpjs/vinyl-fs#api
   */
  function create(task) {
    if (!_.isPlainObject(task)) {
      throw new Error('Invalid task:' + task);
    }

    if (!task.name) {
      throw new Error('Task must supply a name.');
    }

    if (!_.isFunction(task.callback)) {
      throw new Error('Task \'' + chalk.cyan(task.name) + '\' is missing an associated callback.');
    }

    // should default to true if not specified
    task.chainable = task.chainable !== false;
    task.lazy = task.lazy !== false;

    if (task.chainable === true && task.lazy === false) {
      throw new Error('Task \'' + chalk.cyan(task.name) + '\' is chainable, so it must be lazy.');
    }

    taskList.push(_.defaults(task, {
      color: 'cyan',
      hooks: _.noop
    }));

    return function(options) {
      var pipeline = task.chainable ? fullPipeline() : null;
      var callback;
      var runner;

      if (task.lazy) {
        callback = task.callback(options)();
      } else {
        callback = task.callback(options);
      }

      if (pipeline) {
        runner = function() {
          return pipeline.pipe(callback);
        };
      } else {
        runner = callback;
      }

      orchestrator.add(task.name, runner);

      return validateHook(task, options).then(function(dontSkip) {
        if (dontSkip) {
          if (!options.quiet) {
            console.log();
          }

          return start(task.name, options);
        }

        return Promise.reject(new Error('Unknown task ' + name));
      });
    };
  }

  /**
   * Creates a filter function that filters a vinyl stream when invoked. Additionally stores the filter in memory
   * for use with filter.restore.
   *
   * @name filter
   * @param {string} name - The name of the filter to create. Should be namespaced to avoid collisions.
   * @param {*} source - The source glob pattern(s) to filter the vinyl stream.
   * @param {object} [options] - The additional options to pass to gulp-filter.
   * @returns {function} - The partial that generates the vinyl filter when invoked.
   * @see https://github.com/sindresorhus/gulp-filter
   */
  function filter(name, source, options) {
    return function() {
      options = options || {};
      filters[name] = gFilter(source, options);
      return filters[name];
    };
  }

  /**
   * Restore a filter that was created through the filter() interface. Does not sanity check that the filter exists.
   *
   * @name restoreFilter
   * @param {string} name - The name of the filter to restore. must already exist.
   * @see https://github.com/sindresorhus/gulp-filter
   */
  function restoreFilter(name) {
    return function() {
      return filters[name].restore;
    };
  }

  filter.restore = restoreFilter;

  /**
   * Run a single continuous pipeline of multiple tasks, by piping the result stream from one task to the next.
   *
   * @name pipeline
   * @param {Array} taskNames - The list of task names to run, in the order to run them. All tasks must already be registered.
   * @param {object} [options] - The options made available to every task in the pipeline.
   * @return {function} - A function that when invoked, returns a promise which resolves if the pipeline completes successfuly,
   *                      or rejects if the pipeline fails at any point.
   */
  function pipeline(taskNames, options) {
    var promises = [];
    var tasks = [];
    var taskString = '';

    _.each(taskNames, function(name, idx) {
      var task = _.find(taskList, {name: name});
      promises.push(validateHook(task, options));
      tasks.push(task);

      if (idx !== (taskNames.length - 1)) {
        taskString += name + ', ';
      }
    });

    taskString += 'and ' + _.last(taskNames);

    return function() {
      return Promise.all(promises).then(function(include) {
        if (!options.quiet) {
          console.log('\n' + chalk.green('Creating a single pipeline for', taskString + '...'));
        }

        var included = _.filter(tasks, function(result, idx) {
          return include[idx];
        });

        orchestrator.add('pipeline', chain(included));

        _.each(tasks, function(task) {
          hook(task.name, '__pre', options);
          hook(task.name, 'before', options);
        });

        return start('pipeline', options, false).then(function() {
          _.each(tasks, function(task) {
            hook(task.name, 'done', options);
            hook(task.name, '__post', options);
          });
        });
      });
    };

    /**
     * Create the pipeline chain for the provided tasks.
     *
     * @name chain
     * @param {Array} tasks - The list of task objects to chain callbacks.
     * @return {Function} - A function that when invoked, runs the entire pipeline and returns the vinyl stream.
     */
    function chain(tasks) {
      return function() {
        var pipeline = fullPipeline();

        _.each(tasks, function(task) {
          pipeline = pipeline.pipe(task.callback(options)());
        });

        return pipeline;
      };
    }
  }

  /**
   * Handle errors that are thrown at any point in a vinyl stream lifecycle.
   *
   * @name errorHandler
   * @param {Error} err - The error object.
   */
  function errorHandler(err) {
    process.stdout.write = write;
    orchestrator.emit('error', err);
  }

  /**
   * Generic interface for hooking into task registration/execution workflow.
   *
   * @name hook
   * @param {string} name - The name of the task.
   * @param {string} op - The hook operation. Possible values: 'before', 'done', and 'validate'.
   * @param {object} [options] - The task run options, passed to the hook callback function for use by the task.
   */
  function hook(name, op, options) {
    var task = _.find(taskList, {name: name});

    if (!task) {
      if (options.verbose > 1) {
        console.log('  -', chalk.bold.yellow('[WARNING]:'), 'Task \'' + chalk.cyan(name) + '\' does not exist');
      }
    } else {
      var hook = _.get(task.hooks(options), op) || hooks(task)[op];

      if (_.isFunction(hook)) {
        hook(options);
      }
    }
  }

  function hooks(task) {
    return {
      __pre: function __pre(options) {
        if (!options.quiet) {
          console.log(chalk[task.color]('Running', (task.label || task.name) + '...'));
        }
      },

      __post: function __post(options) {
        if (!options.quiet) {
          console.log(chalk[task.color]('Done'));
        }
      }
    }
  }

  /**
   * Identify whether or not the passed-in argument is a promise.
   *
   * @name isPromise
   * @param {*} func - The argument to check for promise-ness.
   * @return {boolean} - Returns `true` if [func] is a promise, else `false`.
   */
  function isPromise(func) {
    return _.isFunction(_.get(func, 'then'));
  }

  /**
   * Generate a new top-level pipeline containing all files, and attach a common error handler.
   *
   * @name fullPipeline
   * @return {stream} - The vinyl stream.
   * @see https://github.com/gulpjs/vinyl-fs#srcglobs-options
   * @see https://github.com/floatdrop/gulp-plumber
   */
  function fullPipeline() {
    return vfs.src([
      '**/*',
      '!build/**',
      '!node_modules/**',
      '!source/layouts/**',
      '!source/partials/**'
    ]).pipe(plumber({errorHandler: errorHandler}));
  }

  /**
   * Promisify the execution of an orchestrator task. Listens to orchestrator events to fulfill/reject the promise.
   *
   * @name start
   * @param {string} name - The name of the task to run.
   * @param {object} [options] - Options passed to the task runner. Uses options.verbose and options.quiet
   * @param {boolean} [hooks=true] - Whether or not to execute the hooks for the task. defaults to true.
   * @return {promise} - Resolves if the task completes successfuly, rejects with the error object if the task fails.
   * @see https://github.com/robrich/orchestrator#event
   */
  function start(name, options, hooks) {
    options = options || {};
    hooks = hooks !== false; // default to true if not explicitly set to false

    if (hooks) {
      hook(name, '__pre', options);
      hook(name, 'before', options);
    }

    return new Promise(function(resolve, reject) {
      if (!options.verbose && options.quiet) {
        process.stdout.write = _.noop;
      }

      orchestrator.start(name, function(err) {
        process.stdout.write = write;

        if (err) {
          reject(err);
        } else {
          if (hooks) {
            hook(name, 'done', options);
            hook(name, '__post', options);
          }

          resolve();
        }
      });
    });
  }

  function util() {
    return {
      filter: filter,
      start: start
    };
  }

  /**
   * Hook executed before task is run.
   *
   * Validate whether or not the task should be run. Should return `true` or `false` to indicate whether or not to run the task.
   * Can also return a bluebird promise that resolves with the value of `true` or `false`.
   *
   * @name validateHook
   * @param {object} task - The task object.
   * @param {object} [options] - Options passed to the task runner. Uses options.verbose.
   * @return {bluebird promise} - Resolves with `true` if the task validation succeeds, or `false` if the task validation fails.
   */
  function validateHook(task, options) {
    if (!task) {
      if (options.verbose) {
        console.log('  -', chalk.bold.yellow('[WARNING]:'), 'Task \'' + chalk.cyan(name) + '\' does not exist');
      }

      return Promise.resolve(false);
    }

    return new Promise(function(resolve, reject) {
      var hooks = task.hooks(options) || {};

      if (hooks.validate) {
        var result = hooks.validate();

        if (isPromise(result)) {
          result.then(function(result) {
            resolve(result !== false); // undefined should represent truthy
          });
        } else {
          resolve(result);
        }
      } else {
        resolve(true);
      }
    });
  }
})();
