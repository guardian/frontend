grunt-css-metrics
=================

Grunt task to analyse css files and log simple metrics.

## Getting Started

This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-css-metrics --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-css-metrics');
```
## Options

### quiet

Type: `Boolean`
Default: `false`

Supress any warnings thrown by other max count options.

### maxFileSize

Type: `Number`
Default: `∞`

Maximum CSS file size in bytes

### maxSelectors

Type: `Number`
Default: `∞`

Maximum number of selectors within CSS file. (Note: IE selector limit is 4096)

## Examples

### Configuration Example

Basic example of a Grunt config containing the css-metrics task.
```js
grunt.initConfig({
    cssmetrics: {
        dev: {
            src: [
                'assets/stylesheets/global.min.css'
            ]
        }
    }
});

grunt.loadNpmTasks('grunt-css-metrics');

grunt.registerTask('default', ['cssmetrics']);
```

### Multiple Files

Running css-metrics against multiple CSS files. All the files specified in the `src` array will be analyzed by css-metrics.
```js
cssmetrics: {
  dist: {
    src: [
        'assets/stylesheets/global.css',
        'assets/stylesheets/head.css',
        'assets/stylesheets/*.min.css'
    ]
  }
}
```

### Specifying Options

Example of using the [options](https://github.com/phamann/grunt-css-metrics#options).

```js
cssmetrics: {
    dev: {
        src: [
            'test/*.min.css'
        ],
        options: {
            quiet: false,
            maxSelectors: 4096,
            maxFileSize: 10240000
        }
    }
}
```

### Specifying Files with Glob Pattern

Example of using a glob pattern to target many files that should be analysed by css-metrics. The example below will analyse all the files in the `css` directory that have an extension of `.css`.

```js
cssmetrics: {
  dist: {
    src: ['css/*.css']
  }
}
```

##Todo

* Pipe output to JSON file
* Write unit tests

## Release History

### 0.1.0 (9th June 2013)

* Initial release

## Credits

* [@visionmedia](https://github.com/visionmedia) for the great [css-parse](https://github.com/visionmedia/css-parse) library.
* Original work from [@rquinlivan](https://github.com/rquinlivan)'s [css-metrics](https://github.com/rquinlivan/css-metrics)
* Inspiration from my collegue [@kaelig](https://github.com/kaelig)
