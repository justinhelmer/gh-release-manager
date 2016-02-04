# GitHub Release Manager
Download releases, generate documentation, deploy

[![npm package](https://badge.fury.io/js/gh-release-manager.svg)](https://www.npmjs.com/package/gh-release-manager)
[![node version](https://img.shields.io/node/v/gh-release-manager.svg?style=flat)](http://nodejs.org/download/)
[![dependency status](https://david-dm.org/justinhelmer/gh-release-manager.svg)](https://github.com/justinhelmer/gh-release-manager)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/justinhelmer/gh-release-manager/issues)

The `gh-release-manager` exists to try to make it easier to manage release tags on `GitHub`. By running one command, you can:

1. Download all the recent releases to a temporary directory, by fetching them via the [GitHub API](https://developer.github.com/v3/).
2. Parse the [JSDoc](http://usejsdoc.org/) head documentation of all latest releases and generate output in the form of `markdown`.
3. Deploy to [GitHub Pages](https://pages.github.com/) <------ Not yet implemented

## Installation

`GitHub Release Manager` can be installed _locally_ or _globally_, and includes both a `node` module interface and a command-line interface (`CLI`).
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

Do it all in one go:

```
$ grm
```

## Options

Options can be specified via the `CLI` or through the `node` interface. In either case, the options are the same.

## grm.opts

Additionally, a path can be provided using `opts` to point to a configuration file for parsing.
If `opts` is not provided, `GitHub Release Manager` will look in the current working directory for a file called `grm.opts`.

The `grm.opts` file should be in the following format (example `grm.opts` file):

```
--docs _sass
--keep releases
--path lib/module.js
--quiet false
--recent 5
--repo justinhelmer/gh-release-manager
--verbose 2
```

Note that `grm.opts` must use the _long_ format of the option (i.e. `-d`, `-k`, etc. **will be igored**).

Here is the complete list of available options:

- **opts** _{string}_ - The path to an optional [grm.opts](#grmopts) file. `CLI` args take precedence.
- **docs** _{string}_ - The path to store the parsed `JSDoc` `markdown` files. 
- **keep** _{string}_ - The path to where releases should be stored. They are deleted by default after the process succeeds.
- **path** _{string}_ - The relative path to the file to parse; assumes the same relative path for all releases.
- **quiet** _{boolean}_ - Suppress all output (`STDOUT` and `STDERR`). Defaults to `false`.
- **repo** _{string}_ - The repository to fetch releases for (in the format `org/repo`) via the [GitHub Tags API](https://developer.github.com/v3/git/tags/). If not set, will be prompted.
- **top** _{number}_ - Specify the number of recent releases to fetch. Without specifying, will grab the default amount.
- **verbose** _{mixed}_ - Show more output. Can be `true`, `false`, or a number to specify the _verbosity level_.

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

