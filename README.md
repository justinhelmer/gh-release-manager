# GitHub Release Manager
Download releases, generate documentation, build website, deploy, relax.

[![npm package](https://badge.fury.io/js/gh-release-manager.svg)](https://www.npmjs.com/package/gh-release-manager)
[![node version](https://img.shields.io/node/v/gh-release-manager.svg?style=flat)](http://nodejs.org/download/)
[![dependency status](https://david-dm.org/justinhelmer/gh-release-manager.svg)](https://github.com/justinhelmer/gh-release-manager)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/justinhelmer/gh-release-manager/issues)
[![devDependency status](https://david-dm.org/justinhelmer/gh-release-manager/dev-status.svg)](https://github.com/justinhelmer/gh-release-manager)

The `GitHub Release Manager` automates the process of building a website and documenting `APIs` for any `GitHub` project. With a **_single command_**, you can run _any_ or _all_ of the following:

1. Download all recent releases ([tags](https://developer.github.com/v3/git/tags/)) by fetching them via the [GitHub API](https://developer.github.com/v3/).
2. Parse the [JSDoc](http://usejsdoc.org/) documentation of all latest releases and generate a customizable template for navigating any or all available releases.
3. Run a code quality check using [ESLint](http://eslint.org/docs/user-guide/getting-started), by simply creating an `ESLint` configuration file.
4. Run any custom defined `test` routine by running [npm test](https://docs.npmjs.com/cli/test).
5. Use [Metalsmith](http://www.metalsmith.io/) to build a full-fledged website from [markdown](https://github.com/chjj/marked) files, [handlebars](http://handlebarsjs.com/) templates, [libSass](http://sass-lang.com/libsass), and more.
6. Deploy to [GitHub Pages](https://pages.github.com/).

Much of this is done through a single [vinyl](https://github.com/gulpjs/vinyl-fs) file stream (built on top of [Gulp](http://gulpjs.com/), for maximum peformance. It also provides an interface for running [custom build operations](#custom-build-tasks) and/or validating/preventing the build.

<p align="center">
  <img alt="console output" src="https://raw.githubusercontent.com/justinhelmer/gh-release-manager/master/grm.jpg" />
</p>

Additionally, `GRM` allows you to [serve](#grm-serve1) the website for debugging / development using [Browsersync](https://browsersync.io/).

## Installation

`GitHub Release Manager` (`GRM`) can be installed _locally_ or _globally_, and includes both a [node interface](#node-interface) and a command-line interface ([CLI](#cli)). It also includes a [CLI adapter](#cli-adapter) to easily integrate the [node interface](#node-interface) into any existing `node`-based command-line program.

### Install globally

```bash
$ npm install --global gh-release-manager   # avalable everywhere 
```

### Install locally

```bash
$ npm install --save gh-release-manager

# optionally link the script to node_modules/gh-release-manager
# (does NOT install the module globally)
$ cd node_modules/gh-release-manager && npm link
```

## Usage

There are **three** ways to interface with the `GitHub Release Manager`:

1. Using the [command-line interface](#cli)
2. Using the [node interface](#node-interface)
3. Using the [CLI adapter](#cli-adapter)

There is also a long list of [options](#common-options) that can be used to customize the behavior.

## CLI

The package name (`gh-release-manager`) is also the command when using the `CLI`. However, `GRM` also uses [node-alias](https://github.com/justinhelmer/node-alias) to set up a _short_ command, `grm`.

Additionally, each [option](#common-options) has a [short option format](#short-option-format) that is compatible with the `CLI`.

### Using the CLI

Display the contents of the manual:

```bash
$ grm help
```

Do it all in one go:

```bash
$ grm
```

Or, run one of the [sub commands](#sub-commands).

### Sub commands

Although it is often most convenient to [do it all in one go](#usage), there may be a use case that involves running the steps individually (i.e. debugging, [serving](#grm-serve1), etc). For that reason, `GRM` is a collection of sub commands (or just simply `"commands"`). By default, if no `[command]` is specified, [grm-release(1)](#grm-release1) is run.

Every command has a `help` file. Simply run:

```bash
$ grm help [command]
```

This will display the information about the command, including all of the available [options](#common-options) for that command.

#### grm-build(1)

> Use [Metalsmith](http://www.metalsmith.io/) to build a full-fledged website from [markdown](https://github.com/chjj/marked) files, [handlebars](http://handlebarsjs.com/) templates, [libSass](http://sass-lang.com/libsass), and more.

```bash
$ grm build
```

**available [options](#common-options):** [_opts_](#opts), [_build_](#build), [_quiet_](#quiet), [_urlBase_](#urlbase), [_verbose_](#verbose)

`GRM` includes a bundle of tools for dynamically building a website; similar to popular tools like [Jekyll](https://jekyllrb.com/). However, the toolset provided in `GRM` is much more powerful, as it is built on top of [Metalsmith](http://www.metalsmith.io/). It runs purely in `node`, so there is no extra `Ruby` dependency. It also integrates seamlessly with the `vinyl` pipeline for exceptional performance.

To take advantage of this toolset, get familiar with [Handlebars](http://handlebarsjs.com/) which is used as the templating engine, and [Sass](http://sass-lang.com/) which is the included `CSS` preprocessor.

Then, all you need to do is to start creating files according to the expected directory structure:

```
- node_modules
    - gh-release-manager    # this module
- source                    # any .md files can be placed in source/**
    - css                   # all scss files go here
    - layouts               # all handlebars templates go here
    - partials              # all handlebars partials go here
- .eslintrc.js              # see grm-lint(1)
- grm.opts                  # see grm.opts()
- grm.metadata.json         # global template metadata (see below)
```

The `markdown` files will also be parsed for [YAML Front Matter](https://github.com/dworthen/js-yaml-front-matter), and the data is passed to the template and made available to `handlebars`. Additionally, the following `Front Matter` attribute(s) have special meaning:

```
---
layout: page.html           # from source/layouts - defaults to page.html
---
```

Finally, the following data is made available to all `Handlebars` templates:

- `content` - Contains the [marked](https://github.com/chjj/marked)-generated `HTML`. Should use triple-brackets (i.e. `{{{content}}}`) to [escape HTML](http://handlebarsjs.com/#html-escaping).
- `site` - A merged object containing:
    - All global template [metadata](https://github.com/segmentio/metalsmith-metadata) read from the `grm.metadata.json` file in the _project root_.
    - `urlBase`, if set by [options.urlBase](#urlbase). Useful for generating url prefixes, i.e. `{{site.urlBase}}/images.png`
    
    > If the `grm.metadata.json` file does not exist, and [options.urlBase](#urlbase) is not set, `site` will be `undefined`.

Example `grm.metadata.json`:

```js
{
  "title": "Lodash.com"
}
```

...and an example usage, in a custom `head.html`:

```html
<!-- If 'title' is set in the 'Front Matter' for the page,
    use it and the global 'site.title' from 'grm.metadata.json' -->

<title>{{#if title}}{{title}} | {{site.title}}{{else}}{{site.title}}{{/if}}</title>
```

Also, [custom build](#custom-build-tasks) tasks can be automated and included in the pipeline when `build` is run.

Additionally, all `markdown` files are parsed for code blocks using [highlight.js](https://highlightjs.org/). There are [over 65 themes](https://highlightjs.org/static/demo/) to choose from. The import path for all `highlight.js` styles is included in the `build` process, so simply import the theme you want by name in your `SCSS/CSS` file, i.e.:

```css
@import 'github-gist';
```

See the [lodash.github.io](https://github.com/justinhelmer/lodash.github.io) project for an example implementation of `gh-release-manager`.

#### grm-deploy(1)

> Deploy the build directory to `gh-pages`.

```bash
$ grm deploy
```

**available [options](#common-options):** [_opts_](#opts), [_quiet_](#quiet), [_verbose_](#verbose)

The final step of the [release](#grm-release1) routine. Uses [GitHub Pages](https://pages.github.com/) for deployment. Pushes the `build/` folder to `gh-pages`. Assumes the _current working directory_ is a `Git` repository, and uses its remote url.

#### grm-download(1)

> Download recent releases via the [GitHub Tags API](https://developer.github.com/v3/git/tags/).

```bash
$ grm download
```

**available [options](#common-options):** [_opts_](#opts), [_keep_](#keep), [_lib_](#lib), [_quiet_](#quiet), [_repo_](#repo), [_top_](#top), [_verbose_](#verbose)

1. The [[top]](#top) most recent releases are fetched from [[repo]](#repo).
2. The full set of releases is filtered to only include "stable" releases (in the format `/^[vV]?\d+\.\d+\.\d+$/`, i.e. `v1.0.0` or `1.0.0`).
3. The files located at [[lib]](#lib) (relative to the repo) are stored in [[keep]](#keep) (if provided), each in a subdirectory named after the release (i.e. `[keep]/1.0.0`).

- If `[keep]` is not provided, `GRM` will store the downloaded files in a temporary directory that is deleted after success or failure.
- If `[lib]` is not provided, `GRM` will assume the file to be stored is located at `[project root]/index.js`.
- If `[repo]` is not provided, `GRM` will prompt for input in the format `[org/repo]`.
- If `[top]` is not provided, `GRM` will fetch the top (most recent) release.

> When specifying the [[top]](#top) option, be sure to consider that it identifies the _total_ number of releases to download, which are then filtered to only include stable releases.

#### grm-jsdoc(1)

> Parse JSDoc headers for locally-downloaded releases.

```bash
$ grm jsdoc
```

**available [options](#common-options):** [_opts_](#opts), [_keep_](#keep), [_quiet_](#quiet), [_verbose_](#verbose)

The `JavaScript` files located at [[keep]](#keep) are parsed for [JSDoc](http://usejsdoc.org/) comment blocks.

> When running [release](#grm-release1), if `[keep]` is not set, files are stored in a `tmp` directory and parsed from there.

Supports all `JSDoc` [JSON configuration](http://usejsdoc.org/about-configuring-jsdoc.html). `GRM` will look in the _current working directory_ for a file called `jsdoc.conf.json` and inherit the provided configuration. By default, the following options are set:

- `configure` - Points to the project root as the location of [jsdoc.conf.json](http://usejsdoc.org/about-configuring-jsdoc.html).
- `destination` - Points to `build/docs/[release]`.
- `encoding` - UTF8.
- `recurse` - Generates documentation recursively through the releases (`[keep]`) directory.
- `template` - [DocStrap](https://github.com/docstrap/docstrap) (highly customizable).

> Any of the default options can be overridden using [config.opts](http://usejsdoc.org/about-configuring-jsdoc.html#incorporating-command-line-options-into-the-configuration-file).

#### grm-lint(1)

> Run code quality check using ESLint.

```bash
$ grm lint
```

**available [options](#common-options):** [_opts_](#opts), [_quiet_](#quiet), [_verbose_](#verbose)

When this command is run, the `GRM` will look for an [ESLint](http://eslint.org/) configuration file in the _current working directory_. It will accept any valid `ESLint` configuration file:

- .eslintrc.js
- .eslintrc.yaml
- .eslintrc.yml
- .eslintrc.json
- .eslintrc

If the file does not exist, a warning will be displayed (if [verbosity](#verbose) is high enough), but the task will not exit with an error.

It then runs `ESLint` with the supplied configuration against **all** `JavaScript` files with the exception of the `node_modules/` folder.

#### grm-release(1)

> Do it all in one go.

```bash
$ grm release
$ grm # alias
```

**[all common options](#common-options),** plus [_deploy_](#deploy).

As mentioned earlier, `grm-release(1)` is the default command run when no [sub command](#sub-command) is specified. This will run all of the sub commands, with the exception of [grm-serve(1)](#grm-serve1) in the following order:

1. [grm-download(1)](#grm-download1)
2. [grm-jsdoc(1)](#grm-jsdoc1)
3. [grm-test(1)](#grm-test1)
4. [grm-lint(1)](#grm-lint1)
5. [grm-build(1)](#grm-build1)
6. [grm-deploy(1)](#grm-deploy1) _can be skipped using the [deploy](#deploy) option_

#### grm-serve(1)

> Serve the website for debugging / development using [Browsersync](https://browsersync.io/).

```bash
$ grm serve
```

**available [options](#common-options):** [_opts_](#opts), [_port_](#port), [_quiet_](#quiet), [_urlBase_](#urlbase), [_verbose_](#verbose)

Launchs a static server with [Browsersync](https://browsersync.io/), and re-builds/re-loads when necessary by using [gaze](https://github.com/shama/gaze) to observe file changes. Additionally uses [opn](https://github.com/sindresorhus/opn) to automatically launch a browser to the base url.

If only making changes to `.scss` files, the new styles will be injected automatically and the browser will not refresh; the changes will be seen immediately. If making changes to `HTML` / `markdown` files, the browser will automatically refresh once the full [build](#grm-build1) of the website completes.

- If `[port]` is not provided, the website will be served on port `3000`.
- If `[urlBase]` is set, the server will alias all requests by removing [urlBase](#urlbase) when doing a static file lookup. Also [opens](https://github.com/sindresorhus/opn) the browser to the base URL. 

#### grm-test(1)

> Run a custom `test` routine using `npm test`, if it exists

```bash
$ grm test
```

**available [options](#common-options):** [_opts_](#opts), [_quiet_](#quiet), [_verbose_](#verbose)

Simply runs `npm test` with [run-script](https://docs.npmjs.com/cli/run-script). The one main difference is that `grm test` captures any errors that result from the `test` script not existing in `package.json`.

Useful when run as a part of a larger pipeline, i.e. when running the [release](#grm-release1) command.

## Node interface

`GRM` also includes a `node` interface, which works the same way as the [CLI](#cli). All of the available [options](#common-options) are the same, and the interface can run any of the [commands](#sub-commands). For example:

```js
const grm = require('gh-release-manager');

grm('download', {
  keep: 'releases',
  lib 'lib/module.js'
  repo: 'justinhelmer/gh-release-manager'
  top: 5,
  verbose 2
});
```

It returns a [Bluebird](http://bluebirdjs.com/docs/api-reference.html) promise, for easy `async` support and error handling, i.e.:

```js
const grm = require('gh-release-manager');

const options = {
  keep: 'releases',
  lib 'lib/module.js'
  repo: 'justinhelmer/gh-release-manager'
  top: 5,
  verbose 2
};

grm('download', options)
  .then(function() {
    console.log('success!');
  })
  .catch(function(err) {
    console.error(err);
  })
  .done();
```

## CLI adapter

`GRM` also includes a [CLI adapter](#cli-adapter) to easily integrate the [node interface](#node-interface) into any exiting `node`-based command-line program. It uses [commander.js](https://github.com/tj/commander.js/) to create a command-line program that integrates with the `GRM` [node interface](#node-interface) and exposes only the desired options.

### grm.cli(command, description[, grmOptions])

#### command

_{string}_ The `GRM` [command](#sub-commands) to run.

#### description

_{string}_ The description of the interface, which is displayed with the help documentation, i.e. `foo help [command]`.
 
#### grmOptions

_{object}_ An array of _{string}_ values representing which [options](#common-options) to expose. Should use the [short option format](#short-option-format), with the dash (`-`) omitted. By default, `o`, `q`, and `v` (for [--opts](#opts), [--quiet](#quiet), and [--verbose](#verbose)) are always exposed, so there is no need to supply them. 
 
For example:

```js
#!/usr/bin/env node
(function() {
  'use strict';
  
  const grm = require('gh-release-manager');
  const desc = 'Download the top <t> recent releases for "foo/bar" project and store them in [k]';
  
  grm.cli('download', desc, ['t', 'k']);
})();
```

When using the `CLI adapter`, `GRM` will always check for a [grm.opts](#grmopts) file. This way, a custom command-line program can specify project-level defaults for [options](#common-options), and expose _only_ the options that should be configurable by the program consumer.

## Common options

Options can be specified via the `CLI` or through the `node` interface. In either case, the options are the same.

The only exception is that `CLI` args (as well as [grm.opts](#grmopts)) use `kebab-case` while the `node` interface accepts args in `camelCase` format (i.e. `url-base` for the `CLI` vs. `urlBase` for the `node` interface). This is to match the conventions of the respective constructs.

Several of the options are `common` across the [sub commands](#sub-commands).

#### opts

_{string}_ The path to an optional [grm.opts](#grmopts) file. `CLI` args take precedence.

**used by:** [all sub commands](#sub-commands)

#### build

_{string}_ The path to a module that runs custom `build` operations _before_ running the build operations included by `GRM`. The module should return `false` to prevent the remaining `build` operations from running, without throwing an error or stopping the pipeline.

Alternatively, a promise can be returned that if fulfilled with the boolean value `false` will prevent the remaining build operations from running.

**used by:** [_build_](#grm-build1), [_release_](#grm-release1)

> Can use [vinyl-tasks](https://github.com/justinhelmer/vinyl-tasks) for running streaming operations easily.

#### deploy

_{boolean}_ Skip the [deploy](#grm-deploy1) step during [release](#grm-release1) (i.e. perform a _"dry run"_) by setting this to `false`. Defaults to `true`.

**used by:** [_release_](#grm-release1)

> Since the default behavior of [release](#grm-release1) is to [deploy](#grm-deploy1), the `CLI` accepts a `--no-deploy` flag instead of using `--deploy false`.
 
#### force

_{boolean}_ Force push to `gh-pages` during deployment.
 
**used by:** [_deploy_](#grm-deploy1), [_release_](#grm-release1)
 
By default, the `deploy` command will _not_ **force push** to [GitHub Pages](https://pages.github.com/). Set this option to `true` to reverse that behavior.
 
#### keep

_{string}_ The path to where releases should be stored. If this option is not set, downloaded files will be deleted when the process exits, whether it succeeds or fails.

**used by:** [_download_](#grm-download1), [_jsdoc_](#grm-jsdoc1), [_release_](#grm-release1)

#### lib

_{string}_ The relative path to the file to parse for `JSDoc` headers; assumes the same relative path for all releases. If not set, `[project root]/index.js` is assumed.

**used by:** [_download_](#grm-download1), [_jsdoc_](#grm-jsdoc1), [_release_](#grm-release1)

#### port

_{string}_ The port number to launch a development server using [Browsersync](https://browsersync.io/). If not set, `[project root]/index.js` is assumed.

**used by:** [_serve_](#grm-serve1)

#### quiet

_{boolean}_ Suppress all output (`STDOUT` and `STDERR`). Defaults to `false`.

**used by:** [all sub commands](#sub-commands)

#### repo

_{string}_ The repository to fetch releases for (in the format `org/repo`) via the [GitHub Tags API](https://developer.github.com/v3/git/tags/). If not set, will be prompted to enter it.

**used by:** [_deploy_](#grm-deploy1), [_download_](#grm-download1), [_release_](#grm-release1)
 
#### top

_{number}_ The number of recent releases to fetch. Without specifying, will grab the most recent release (`top=1`).

**used by:** [_download_](#grm-download1), [_release_](#grm-release1)

> When specifying the [[top]](#top) option, be sure to consider that it identifies the _total_ number of releases to download, which are then filtered to only include [stable releases](#grm-download1).

#### urlBase

_{string}_ The base used to [serve](#grm-serve1) the website. Also passed as `metadata` to the `Handlebars` templates during [build](#grm-build1).

**used by:** [_build_](#grm-build1), [_release_](#grm-release1), [_serve_](#grm-serve1)

#### verbose

_{mixed}_ Show more output. Can be `true`, `false`, or a number to specify the _verbosity level_. Defaults to `false`.

**used by:** [all sub commands](#sub-commands)

### grm.opts

Additionally, a path can be provided using `opts` to point to a configuration file for parsing.

If `opts` is not provided, `GRM` will look in the _current working directory_ for a file called `grm.opts`.

The `grm.opts` file should be in the following format (example `grm.opts` file):

```
--build lib/build.js
--force true
--keep releases
--lib lib/module.js
--port 8000
--quiet false
--repo justinhelmer/gh-release-manager
--top 5
--url-base /gh-release-manager.github.io
--verbose 2
```

> The `grm.opts` file must use the _long_ format of the option, not the _short_ format (i.e. `-d`, `-k`, etc. **will be igored**).

### Short option format

For less typing. Only works with the [CLI](#cli-interface) interface and for exposing [options](#common-options) using the [CLI adapter](#cli-adapter).

| Long | Short |
| --- | --- |
| _--opts_ | **-o** |
| _--build_ | **-b** |
| _--no-deploy_ | **-n** |
| _--force_ | **-f** |
| _--keep_ | **-k** |
| _--lib_ | **-l** |
| _--port_ | **-p** |
| _--quiet_ | **-q** |
| _--repo_ | **-r** |
| _--top_ | **-t** |
| _--urlBase_ | **-u** |
| _--verbose_ | **-v** |

## Custom build tasks

If there are additional `build` steps that need to happen outside of what `GRM` provides out-of-the-box, or any pre-conditions that need to be run before executing the build, use [options.build](#build).

This will allow the execution of any arbitrary functionality, such as running additional operations using [vinyl-tasks](https://github.com/justinhelmer/vinyl-tasks). It also provides the ability to stop the build from running. 

## Contributing

[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/justinhelmer/gh-release-manager/issues)
[![devDependency status](https://david-dm.org/justinhelmer/gh-release-manager/dev-status.svg)](https://github.com/justinhelmer/gh-release-manager)

## License

The MIT License (MIT)

Copyright (c) 2016 Justin Helmer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

