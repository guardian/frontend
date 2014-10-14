Pasteup Forms
===============

Part of the [Pasteup](https://github.com/guardian/pasteup) collection.

[View the docs](http://guardian.github.io/pasteup-forms/)

## Installation

You will need

 * [Node.js](http://nodejs.org/)
 * [Bower](http://bower.io/)
```
$ npm install -g bower
```

Then install this component with

```
$ bower install pasteup-forms --save
```

## Usage

```
@import 'bower_components/pasteup-forms/src/_forms'
```

Or use the [standalone build](build/forms.min.css)

## Development

On top of the above requirements, you will also need

 * [Ruby](https://www.ruby-lang.org/en/)
 * [Bundler](http://bundler.io/)
```
$ gem install bundler
```
 * [Grunt CLI](http://gruntjs.com/getting-started#installing-the-cli)
```
$ npm install -g grunt-cli
```

Then, in root, install the dependecies

```
$ bundle install
$ npm install
$ bower install
```

To build the component

```
$ grunt build
```

To build the docs (output to the `docs` dir)

```
$ grunt docs
```

To release the component

```
$ grunt release
```

By default a patch release. Also `major` and `minor` targets available, e.g.

```
$ grunt release:minor
```
