# grunt-mkdir

> Create directories with Grunt.

## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-mkdir --save-dev
```

One the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-mkdir');
```

## The "mkdir" task

### Overview
In your project's Gruntfile, add a section named `mkdir` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  mkdir: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
})
```

### Options

#### options.create
Type: `Array`

An array of folder names to create.

#### options.mode
Type: `Number`

The mode of the file to create. Defaults to `0777 & (~process.umask())`.

### Usage Examples

#### Simple usage
The following example will create a `tmp` folder that is only accessible to the owner:

```js
grunt.initConfig({
  mkdir: {
    all: {
      options: {
        mode: 0700,
        create: ['tmp']
      },
    },
  },
})
```

#### Multiple and recursive folders
You can create multiple folders and even recursively create folders:

```js
grunt.initConfig({
  mkdir: {
    all: {
      options: {
        create: ['tmp', 'test/very/deep/folder']
      },
    },
  },
})
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

* 2013-03-11   v0.1.0   Initial release.
