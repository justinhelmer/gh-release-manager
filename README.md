# GitHub Release Manager
A variety of tools for managing github releases

[![npm package](https://badge.fury.io/js/gh-release-manager.svg)](https://www.npmjs.com/package/gh-release-manager)
[![node version](https://img.shields.io/node/v/gh-release-manager.svg?style=flat)](http://nodejs.org/download/)
[![dependency status](https://david-dm.org/justinhelmer/gh-release-manager.svg)](https://github.com/justinhelmer/gh-release-manager)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/justinhelmer/gh-release-manager/issues)

The `gh-release-manager` exists to try to make it easier to manage release tags on `GitHub`. It includes a suite of tools for downloading, extracting, parsing documentation using [JSDoc](http://usejsdoc.org/), among other things as well.

#### WARNING

This project is currently in the `pre-alpha` phase. [Contributions](#contributions) are welcome and encouraged, but understand there will be bugs.

## Installation

`GitHub Release Manager` is currently intended to be installed _locally_, as assets are placed in the root of the project, relative to `gh-release-manager` itself.

```bash
$ npm install --save gh-release-manager

# optionally link the script to node/.bin
# (does NOT install the module globally)
$ npm link && npm link gh-release-manager
```

## Usage

The manual can be seen by using:

```
$ grm --help
```

This will display all of the [sub-commands](#sub-commands).

## Options

Currently, the options are shared across sub-commands, although that will likely change once the module has matured a bit more.

The complete list is currently limited to:

- **quiet** _{boolean}_ - Suppress all output (`STDOUT` and `STDERR`). Defaults to `false`.
- **verbose** _{mixed}_ - Show more output. Can be `true`, `false`, or a number to specify the _[verbosity]_ level.

## Sub-commands

`GitHub Release Manager` is essentially a container of different `plugins`. These `plugins` individually serve their own purpose. However, the entire suite can still be run by using `grm suite`.

The complete list of available sub-commands exists below.

### grm-download(1)

```
$ grm download
```

Download & extract assets for all recent tags that have been published to `GitHub`. Excludes all releases that are not in the format `[v]X.X.X`, i.e. `1.2.3` or `v1.2.3`.

All downloaded releases will be output in the `/releases` directory.

### grm-jsdoc(1)

```
$ grm jsdoc
```

Parse the [JSDoc](http://usejsdoc.org/) headers for all releases that exist in the `/releases` directory.

All parsed documentation will be output in the `/docs` directory.

### grm-suite(1)

```
$ grm suite
```

As mentioned earlier, the only purpose of `grm-suite(1)` is to run all sub-commands in the order they are set up.

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

