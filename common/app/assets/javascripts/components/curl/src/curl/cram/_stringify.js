/** MIT License (c) copyright 2010-2013 B Cavalier & J Hann */

/**
 * curl _stringify plugin helper
 */
define(function () {

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

	stringify.null = nullAsString;
	stringify.undefined = undefinedAsString;
	stringify.boolean = asString;
	stringify.function = asString;
	stringify.number = asString;
	stringify.regExp = asString;
	stringify.string = stringAsString;
	stringify.date = dateAsString;
	stringify.array = arrayAsString;
	stringify.object = objectAsString;
	stringify.amdDefine = amdDefine;

	return stringify;

	function stringify (thing) {
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
			items.push(stringify(item));
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
				items.push('"' + p + '":' + stringify(item));
			}
		}
		delete obj[beenThereFlag];
		return '{' + items.join(',') + '}';
	}

	function type (thing) {
		return tos.call(thing).slice(8, -1);
	}

	function amdDefine (id, deps, args, exports) {
		return 'define("' + id + '", '
			+ (deps && deps.length ? arrayAsString(deps) + ', ' : '')
			+ 'function (' + (args && args.join(',')) + ') {\nreturn '
			+ exports
			+ ';\n});\n';
	}

});
