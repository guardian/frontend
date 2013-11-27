# grunt-bumpup [![NPM version](https://badge.fury.io/js/grunt-bumpup.png)](https://npmjs.org/package/grunt-bumpup)

Updates the `version`, `date`, and other properties in your JSON files.

The properties are updated only when already present in the original JSON file. Plugin also detects and preserves the
original indentation style.

This is a [Grunt](http://gruntjs.com/) 0.4 plugin. If you haven't used [Grunt](http://gruntjs.com/) before, be sure to
check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a
[Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins.

### [Changelog](https://github.com/Darsain/grunt-bumpup/wiki/Changelog)

Upholds the [Semantic Versioning Specification](http://semver.org/).

## Installation

Use npm to install and save the plugin into `devDependencies`.

```shell
npm install grunt-bumpup --save-dev
```

Once the plugin has been installed, it can be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-bumpup');
```

## Usage

You call this task from the CLI with one argument, specifying the release type:

```js
grunt bumpup:type
```

Available release types are:

- **major**: Will bump the major `x.0.0` part of a version string.
- **minor**: Will bump the minor `0.x.0` part of a version string.
- **patch**: Will bump the patch `0.0.x` part of a version string.
- **prerelease**: Will bump the prerelease `0.0.0-x` part of a version string.

Version format: `major.minor.patch-prerelease`.

The prerelease part is adjusted only when present. If you have a `1.0.0` version, the `-prerelease` part won't be appended unless
already present, or you've called the task with `prerelease` argument:

```shell
grunt bumpup:prerelease
```

You can also pass a valid semantic version directly. Example:

```
grunt bumpup:1.1.0
```

## Configuration

In your project's Gruntfile, add a section named `bumpup` to the data object passed into `grunt.initConfig()`. This is a
simple task, and does not conform to multi task options & files input types! All available configuration styles are
described below.

This is the most verbose form of the configuration:

```js
grunt.initConfig({
	bumpup: {
		options: {
			// Options go here.
		},
		setters: {
			// Custom setters go here.
		},
		files: [
			// JSON files go here.
		],
	},
});
```

### Configuration examples:

Default options and one JSON file:

```js
grunt.initConfig({
	bumpup: 'package.json'
});
```

```js
grunt.initConfig({
	bumpup: {
		file: 'package.json'
	}
});
```

Default options, and multiple JSON files:

```js
grunt.initConfig({
	bumpup: ['package.json', 'component.json']
});
```

```js
grunt.initConfig({
	bumpup: {
		files: ['package.json', 'component.json']
	}
});
```

Custom options and setters:

```js
grunt.initConfig({
	bumpup: {
		options: {
			dateformat: 'YYYY-MM-DD HH:mm',
			normalize: false
		},
		setters: {
			// Overrides version setter
			version: function (old, releaseType, options) {
				return 'proprietary version';
			},
			// Adds a new setter for `timestamp` property
			timestamp: function (old, releaseType, options) {
				return +new Date();
			},
		},
		files: ['package.json', 'component.json']
	}
});
```

## Options

#### options.updateProps
Type: `Object`
Default: `{}`

Map of grunt config property names that should be updated after bumping.

Usage: If you have a `pkg` convenience property from `package.json`, and you bump up something inside it, you need to
tell that to grunt so the next tasks in queue can use the updated data.

Example: Tell bumpup to update the `pkg` config property when bumping the `package.json` file.

```js
grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),
	bumpup: {
		options: {
			updateProps: {
				pkg: 'package.json'
			}
		},
		file: 'package.json'
	}
});
```

#### options.normalize
Type: `Boolean`
Default: `true`

Whether to normalize all JSON files to have the same version. The version that is than bumped up and saved into all
files is taken from the first file passed into the files array.

#### options.dateformat
Type: `String`
Default: `YYYY-MM-DD HH:mm:ss Z`

A date format string used by [moment.js'](http://momentjs.com) `.format()` method, which is in turn used in `date`
property setter. To see all available format tokens, read the
[moment.js' format documentation](http://momentjs.com/docs/#/displaying/format/).

Following is the list of valid moment.js ISO-8601 (computer and human readable) date formats.

```
YYYY-MM-DD
YYYY-MM-DDTHH
YYYY-MM-DD HH
YYYY-MM-DDTHH:mm
YYYY-MM-DD HH:mm
YYYY-MM-DDTHH:mm:ss
YYYY-MM-DD HH:mm:ss
YYYY-MM-DDTHH:mm:ss.SSS
YYYY-MM-DD HH:mm:ss.SSS
YYYY-MM-DDTHH:mm:ss Z
YYYY-MM-DD HH:mm:ss Z
```

The dates are set in the UTC timezone, so including the Z token is recommended.

## Custom setters

You can define your own property setters by passing them as functions into `setters` object. For example, this will
update the `timestamp` property inside `package.json`:

```js
grunt.initConfig({
	bumpup: {
		setters: {
			timestamp: function (oldTimestamp, releaseType, options) {
				return +new Date();
			}
		},
		file: 'package.json'
	}
});
```

You can also override the default setters for `version` and `date` properties if you want some more control, or
other than default behavior.

### Setter arguments

All setters receive the same 3 arguments:

- **1st** *old* Old property value.
- **2nd** *releaseType* Release type. Can be `major`, `minor`, `patch`, `prerelease`, or a valid semantic version.
- **3rd** *options* Options object, extended with default values.

Example showcasing simplified `version` & `date` setters:

```js
grunt.initConfig({
	bumpup: {
		setters: {
			version: function (oldVersion, releaseType, options) {
				return semver.inc(oldVersion, releaseType);
			},
			date: function (oldDate, releaseType, options) {
				return moment.utc().format(options.dateformat);
			}
		},
		file: 'package.json'
	}
});
```

### Return values

Each setter has to return the new property value, or when something went wrong, `grunt.fail.warn()` an error and return
`undefined`.

## Usage Examples

#### Release task

Example "release" task alias that handles everything needed to build a new project release:

```js
// Task configurations
grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),
	jshint: ...,
	uglify: ...,
	bumpup: {
		options: {
			updateProps: {
				pkg: 'package.json'
			}
		},
		file: 'package.json'
	},
	tagrelease: '<%= pkg.version %>'
});

// Loading the plugins
grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-bumpup');
grunt.loadNpmTasks('grunt-tagrelease');

// Alias task for release
grunt.registerTask('release', function (type) {
	type = type ? type : 'patch';     // Default release type
	grunt.task.run('jshint');         // Lint stuff
	grunt.task.run('bumpup:' + type); // Bump up the version
	grunt.task.run('uglify');         // Minify stuff
	grunt.task.run('tagrelease');     // Commit & tag the release
});
```

And now you can call it from CLI like this:

```shell
grunt release        // Default patch release
grunt release:minor  // Minor release
```