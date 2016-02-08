(function() {
  'use strict';

  var _ = require('lodash');
  var chalk = require('chalk');
  var gulp = require('gulp');
  var plumber = require('gulp-plumber');
  var Promise = require('bluebird');
  var taskList = [];

  /**
   * Register a Gulp task for use programmatically.
   *
   * @param {object} task - The configuration options that define the task.
   * @param {function} task.name - The unique task name for identification.
   * @param {function} task.gulp - The gulp task function to run.
   * @param {function} [task.before] - A function to run before the gulp task. Can return `false`,
   *                                    or a bluebird promise that resolves with the value of `false`, to cancel the run.
   * @param {function} [task.done] - A function to run after the gulp task completes successfully.
   */
  function registerTask(task) {
    task = task || {};

    if (taskList[task.name]) {
      throw new Error('Task \'' + chalk.cyan(task.name) + '\' has already been registered.');
    }

    if (!_.isFunction(task.gulp)) {
      throw new Error('Task \'' + chalk.cyan(task.name) + '\' is missing an associated gulp task');
    }

    taskList.push(task);
    gulp.task(task.name, task.gulp);
  }

  function errorHandler(err) {
    gulp.emit('error', err);
  }

  function runner(task, options) {
    return before().then(runGulp).then(done);

    /**
     * Each task can register a "before" function to execute at the beginning of an aggregate pipeline. All "before" functions are executed
     * before any Gulp task is run.
     *
     * The "before" function can return `false` to prevent the execution of the Gulp task. It can additionally return a Bluebird promise, which
     * is invoked and the fulfillment value is checked for `false`.
     */
    function before() {
      if (!task.before) {
        return Promise.resolve(false);
      }

      var func = task.before(options);
      if (func instanceof Promise) {
        return func.then(function(result) {
          return result === false;
        });
      }

      return Promise.resolve(false);
    }

    function runGulp(skip) {
      return new Promise(function(resolve, reject) {
        if (skip) {
          resolve(options);
        } else {
          gulp.on('stop', function() {
            resolve(options);
          });

          gulp.on('error', function(err) {
            reject(err);
          });

          gulp.start(task.name);
        }
      });
    }

    /**
     * Each task can register an "after" function to execute after a gulp task successfully completes. The task will be fulfilled with the
     * value returned by "after". It can additionally return a Bluebird promise, in which case the task will resolve with the fulfillment
     * value of the promise.
     *
     * This is useful for performing post-actions (i.e. logging output) or resolving with a specific value to propagate through a promise chain.
     */
    function done() {
      if (!task.done) {
        return Promise.resolve(options);
      }

      var result = task.done(options);

      if (result instanceof Promise) {
        return result.then(function(result) {
          return result;
        });
      }

      return Promise.resolve(result);
    }
  }

  function runTask(taskToRun, options) {
    return runTasks(taskToRun, options);
  }

  function runTasks(tasksToRun, options) {
    tasksToRun = _.isArray(tasksToRun) ? tasksToRun : [tasksToRun];
    var before = [];
    var run = [];

    for (var i = 0; i < tasksToRun.length; i++) {
      var name = tasksToRun[i];
      var task = _.find(taskList, {name: name});

      if (!task) {
        return Promise.reject(new Error('Task \'' + chalk.cyan(name) + '\' does not exist.'));
      }

      run.push(runner(task, options));
    }

    return Promise.all(run).then(function() {
      return options;
    });
  }

  function src(files) {
    return gulp
        .src(files)
        .pipe(plumber({errorHandler: errorHandler}));
  }

  module.exports = {
    runTask: runTask,
    runTasks: runTasks,
    registerTask: registerTask,
    src: src
  }
})();
