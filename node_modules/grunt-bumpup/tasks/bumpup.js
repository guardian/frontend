/**
 * grunt-bumpup
 * https://github.com/Darsain/grunt-bumpup
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/MIT
 */
'use strict';

var semver = require('semver');
var moment = require('moment');

/**
 * Detect and return the indentation.
 *
 * @param  {String} string
 *
 * @return {Mixed} Indentation used, or undefined.
 */
function detectIndentation(string) {
	var tabs   = string.match(/^[\t]+/gm) || [];
	var spaces = string.match(/^[ ]+/gm) || [];

	// Pick the smallest indentation level of a prevalent type
	var prevalent = tabs.length >= spaces.length ? tabs : spaces;
	var indentation;
	for (var i = 0, il = prevalent.length; i < il; i++) {
		if (!indentation || prevalent[i].length < indentation.length) {
			indentation = prevalent[i];
		}
	}
	return indentation;
}

/**
 * Return type of the value.
 *
 * @param  {Mixed} value
 *
 * @return {String}
 */
function type(value) {
	return Object.prototype.toString.call(value).match(/^\[object ([a-z]+)\]$/i)[1].toLowerCase();
}

// Export the module
module.exports = function(grunt) {
	// Error handler
	function failed(error, message) {
		if (error) {
			grunt.log.error(error);
		}
		grunt.fail.warn(message || 'Tagrelease task failed.');
	}

	// Task definition
	grunt.registerTask('bumpup', 'Bumping up version & date properties.', function (releaseType) {
		// Normalize the release type
		if (typeof releaseType === 'string') {
			releaseType = releaseType.toLowerCase();
			if (!/^(major|minor|patch|prerelease)$/i.test(releaseType) && !semver.valid(releaseType)) {
				failed(null, '"' + releaseType + '" is not a valid release type, or a semantic version.');
				return;
			}
		} else {
			releaseType = 'patch';
		}

		// Get configuration and set the options
		var taskConfig = grunt.config('bumpup');
		var config = ['string', 'array'].indexOf(type(taskConfig)) !== -1 ? { files: taskConfig } : taskConfig;
		var files = type(config.files) === 'array' ? config.files : [config.file || config.files];
		var o = grunt.util._.extend({
			dateformat: 'YYYY-MM-DD HH:mm:ss Z',
			normalize: true,
			updateProps: {}
		}, config.options || {});
		var norm = {};

		if (!files.length) {
			grunt.log.warn('Nothing to bump up.');
			return;
		}

		// Create an object of property setters
		var setters = {
			version: function (old, type) {
				if (semver.valid(type)) {
					return type;
				}
				var oldVersion = semver.valid(old);
				if (!oldVersion) {
					grunt.log.warn('Version "' + old + '" is not a valid semantic version.');
					return;
				} else {
					return semver.inc(oldVersion, type);
				}
			},
			date: function (old, type, o) {
				return moment.utc().format(o.dateformat);
			}
		};
		Object.keys(config.setters || {}).forEach(function (key) {
			setters[key] = config.setters[key];
		});

		// Flip updateProps map for easier usage
		var updatePropsMap = {};
		Object.keys(o.updateProps).forEach(function (key) {
			updatePropsMap[o.updateProps[key]] = key;
		});

		// Bumpup the files
		files.filter(function (filepath) {
			// Remove nonexistent files.
			if (!grunt.file.exists(filepath)) {
				grunt.log.warn('File "' + filepath.cyan + '" not found.');
				return false;
			} else {
				return true;
			}
		}).forEach(function (filepath) {
			try {
				var file = grunt.file.read(filepath);
				var meta = JSON.parse(file);
				var indentation = detectIndentation(file);

				grunt.log.verbose.writeln('Bumping "' + filepath.cyan + '":');

				// Update properties with defined setters
				Object.keys(setters).forEach(function (key) {
					if (!Object.prototype.hasOwnProperty.call(meta, key)) {
						return;
					}

					var newValue;
					if (o.normalize && norm[key] != null) {
						newValue = norm[key];
					} else {
						norm[key] = newValue = setters[key](meta[key], releaseType, o);
					}

					if (newValue != null) {
						meta[key] = newValue;
						grunt.log.verbose.writeln(grunt.util.repeat(Math.max(16 - key.length, 0), ' ') + key + ' : ' + newValue);
					}
				});

				// Stringify new metafile and save
				if (!grunt.file.write(filepath, JSON.stringify(meta, null, indentation))) {
					grunt.log.warn('Couldn\'t write to "' + filepath + '"');
				}

				// Update config property
				if (updatePropsMap[filepath]) {
					grunt.config.set(updatePropsMap[filepath], meta);
				}
			} catch (error) {
				failed(error, 'Bumpup failed.');
			}
		}, this);

		grunt.log.writeln('Bumped to: ' + norm.version);
	});
};