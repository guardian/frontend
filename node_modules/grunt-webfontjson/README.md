# grunt-webfontjson

> Grunt plugin for webfontjson.

## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-webfontjson --save-dev
```

One the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-webfontjson');
```

## The "webfontjson" task

### Overview
In your project's Gruntfile, add a section named `webfontjson` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  webfontjson: {
    woff: {
      options: {
        "filename": "test/MyriadPro.woff.json",
        "callback": "myCallback",
        "fonts": [
          {
            "font-family": "WebFont-MyriadPro",
            "font-weight": "normal",
            "file": "/Library/Fonts/MyriadPro-Regular.woff",
            "format": "woff"
          },
          {
            "font-family": "WebFont-MyriadPro",
            "font-weight": "bold",
            "file": "/Library/Fonts/MyriadPro-Bold.woff",
            "format": "woff"
          }
        ]
      }
    }
  }
})
```

### Options

#### options.filename
Type: `String`

A string value that is the location and name of the file to create.

#### options.callback
Type: `String`
Default value: `'webfontjsonCallback'`

A string value that is the name of the function callback to wrap the json in.

#### options.fonts
Type: `Array`

List of fonts to make up the new json font file. Include all properties you want included on '@font-face' rule in the resulting CSS. `font-family`, `file` and `format` are required.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
