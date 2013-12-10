/** MIT License (c) copyright 2010-2013 B Cavalier & J Hann */

/**
 * curl i18n! cram plugin
 */
define(['../plugin/i18n'], function (i18n) {

	var tos, stringifiers, beenThereFlag;

	tos = Object.prototype.toString;
	stringifiers = {
		Array: arrayAsString,
		Boolean: asString,
		Date: dateAsString,
		Function: asString,
		Null: nullAsString,
		Number: asString,
		Object: objectAsString,
		RegExp: asString,
		String: stringAsString,
		Undefined: undefinedAsString
	};
	beenThereFlag = '__cram_i18n_flag__';

	function bundleToString (thing) {
		return thingToString(thing);
	}

	bundleToString.compile = function (pluginId, resId, req, io, config) {
		var absId, loaded;

		absId = pluginId + '!' + resId;

		// use the load method of the run-time plugin, snooping in on
		// requests.
		loaded = function (bundle) {
			var str;
			// convert to JSON with most Javascript objects preserved
			str = bundleToString(bundle);
			// wrap in define()
			str = 'define("'
				+ absId
				+ '", function () {\n\treturn '
				+ str
				+ ';\n});\n';
			io.write(str);
		};
		loaded.error = io.error;
		i18n.load(pluginId + '!' + resId, req, loaded, config);

	};

	return bundleToString;

	function thingToString (thing) {
		var t, stringifier;

		t = type(thing);
		stringifier = stringifiers[t];

		if (!stringifier) throw new Error('Can\'t encode i18n item of type ' + t);

		return stringifier(thing);
	}

	function asString (thing) {
		return thing.toString();
	}

	function nullAsString () {
		return 'null';
	}

	function stringAsString (s) {
		return '"' + s + '"';
	}

	function undefinedAsString () {
		return 'undefined';
	}

	function dateAsString (date) {
		return 'new Date("' + date + '")';
	}

	function arrayAsString (arr) {
		var i, len, items, item;
		arr[beenThereFlag] = true;
		items = [];
		for (i = 0, len = arr.length; i < len; i++) {
			item = arr[i];
			if (typeof item == 'object' && beenThereFlag in item) {
				throw new Error('Recursive object graphs not supported in i18n bundles.');
			}
			items.push(thingToString(item));
		}
		delete arr[beenThereFlag];
		return '[' + items.join(',') + ']';
	}

	function objectAsString (obj) {
		var p, items, item;
		obj[beenThereFlag] = true;
		items = [];
		for (p in obj) {
			if (p != beenThereFlag) {
				item = obj[p];
				if (typeof item == 'object' && beenThereFlag in item) {
					throw new Error('Recursive object graphs not supported in i18n bundles.');
				}
				items.push('"' + p + '":' + thingToString(item));
			}
		}
		delete obj[beenThereFlag];
		return '{' + items.join(',') + '}';
	}

	function type (thing) {
		return tos.call(thing).slice(8, -1);
	}

});
