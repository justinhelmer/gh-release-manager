# GitHub Release Manager
Download releases, generate documentation, deploy

[![npm package](https://badge.fury.io/js/gh-release-manager.svg)](https://www.npmjs.com/package/gh-release-manager)
[![node version](https://img.shields.io/node/v/gh-release-manager.svg?style=flat)](http://nodejs.org/download/)
[![dependency status](https://david-dm.org/justinhelmer/gh-release-manager.svg)](https://github.com/justinhelmer/gh-release-manager)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/justinhelmer/gh-release-manager/issues)

The `gh-release-manager` exists to try to make it easier to manage release tags on `GitHub`. By running one command, you can:

1) Download all the recent releases to a temporary directory, by fetching them via the [GitHub API](https://developer.github.com/v3/).
2) Parse the [JSDoc](http://usejsdoc.org/) head documentation of all latest releases and generate output in the form of `markdown`. 
3) Deploy to [GitHub Pages](https://pages.github.com/) <------ Not yet implemented

#### WARNING

This project is currently in the `pre-alpha` phase. [Contributions](#contributions) are welcome and encouraged, but understand there will be bugs.

## Installation

`GitHub Release Manager` can be installed _locally_ or _globally_, and includes both a `node` module interface and a command-line interface (`CLI`).
### Install globally

```bash
$ npm install --global gh-release-manager   # links to node/.bin (avalable everywhere) 
```

### Install locally

```bash
$ npm install --save gh-release-manager

# optionally link the script to node/.bin
# (does NOT install the module globally)
$ npm link && npm link gh-release-manager
```

## Usage

Do it all in one go:

```
$ grm
```

## Options

The complete list is currently limited to:

- **docs** _{string}_ - Specify the output directory for the parsed `JSDoc` `markdown` files. 
- **keep** _{string}_ - The path to where releases should be stored. They are deleted by default after the process succeeds.
- **path** _{string}_ - The relative path to the file to parse; assumes the same relative path for all releases.
- **recent** _{number}_ - Specify the number of recent releases to fetch. Without specifying, will grab the default amount.
- **quiet** _{boolean}_ - Suppress all output (`STDOUT` and `STDERR`). Defaults to `false`.
- **verbose** _{mixed}_ - Show more output. Can be `true`, `false`, or a number to specify the _[verbosity]_ level.

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

