# grunt-contrib-sass [![Build Status](https://travis-ci.org/gruntjs/grunt-contrib-sass.png?branch=master)](https://travis-ci.org/gruntjs/grunt-contrib-sass)

> Compile Sass to CSS



## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-contrib-sass --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-contrib-sass');
```




## Sass task
_Run this task with the `grunt sass` command._

[Sass](http://sass-lang.com) is a preprocessor that adds nested rules, variables, mixins and functions, selector inheritance, and more to css. Sass files compile into well-formatted, standard CSS to use in your site or application.

This task requires you to have [Ruby](http://www.ruby-lang.org/en/downloads/) and [Sass](http://sass-lang.com/download.html) installed. If you're on OS X or Linux you probably already have Ruby installed; test with `ruby -v` in your terminal. When you've confirmed you have Ruby installed, run `gem install sass` to install Sass.

### Options


#### sourcemap

Type: `Boolean`  
Default: `false`

Enable Source Maps.

**Requires Sass 3.3.0, which can be installed with `gem install sass --pre`**


#### trace

Type: `Boolean`  
Default: `false`

Show a full traceback on error.


#### unixNewlines

Type: `Boolean`  
Default: `false` on Windows, otherwise `true`

Force Unix newlines in written files.


#### check

Type: `Boolean`  
Default: `false`

Just check syntax, don't evaluate.


#### style

Type: `String`  
Default: `nested`

Output style. Can be `nested`, `compact`, `compressed`, `expanded`.


#### precision

Type: `Number`  
Default: `3`

How many digits of precision to use when outputting decimal numbers.


#### quiet

Type: `Boolean`  
Default: `false`

Silence warnings and status messages during compilation.


#### compass

Type: `Boolean`  
Default: `false`

Make Compass imports available and load project configuration (`config.rb` located close to the `Gruntfile.js`).


#### debugInfo

Type: `Boolean`  
Default: `false`

Emit extra information in the generated CSS that can be used by the FireSass Firebug plugin.


#### lineNumbers

Type: `Boolean`  
Default: `false`

Emit comments in the generated CSS indicating the corresponding source line.


#### loadPath

Type: `String|Array`

Add a (or multiple) Sass import path.


#### require

Type: `String|Array`

Require a (or multiple) Ruby library before running Sass.


#### cacheLocation

Type: `String`  
Default: `.sass-cache`

The path to put cached Sass files.


#### noCache

Type: `Boolean`  
Default: `false`

Don't cache to sassc files.


#### bundleExec

Type: `Boolean`  
Default: `false`

Run `sass` with [bundle exec](http://gembundler.com/man/bundle-exec.1.html): `bundle exec sass`.

### Examples

#### Example config

```javascript
grunt.initConfig({
  sass: {                              // Task
    dist: {                            // Target
      files: {                         // Dictionary of files
        'main.css': 'main.scss',       // 'destination': 'source'
        'widgets.css': 'widgets.scss'
      }
    },
    dev: {                             // Another target
      options: {                       // Target options
        style: 'expanded'
      },
      files: {
        'main.css': 'main.scss',
        'widgets.css': [
          'button.scss',
          'tab.scss',
          'debug.scss'  // Maybe you need one extra file in dev
        ]
      }
    }
  }
});

grunt.loadNpmTasks('grunt-contrib-sass');

grunt.registerTask('default', ['jshint', 'sass']);
```

#### Compile

```javascript
grunt.initConfig({
  sass: {
    dist: {
      files: {
        'main.css': 'main.scss'
      }
    }
  }
});
```

#### Concat and compile

If you specify an array of `src` paths they will be concatenated. However, in most cases you would want to just `@import` them into `main.scss`.

```javascript
grunt.initConfig({
  sass: {
    dist: {
      files: {
      'main.css': [
          'reset.scss',
          'main.scss'
        ]
      }
    }
  }
});
```

#### Compile multiple files

You can specify multiple `destination: source` items in `files`.

```javascript
grunt.initConfig({
  sass: {
    dist: {
      files: {
        'main.css': 'main.scss',
        'widgets.css': 'widgets.scss'
      }
    }
  }
});
```


## Release History

 * 2013-07-06   v0.4.1   Use file.orig.src if file.src does not exist and return early to avoid passing non-existent files to sass binary.
 * 2013-06-30   v0.4.0   Rewrite task to be able to support Source Maps. Compile Sass files in parallel for better performance.
 * 2013-03-26   v0.3.0   Add support for `bundle exec`. Make sure `.css` files are compiled with SCSS.
 * 2013-02-15   v0.2.2   First official release for Grunt 0.4.0.
 * 2013-01-25   v0.2.2rc7   Updating grunt/gruntplugin dependencies to rc7. Changing in-development grunt/gruntplugin dependency versions from tilde version ranges to specific versions.
 * 2013-01-09   v0.2.2rc5   Updating to work with grunt v0.4.0rc5. Switching to this.files api. Add separator option.
 * 2012-11-05   v0.2.0   Grunt 0.4 compatibility. Improve error message when Sass binary couldn't be found
 * 2012-10-12   v0.1.3   Rename grunt-contrib-lib dep to grunt-lib-contrib.
 * 2012-10-08   v0.1.2   Fix regression for darwin.
 * 2012-10-05   v0.1.1   Windows support.
 * 2012-09-24   v0.1.0   Initial release.

---

Task submitted by [Sindre Sorhus](http://github.com/sindresorhus)

*This file was generated on Sat Jul 06 2013 19:55:01.*
