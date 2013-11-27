# grunt-env [![Build Status](https://secure.travis-ci.org/smlgbl/grunt-env.png?branch=master)](http://travis-ci.org/smlgbl/grunt-env)

Specify an ENV configuration as a task, e.g.

```
grunt.registerTask('dev', 'env:dev lint server watch');
grunt.registerTask('build', 'env:build lint other:build:tasks');
```

## Getting Started
Install this grunt plugin next to your project's [grunt.js gruntfile][getting_started] with: `npm install grunt-env`

Then add this line to your project's `grunt.js` gruntfile:

```javascript
grunt.loadNpmTasks('grunt-env');
```

[grunt]: http://gruntjs.com/
[getting_started]: https://github.com/gruntjs/grunt/blob/master/docs/getting_started.md

## Configuration

```js
  env : {
    options : {
 	//Shared Options Hash
    },
    dev : {
      NODE_ENV : 'development',
      DEST     : 'temp'
    },
    build : {
      NODE_ENV : 'production',
      DEST     : 'dist',
      extend   : {
        PATH     : {
          'value': 'node_modules/.bin',
          'delimiter': ':'
        }
      }
    }
  }
```
## Using external files

You can specify environment values in INI or JSON style and load them via the src option.

```js
  env : {
    dev : {
      src : "dev.json"
    },
    heroku : {
      src : ".env"
    }
  }
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt][grunt].

## Release History

- 0.4.0 Removed automatic parse, added ability to add ini or json style `src` files
- 0.3.0 Automatically parses .env files now 
- 0.2.1 fixed npm install
- 0.2.0 grunt 0.4.0 support, simplified
- 0.1.0 Initial release

## License

Copyright (c) 2012 OneHealth Solutions, Inc
Licensed under the Apache 2.0 license.

## Author

Jarrod Overson
