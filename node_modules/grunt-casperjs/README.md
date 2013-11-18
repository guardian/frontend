# grunt-casperjs

> With this grunt.js task you can run tests with CasperJS.

## Getting Started

First [Install CasperJS](http://casperjs.org/installation.html).

This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-casperjs --save-dev
```

One the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-casperjs');
```

## The "casperjs" task

### Overview
In your project's Gruntfile, add a section named `casperjs` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  casperjs: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    }
  }
})
```

### Usage Examples

#### Default Options

```js
grunt.initConfig({
  casperjs: {
    options: {
      async: {
        parallel: false
      }
    },
    files: ['tests/casperjs/**/*.js']
  },
})
```

#### Async Parallel

By default, tests are run in series. If your tests are independent, you can run them in parallel.

```javascript
casperjs: {
  options: {
    async: {
      parallel: true
    }
  },
  files: ['tests/casperjs/**/*.js']
}
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).
