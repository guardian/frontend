# testr.js

Unit testing require.js modules, with both stubbed and script-loaded dependencies.
Compatible with all test frameworks - Mocha, Jasmine, QUnit, Buster JS, etc.
Distributed under the MIT license.

### Usage

Create a new instance of a module under test using the `testr` method:

```javascript
testr('path/to/module', stubs);
testr('path/to/module', useExternal);
testr('path/to/module', stubs, useExternal);
```

**stubs**: *(optional)* a collection of stubs to use in place of dependencies. Each key is the requirejs path name of the module to be stubbed; each value is the stub. The key may also be relative to the test module path, i.e. beginning with `./`. If the module under test requires a dependency which is not stubbed, the actual dependency will be used.

**useExternal**: *(optional)* a boolean to indicate if you wish to load in stubs from an external file. See below for details on where the external stub files should be placed.

### Setup

Include the requirejs script before testr.js, and **do not** pre-define `require`, or use the `data-main` attribute. testr.js will intercept the `require` and `define` methods, and enable your module definitions to be captured. testr.js can also be configured to attempt an automatic load of all spec and external stub files. These will use an identical path, with a configurable base url, and a modified file extension. For example:

> **Source**: /src/path/to/module.js
> **Spec**: /spec/path/to/module.spec.js
> **Stub**: /stub/path/to/module.stub.js

*Note: If the spec or stub file does not exist, a 404 error will occur, which may trigger a fail in some test frameworks.*

### Running

Begin loading your app, and optionally your specs and stubs, with the following example setup:

```html
<script src="lib/require.js"></script>
<script src="lib/testr.js"></script>
<script>
	// set options
	testr.config({
		root: '../',
		baseUrl: 'src',
		specUrl: 'spec',
		ignore ['jquery', 'underscore']
	});

	// load app and specs
	testr.run('path/to/config.js', function() {
		// kick off the test framework of choice... e.g:
		mocha.run();
	});
</script>
```

The first argument should be a path which points to your require.js config file. Be aware that if you have defined a callback in your config, it will be executed, which may pollute your test environment. Ensure that you only specify your top-level modules in the config file, using the `deps` array. The second argument is the callback which will run once the app and any automatically requested files have loaded. This is typically where you will load and/or execute the test suite.

### Configuration

```javascript
testr.config({
	root: '../',
	baseUrl: 'src',
	specUrl: 'spec',
	stubUrl: 'stub',
	ignore: ['jquery', 'underscore'],
	whitelist: ['path/to/allowed/actual', 'underscore', 'backbone']
});
```

**root**: The root of your project, relative to the path where the tests are run. All URL properties will be relative to the root.

**baseUrl**: Use this property if you wish to override the `baseUrl` given in the require.js config file.

**specUrl**, **stubUrl**: When either or both of these base URLs are present, they will be used to automatically load spec and stub files per module. Each resource loaded will use the module definition paths, with these base URLs prefixed and a modified file extension (see Setup, above).

**ignore**: List the modules which should not be managed by testr.js. These objects will be managed by requirejs, and the same instance of an ignored module will be used each time it is required.

**whitelist**: By default, this feature is not enabled. It can be configured as an array of paths that are allowed as actual dependencies. All other modules must be stubbed, encouraging genuine unit tests and less actual dependencies.

### Example

The module under test is described below.

```javascript
// requirejs path: 'today'
// default string.format.style: 'long'

define(['string', 'util/date'], function(string, date) {
	return {
		getDateString: function() {
			return string.format('Today is %d', date.today);
		},
		setFormat: function(form) {
			string.format.style = form;
		},
		getFormat: function() {
			return string.format.style;
		}
	}
});
```

Testing the *today* module, while stubbing the *date* module and using the actual *string* implementation.

```javascript
var date, today, output, passed;

// stubbing
date = {};
date.today = new Date(2012, 3, 30);

// module instancing
today = testr('today', {'util/date': date});

// testing
output = today.getDateString();
passed = (output === 'Today is Monday, 30th April, 2012');
console.log('User-friendly date: ' + (passed ? 'PASS' : 'FAIL'));
```

### Projects using testr.js

#### [asq](https://github.com/mattfysh/asq)

Wrap a 'one-at-a-time' queue around an asynchronous function.

### Tests

1. Clone this repo
2. `npm install`
3. `buster server`
4. Point one or more browsers at http://localhost:1111/
5. "Capture browser"
6. `buster test`

## Release History

* 13 Jan 2013 - 1.3.2 - fixed bug when attempting to require plugin modules that were strings
* 13 Jan 2013 - 1.3.1 - added ignore option to config, added compatibility with requirejs shim config.
* 10 Jan 2013 - 1.3.0 - testr.run introduced, enabling the require.js config file to be shared with testr.js, and allowing a callback function to be executed once the app and all optional specs and stubs have been loaded. Support for Require.js 1.0 removed.
