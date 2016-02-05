# GitHub Release Manager
Download releases, generate documentation, build website, deploy, relax.

[![npm package](https://badge.fury.io/js/gh-release-manager.svg)](https://www.npmjs.com/package/gh-release-manager)
[![node version](https://img.shields.io/node/v/gh-release-manager.svg?style=flat)](http://nodejs.org/download/)
[![dependency status](https://david-dm.org/justinhelmer/gh-release-manager.svg)](https://github.com/justinhelmer/gh-release-manager)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/justinhelmer/gh-release-manager/issues)

The `GitHub Release Manager` automates the process of building a website and documenting `APIs` for any `GitHub` project. With a **single command**, you can:

1. Download all recent releases ([tags](https://developer.github.com/v3/git/tags/)) by fetching them via the [GitHub API](https://developer.github.com/v3/).
2. Parse the [JSDoc](http://usejsdoc.org/) documentation of all latest releases and generate output in the form of `markdown`.
3. Use [Gulp](http://gulpjs.com/) to enforce code quality standards with [ESLint](http://eslint.org/docs/user-guide/getting-started) and code style standards with [JSCS](http://jscs.info/). **_not yet implemented_**
4. Use [Jeyll](https://jekyllrb.com/) to build a static website and generate documentation `HTML`. **_not yet implemented_**
5. Deploy to [GitHub Pages](https://pages.github.com/). **_not yet implemented_**

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

There is also a long list of [options](#options) that can be used to customize the behavior.

## CLI

The main command to interface with `GRM` corresponds with the name of the package (`gh-release-manager`). However, this package also uses [node-alias](https://github.com/justinhelmer/node-alias) to set up a _short_ command, `grm`.

Additionally, each [option](#options) has a [short option format](#short-option-format) that is compatible with the `CLI`.

### Using the CLI

Do it all in one go:

```bash
$ grm
```

Or, run one of the [sub commands](#sub-commands).

### Sub commands

Although it is often most convenient to [do it all in one go](#usage), there may be a use case that involves running the steps individually (i.e. debugging, dry runs, etc). For that reason, `GRM` is a collection of `Git` style sub commands. By default, if no `command` is specified, [grm-release(1)](#grm-release1) is run by default.

Every command has a `help` file. Simply run:

```bash
$ grm help [command]
```

This will display the information about the command, including all of the available [options](#options) for that command.

#### grm-build(1)

> Build all markdown files (documentation and website) to HTML using Jekyll.

```bash
$ grm build
```

**Coming soon!**

#### grm-deploy(1)

> Deploy a grm built project to gh-pages.

```bash
$ grm deploy
```

**Coming soon!**

#### grm-download(1)

> Download recent releases via the GitHub Tags API.

```bash
$ grm download
```

**available [options](#options):** [_keep_](#keep), [_path_](#path), [_quiet_](#quiet), [_repo_](#repo), [_top_](#top), [_verbose_](#verbose)

The [[top]](#top) most recent releases are fetched from [[repo]](#repo), then the file located at [[path]](#path) (relative to the repo) is stored in [[keep]](#keep) (if provided).

- If `[keep]` is not provided, `GRM` will store the downloaded files in a temporary directory that is deleted after success or failure.
- If `[path]` is not provided, `GRM` will assume the file to be stored is located at `[project root]/index.js`.
- If `[repo]` is not provided, `GRM` will prompt for input in the format `[org/repo]`.
- If `[top]` is not provided, `GRM` will fetch the default number of releases (determined by the `GitHub API`).

#### grm-jsdoc(1)

> Parse JSDoc headers for locally-downloaded releases.

```bash
$ grm jsdoc
```

**available [options](#options):** [_docs_](#docs), [_head_](#head), [_keep_](#keep), [_quiet_](#quiet), [_repo_](#repo), [_verbose_](#verbose)

The `markdown` files located at [[keep]](#keep) are parsed for [JSDoc](http://usejsdoc.org/) comment blocks. Then, the file located at [[head]](#head) is prepended to the generated file, with the `[release]` token being replaced by the release name. [[repo]](#repo) is used for `URL` replacement via [docdown](https://github.com/jdalton/docdown).

- If `[docs]` is not provided, `GRM` will store the `JSDoc` parsed `markdown` in the `docs` folder within the _current working directory_.
- If `[head]` is not provided, `GRM` will look in the _current working directory_ for a file called `docs-header.md`.
- If `[repo]` is not provided, `GRM` will prompt for input in the format `[org/repo]`.

#### grm-lint(1)

> Run code quality and code style linting.

```bash
$ grm lint
```

**Coming soon!**

#### grm-release(1)

> Do it all in one go.

```bash
$ grm release
$ grm # alias
```

**[all options](#options) available**

As mentioned earlier, `grm-release(1)` is the default command run when no [sub command](#sub-command) is specified. This will run all of the sub commands in the following order:

1. [grm-download(1)](#grm-download1)
2. [grm-jsdoc(1)](#grm-jsdoc1)
3. [grm-lint(1)](#grm-lint1) **_not yet implemented_**
4. [grm-build(1)](#grm-build1) **_not yet implemented_**
5. [grm-deploy(1)](#grm-deploy1) **_not yet implemented_**

## Node interface

`GRM` also includes a `node` interface, which works the same way as the [CLI](#cli). All of the available [options](#options) are the same, and the interface can run any of the [sub commands](#sub-commands). For example:

```js
const grm = require('gh-release-manager');

grm('download', {
  keep: 'releases',
  path 'lib/module.js'
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
  path 'lib/module.js'
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

`GRM` also includes a [CLI adapter](#cli-adapter) to easily integrate the [node interface](#node-interface) into any exiting `node`-based command-line program. It uses [commander.js](https://github.com/tj/commander.js/) and [commander.js-error](https://github.com/justinhelmer/commander.js-error) to create a command-line program that interfaces with the `GRM` [node interface](#node-interface) and exposes only the desired options:

### grm.cli(command, description[, grmOpts])

#### command

_{string}_ The `GRM` [sub command](#sub-commands) to run.

#### description

_{string}_ The description of the interface, for generating the help documentation, i.e. `foo help [command]`
 
#### grmOpts

_{object}_ An array of _{string}_ values representing which [options](#options) to expose. Should use the [short option format](#short-option-format), with the dash (`-`) omitted. By default, `o` (for [--opts](#opts)) is always exposed, so there is no need to supply it. 
 
For example:

```js
#!/usr/bin/env node
(function() {
  'use strict';
  
  const grm = require('gh-release-manager');
  const desc = 'Download the top <n> recent releases for the "foo/bar" project and store them in [k]';
  
  grm.cli('download', desc, ['n', 'k']);
})();
```

When using the `CLI adapter`, `GRM` will always check for a [grm.opts](#grmopts) file. This way, a custom command-line program can specify project-level defaults for [options](#options), and expose _only_ the options that should be configurable by the program consumer.

## Options

Options can be specified via the `CLI` or through the `node` interface. In either case, the options are the same. Many of the options are common across the [sub commands](#sub-commands). For that reason, they are documented as an aggregate list:

#### opts

_{string}_ The path to an optional [grm.opts](#grmopts) file. `CLI` args take precedence.

#### docs

_{string}_ The path to store the parsed `JSDoc` `markdown` files. If not set, files will be stored in the `docs` directory, relative to the _current working directory_.
 
#### head

_{string}_ The path to a header `markdown` file that will be prepended to every documentation file during `markdown` generation. If not set, the script will look in the _current working directory_ for a file called `docs-header.md`. The token `[release]` is replaced with the release name. 
 
#### keep

_{string}_ The path to where releases should be stored. If this option is not set, downloaded files will be deleted when the process exits, whether it succeeds or fails.

#### path

_{string}_ The relative path to the file to parse; assumes the same relative path for all releases. If not set, `[project root]/index.js` is assumed.

#### quiet

_{boolean}_ Suppress all output (`STDOUT` and `STDERR`). Defaults to `false`.

#### repo

_{string}_ The repository to fetch releases for (in the format `org/repo`) via the [GitHub Tags API](https://developer.github.com/v3/git/tags/). If not set, will be prompted to enter it.
 
#### top

_{number}_ The number of recent releases to fetch. Without specifying, will grab the default amount (determined by the `GitHub API`).

#### verbose

_{mixed}_ Show more output. Can be `true`, `false`, or a number to specify the _verbosity level_. Defaults to `false`.

### grm.opts

Additionally, a path can be provided using `opts` to point to a configuration file for parsing.

If `opts` is not provided, `GRM` will look in the _current working directory_ for a file called `grm.opts`.

The `grm.opts` file should be in the following format (example `grm.opts` file):

```
--docs _sass
--head docs-header.md
--keep releases
--path lib/module.js
--quiet false
--repo justinhelmer/gh-release-manager
--top 5
--verbose 2
```

> The `grm.opts` file must use the _long_ format of the option, not the _short_ format (i.e. `-d`, `-k`, etc. **will be igored**).

### Short option format

For less typing. Only works with the [CLI](#cli-interface) interface and for exposing [options](#options) using the [CLI adapter](#cli-adapter).

| Long | Short |
| --- | --- |
| _--opts_ | **-o** |
| _--docs_ | **-d** |
| _--head_ | **-h** |
| _--keep_ | **-k** |
| _--path_ | **-p** |
| _--quiet_ | **-q** |
| _--repo_ | **-r** |
| _--top_ | **-t** |
| _--verbose_ | **-v** |

## Contributing

[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/justinhelmer/gh-release-manager/issues)

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

