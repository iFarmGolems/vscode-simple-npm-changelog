# Simple Npm Changelog

## Requirements

package.json file at the root of your project

## How to use

Use command `Show npm module changelog` to bring up select menu, select a module and this extension will try to open its changelog in a browser.

## How it works

The extension will query NPM for selected module metadata, parses its repo address and tries to open (currently) `CHANGELOG.md, CHANGELOG or CHANGELOG.txt` at the root of the repository in the browser. If none of patterns exist, it will show an error message and does nothing.
