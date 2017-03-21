/* Polyfill service v3.17.0
 * For detailed credits and licence information see https://github.com/financial-times/polyfill-service.
 *
 * UA detected: safari/5.0.0
 * Features requested: default-3.6,es6,es7
 *
 * - Array.from, License: CC0 (required by "default-3.6", "es6")
 * - Array.of, License: MIT (required by "default-3.6", "es6")
 * - Array.prototype.fill, License: CC0 (required by "default-3.6", "es6")
 * - Window, License: CC0 (required by "default-3.6", "Event", "CustomEvent")
 * - Event, License: CC0 (required by "default-3.6", "CustomEvent", "Promise", "es6")
 * - CustomEvent, License: CC0 (required by "default-3.6")
 * - _DOMTokenList, License: CC0 (required by "DOMTokenList", "default-3.6")
 * - DOMTokenList, License: CC0 (required by "default-3.6")
 * - _mutation, License: CC0 (required by "Element.prototype.after", "default-3.6", "Element.prototype.append", "Element.prototype.before", "Element.prototype.prepend", "Element.prototype.remove", "Element.prototype.replaceWith")
 * - Element.prototype.after, License: CC0 (required by "default-3.6")
 * - Element.prototype.append, License: CC0 (required by "default-3.6")
 * - Element.prototype.before, License: CC0 (required by "default-3.6")
 * - Element.prototype.matches, License: CC0 (required by "default-3.6", "Element.prototype.closest")
 * - Element.prototype.closest, License: CC0 (required by "default-3.6")
 * - Element.prototype.prepend, License: CC0 (required by "default-3.6")
 * - Element.prototype.remove, License: CC0 (required by "default-3.6")
 * - Element.prototype.replaceWith, License: CC0 (required by "default-3.6")
 * - Function.prototype.bind, License: MIT (required by "default-3.6", "_ArrayIterator", "Array.prototype.@@iterator", "es6", "Array.prototype.entries", "Array.prototype.keys", "Object.getOwnPropertyDescriptor", "Object.setPrototypeOf", "Symbol", "Map", "Set", "Symbol.hasInstance", "Symbol.isConcatSpreadable", "Symbol.iterator", "Array.prototype.values", "Symbol.match", "Symbol.replace", "Symbol.search", "Symbol.species", "Symbol.split", "Symbol.toPrimitive", "Symbol.toStringTag", "Symbol.unscopables")
 * - Symbol, License: MIT (required by "es6", "Map", "default-3.6", "Set", "Symbol.hasInstance", "Symbol.isConcatSpreadable", "Symbol.iterator", "Array.prototype.@@iterator", "Array.prototype.entries", "Array.prototype.keys", "Array.prototype.values", "Symbol.match", "Symbol.replace", "Symbol.search", "Symbol.species", "Symbol.split", "Symbol.toPrimitive", "Symbol.toStringTag", "Symbol.unscopables", "_ArrayIterator")
 * - Symbol.iterator, License: MIT (required by "es6", "Map", "default-3.6", "Set", "Array.prototype.@@iterator", "Array.prototype.entries", "Array.prototype.keys", "Array.prototype.values", "_ArrayIterator")
 * - Symbol.species, License: MIT (required by "es6", "Map", "default-3.6", "Set")
 * - Number.isNaN, License: MIT (required by "default-3.6", "es6", "Map", "Set")
 * - Map, License: CC0 (required by "default-3.6", "es6")
 * - Object.assign, License: CC0 (required by "default-3.6", "es6", "_ArrayIterator", "Array.prototype.@@iterator", "Array.prototype.entries", "Array.prototype.keys")
 * - setImmediate, License: CC0 (required by "Promise", "default-3.6", "es6")
 * - Promise, License: MIT (required by "default-3.6", "es6")
 * - Set, License: CC0 (required by "default-3.6", "es6")
 * - String.prototype.endsWith, License: CC0 (required by "default-3.6", "es6")
 * - String.prototype.includes, License: CC0 (required by "default-3.6", "es6", "String.prototype.contains", "_ArrayIterator", "Array.prototype.@@iterator", "Array.prototype.entries", "Array.prototype.keys")
 * - String.prototype.startsWith, License: CC0 (required by "default-3.6", "es6")
 * - URL, License: CC0 (required by "default-3.6")
 * - location.origin, License: CC0 (required by "default-3.6")
 * - performance.now, License: CC0 (required by "requestAnimationFrame", "default-3.6")
 * - requestAnimationFrame, License: MIT (required by "default-3.6")
 * - Object.setPrototypeOf, License: MIT (required by "es6", "_ArrayIterator", "Array.prototype.@@iterator", "Array.prototype.entries", "Array.prototype.keys")
 * - String.prototype.contains, License: CC0 (required by "_ArrayIterator", "Array.prototype.@@iterator", "es6", "Array.prototype.entries", "Array.prototype.keys")
 * - Symbol.toStringTag, License: MIT (required by "es6", "_ArrayIterator", "Array.prototype.@@iterator", "Array.prototype.entries", "Array.prototype.keys")
 * - _ArrayIterator, License: MIT (required by "Array.prototype.@@iterator", "es6", "Array.prototype.entries", "Array.prototype.keys")
 * - Array.prototype.@@iterator, License: CC0 (required by "es6", "Array.prototype.values")
 * - Array.prototype.entries, License: CC0 (required by "es6")
 * - Array.prototype.find, License: CC0 (required by "es6")
 * - Array.prototype.findIndex, License: CC0 (required by "es6")
 * - Array.prototype.keys, License: CC0 (required by "es6")
 * - Array.prototype.values, License: MIT (required by "es6")
 * - Math.acosh, License: CC0 (required by "es6")
 * - Math.asinh, License: CC0 (required by "es6")
 * - Math.atanh, License: CC0 (required by "es6")
 * - Math.cbrt, License: CC0 (required by "es6")
 * - Math.clz32, License: CC0 (required by "es6")
 * - Math.cosh, License: CC0 (required by "es6")
 * - Math.expm1, License: CC0 (required by "es6")
 * - Math.hypot, License: CC0 (required by "es6")
 * - Math.imul, License: CC0 (required by "es6")
 * - Math.log10, License: CC0 (required by "es6")
 * - Math.log1p, License: CC0 (required by "es6")
 * - Math.log2, License: CC0 (required by "es6")
 * - Math.sign, License: CC0 (required by "es6")
 * - Math.sinh, License: CC0 (required by "es6")
 * - Math.tanh, License: CC0 (required by "es6")
 * - Math.trunc, License: CC0 (required by "es6")
 * - Number.MAX_SAFE_INTEGER, License: MIT (required by "es6")
 * - Number.MIN_SAFE_INTEGER, License: MIT (required by "es6")
 * - Number.isFinite, License: MIT (required by "es6")
 * - Number.isInteger, License: MIT (required by "es6")
 * - Number.parseFloat, License: MIT (required by "es6")
 * - Number.parseInt, License: MIT (required by "es6")
 * - Object.is, License: CC0 (required by "es6")
 * - String.prototype.repeat, License: CC0 (required by "es6")
 * - Symbol.hasInstance, License: MIT (required by "es6")
 * - Symbol.isConcatSpreadable, License: MIT (required by "es6")
 * - Symbol.match, License: MIT (required by "es6")
 * - Symbol.replace, License: MIT (required by "es6")
 * - Symbol.search, License: MIT (required by "es6")
 * - Symbol.split, License: MIT (required by "es6")
 * - Symbol.toPrimitive, License: MIT (required by "es6")
 * - Symbol.unscopables, License: MIT (required by "es6")
 * - WeakMap, License: https://github.com/webcomponents/webcomponentsjs/blob/master/LICENSE.md (required by "es6")
 * - WeakSet, License: https://github.com/webcomponents/webcomponentsjs/blob/master/LICENSE.md (required by "es6")
 * - Array.prototype.includes, License: CC0 (required by "es7") */

(function(undefined) {
if (!('from' in Array && (function () {
	try {
		Array.from({ length: -Infinity });

		return true;
	} catch (e) {
		return false;
	}
})())) {

// Array.from

// Wrapped in IIFE to prevent leaking to global scope.
(function () {
	function parseIterable (arraylike) {
		var done = false;
		var iterableResponse;
		var tempArray = [];

		// if the iterable doesn't have next;
		// it is an iterable if 'next' is a function but it has not been defined on
		// the object itself.
		if (typeof arraylike.next === 'function') {
			while (!done) {
				iterableResponse = arraylike.next();
				if (
					iterableResponse.hasOwnProperty('value') &&
					iterableResponse.hasOwnProperty('done')
				) {
					if (iterableResponse.done === true) {
						done = true;
						break;

					// handle the case where the done value is not Boolean
					} else if (iterableResponse.done !== false) {
						break;
					}

					tempArray.push(iterableResponse.value);
				} else {

					// it does not conform to the iterable pattern
					break;
				}
			}
		}

		if (done) {
			return tempArray;
		} else {

			// something went wrong return false;
			return false;
		}

	}

	Object.defineProperty(Array, 'from', {
		configurable: true,
		value: function from(source) {
			// handle non-objects
			if (source === undefined || source === null) {
				throw new TypeError(source + ' is not an object');
			}

			// handle maps that are not functions
			if (1 in arguments && !(arguments[1] instanceof Function)) {
				throw new TypeError(arguments[1] + ' is not a function');
			}

			var arraylike = typeof source === 'string' ? source.split('') : Object(source);
			var map = arguments[1];
			var scope = arguments[2];
			var array = [];
			var index = -1;
			var length = Math.min(Math.max(Number(arraylike.length) || 0, 0), 9007199254740991);
			var value;

			// variables for rebuilding array from iterator
			var arrayFromIterable;

			// if it is an iterable treat like one
			arrayFromIterable = parseIterable(arraylike);

			//if it is a Map or a Set then handle them appropriately
			if (
				typeof arraylike.entries === 'function' &&
				typeof arraylike.values === 'function'
			) {
				if (arraylike.constructor.name === 'Set' && 'values' in Set.prototype) {
					arrayFromIterable = parseIterable(arraylike.values());
				}
				if (arraylike.constructor.name === 'Map' && 'entries' in Map.prototype) {
					arrayFromIterable = parseIterable(arraylike.entries());
				}
			}

			if (arrayFromIterable) {
				arraylike = arrayFromIterable;
				length = arrayFromIterable.length;
			}

			while (++index < length) {
					value = arraylike[index];

					array[index] = map ? map.call(scope, value, index) : value;
			}

			array.length = length;

			return array;
		},
		writable: true
	});
}());

}

if (!('of' in Array)) {

// Array.of
/*! https://mths.be/array-of v0.1.0 by @mathias */
(function () {
	'use strict';
	var defineProperty = (function () {
		// IE 8 only supports `Object.defineProperty` on DOM elements
		try {
			var object = {};
			var $defineProperty = Object.defineProperty;
			var result = $defineProperty(object, object, object) && $defineProperty;
		} catch (error) { /**/ }
		return result;
	}());
	var isConstructor = function isConstructor(Constructor) {
		try {
			return !!new Constructor();
		} catch (_) {
			return false;
		}
	};
	var of = function of() {
		var items = arguments;
		var length = items.length;
		var Me = this;
		var result = isConstructor(Me) ? new Me(length) : new Array(length);
		var index = 0;
		var value;
		while (index < length) {
			value = items[index];
			if (defineProperty) {
				defineProperty(result, index, {
					'value': value,
					'writable': true,
					'enumerable': true,
					'configurable': true
				});
			} else {
				result[index] = value;
			}
			index += 1;
		}
		result.length = length;
		return result;
	};
	if (defineProperty) {
		defineProperty(Array, 'of', {
			'value': of,
			'configurable': true,
			'writable': true
		});
	} else {
		Array.of = of;
	}
}());

}

if (!('fill' in Array.prototype)) {

// Array.prototype.fill
Object.defineProperty(Array.prototype, 'fill', {
	configurable: true,
	value: function fill(value) {
		if (this === undefined || this === null) {
			throw new TypeError(this + ' is not an object');
		}

		var arrayLike = Object(this);

		var length = Math.max(Math.min(arrayLike.length, 9007199254740991), 0) || 0;

		var relativeStart = 1 in arguments ? parseInt(Number(arguments[1]), 10) || 0 : 0;

		relativeStart = relativeStart < 0 ? Math.max(length + relativeStart, 0) : Math.min(relativeStart, length);

		var relativeEnd = 2 in arguments && arguments[2] !== undefined ? parseInt(Number(arguments[2]), 10) || 0 : length;

		relativeEnd = relativeEnd < 0 ? Math.max(length + arguments[2], 0) : Math.min(relativeEnd, length);

		while (relativeStart < relativeEnd) {
			arrayLike[relativeStart] = value;

			++relativeStart;
		}

		return arrayLike;
	},
	writable: true
});

}

if (!('Window' in this)) {

// Window
(function(global) {
	if (global.constructor) {
		global.Window = global.constructor;
	} else {
		(global.Window = global.constructor = new Function('return function Window() {}')()).prototype = this;
	}
}(this));

}

if (!((function(global) {

	if (!('Event' in global)) return false;
	if (typeof global.Event === 'function') return true;

	try {

		// In IE 9-11, the Event object exists but cannot be instantiated
		new Event('click');
		return true;
	} catch(e) {
		return false;
	}
}(this)))) {

// Event
(function () {
	var unlistenableWindowEvents = {
		click: 1,
		dblclick: 1,
		keyup: 1,
		keypress: 1,
		keydown: 1,
		mousedown: 1,
		mouseup: 1,
		mousemove: 1,
		mouseover: 1,
		mouseenter: 1,
		mouseleave: 1,
		mouseout: 1,
		storage: 1,
		storagecommit: 1,
		textinput: 1
	};

	function indexOf(array, element) {
		var
		index = -1,
		length = array.length;

		while (++index < length) {
			if (index in array && array[index] === element) {
				return index;
			}
		}

		return -1;
	}

	var existingProto = (window.Event && window.Event.prototype) || null;
	window.Event = Window.prototype.Event = function Event(type, eventInitDict) {
		if (!type) {
			throw new Error('Not enough arguments');
		}

		// Shortcut if browser supports createEvent
		if ('createEvent' in document) {
			var event = document.createEvent('Event');
			var bubbles = eventInitDict && eventInitDict.bubbles !== undefined ? eventInitDict.bubbles : false;
			var cancelable = eventInitDict && eventInitDict.cancelable !== undefined ? eventInitDict.cancelable : false;

			event.initEvent(type, bubbles, cancelable);

			return event;
		}

		var event = document.createEventObject();

		event.type = type;
		event.bubbles = eventInitDict && eventInitDict.bubbles !== undefined ? eventInitDict.bubbles : false;
		event.cancelable = eventInitDict && eventInitDict.cancelable !== undefined ? eventInitDict.cancelable : false;

		return event;
	};
	if (existingProto) {
		Object.defineProperty(window.Event, 'prototype', {
			configurable: false,
			enumerable: false,
			writable: true,
			value: existingProto
		});
	}

	if (!('createEvent' in document)) {
		window.addEventListener = Window.prototype.addEventListener = Document.prototype.addEventListener = Element.prototype.addEventListener = function addEventListener() {
			var
			element = this,
			type = arguments[0],
			listener = arguments[1];

			if (element === window && type in unlistenableWindowEvents) {
				throw new Error('In IE8 the event: ' + type + ' is not available on the window object. Please see https://github.com/Financial-Times/polyfill-service/issues/317 for more information.');
			}

			if (!element._events) {
				element._events = {};
			}

			if (!element._events[type]) {
				element._events[type] = function (event) {
					var
					list = element._events[event.type].list,
					events = list.slice(),
					index = -1,
					length = events.length,
					eventElement;

					event.preventDefault = function preventDefault() {
						if (event.cancelable !== false) {
							event.returnValue = false;
						}
					};

					event.stopPropagation = function stopPropagation() {
						event.cancelBubble = true;
					};

					event.stopImmediatePropagation = function stopImmediatePropagation() {
						event.cancelBubble = true;
						event.cancelImmediate = true;
					};

					event.currentTarget = element;
					event.relatedTarget = event.fromElement || null;
					event.target = event.target || event.srcElement || element;
					event.timeStamp = new Date().getTime();

					if (event.clientX) {
						event.pageX = event.clientX + document.documentElement.scrollLeft;
						event.pageY = event.clientY + document.documentElement.scrollTop;
					}

					while (++index < length && !event.cancelImmediate) {
						if (index in events) {
							eventElement = events[index];

							if (indexOf(list, eventElement) !== -1 && typeof eventElement === 'function') {
								eventElement.call(element, event);
							}
						}
					}
				};

				element._events[type].list = [];

				if (element.attachEvent) {
					element.attachEvent('on' + type, element._events[type]);
				}
			}

			element._events[type].list.push(listener);
		};

		window.removeEventListener = Window.prototype.removeEventListener = Document.prototype.removeEventListener = Element.prototype.removeEventListener = function removeEventListener() {
			var
			element = this,
			type = arguments[0],
			listener = arguments[1],
			index;

			if (element._events && element._events[type] && element._events[type].list) {
				index = indexOf(element._events[type].list, listener);

				if (index !== -1) {
					element._events[type].list.splice(index, 1);

					if (!element._events[type].list.length) {
						if (element.detachEvent) {
							element.detachEvent('on' + type, element._events[type]);
						}
						delete element._events[type];
					}
				}
			}
		};

		window.dispatchEvent = Window.prototype.dispatchEvent = Document.prototype.dispatchEvent = Element.prototype.dispatchEvent = function dispatchEvent(event) {
			if (!arguments.length) {
				throw new Error('Not enough arguments');
			}

			if (!event || typeof event.type !== 'string') {
				throw new Error('DOM Events Exception 0');
			}

			var element = this, type = event.type;

			try {
				if (!event.bubbles) {
					event.cancelBubble = true;

					var cancelBubbleEvent = function (event) {
						event.cancelBubble = true;

						(element || window).detachEvent('on' + type, cancelBubbleEvent);
					};

					this.attachEvent('on' + type, cancelBubbleEvent);
				}

				this.fireEvent('on' + type, event);
			} catch (error) {
				event.target = element;

				do {
					event.currentTarget = element;

					if ('_events' in element && typeof element._events[type] === 'function') {
						element._events[type].call(element, event);
					}

					if (typeof element['on' + type] === 'function') {
						element['on' + type].call(element, event);
					}

					element = element.nodeType === 9 ? element.parentWindow : element.parentNode;
				} while (element && !event.cancelBubble);
			}

			return true;
		};

		// Add the DOMContentLoaded Event
		document.attachEvent('onreadystatechange', function() {
			if (document.readyState === 'complete') {
				document.dispatchEvent(new Event('DOMContentLoaded', {
					bubbles: true
				}));
			}
		});
	}
}());

}

if (!('CustomEvent' in this &&

// In Safari, typeof CustomEvent == 'object' but it otherwise works fine
(typeof this.CustomEvent === 'function' ||
(this.CustomEvent.toString().indexOf('CustomEventConstructor')>-1)))) {

// CustomEvent
this.CustomEvent = function CustomEvent(type, eventInitDict) {
	if (!type) {
		throw Error('TypeError: Failed to construct "CustomEvent": An event name must be provided.');
	}

	var event;
	eventInitDict = eventInitDict || {bubbles: false, cancelable: false, detail: null};

	if ('createEvent' in document) {
		try {
			event = document.createEvent('CustomEvent');
			event.initCustomEvent(type, eventInitDict.bubbles, eventInitDict.cancelable, eventInitDict.detail);
		} catch (error) {
			// for browsers which don't support CustomEvent at all, we use a regular event instead
			event = document.createEvent('Event');
			event.initEvent(type, eventInitDict.bubbles, eventInitDict.cancelable);
			event.detail = eventInitDict.detail;
		}
	} else {

		// IE8
		event = new Event(type, eventInitDict);
		event.detail = eventInitDict && eventInitDict.detail || null;
	}
	return event;
};

CustomEvent.prototype = Event.prototype;

}


// _DOMTokenList
var _DOMTokenList = (function () { // eslint-disable-line no-unused-vars

	function tokenize(token) {
		if (/^-?[_a-zA-Z]+[_a-zA-Z0-9-]*$/.test(token)) {
			return String(token);
		} else {
			throw new Error('InvalidCharacterError: DOM Exception 5');
		}
	}

	function toObject(self) {
		for (var index = -1, object = {}, element; element = self[++index];) {
			object[element] = true;
		}

		return object;
	}

	function fromObject(self, object) {
		var array = [], token;

		for (token in object) {
			if (object[token]) {
				array.push(token);
			}
		}

		[].splice.apply(self, [0, self.length].concat(array));
	}

	var DTL = function() {};

	DTL.prototype = {
		constructor: DTL,
		item: function item(index) {
			return this[parseFloat(index)] || null;
		},
		length: Array.prototype.length,
		toString: function toString() {
			return [].join.call(this, ' ');
		},

		add: function add() {
			for (var object = toObject(this), index = 0, token; index in arguments; ++index) {
				token = tokenize(arguments[index]);

				object[token] = true;
			}

			fromObject(this, object);
		},
		contains: function contains(token) {
			return token in toObject(this);
		},
		remove: function remove() {
			for (var object = toObject(this), index = 0, token; index in arguments; ++index) {
				token = tokenize(arguments[index]);

				object[token] = false;
			}

			fromObject(this, object);
		},
		toggle: function toggle(token) {
			var
			object = toObject(this),
			contains = 1 in arguments ? !arguments[1] : tokenize(token) in object;

			object[token] = !contains;

			fromObject(this, object);

			return !contains;
		}
	};

	return DTL;

}());
if (!('DOMTokenList' in this && (function (x) {
	return 'classList' in x ? !x.classList.toggle('x', false) && !x.className : true;
})(document.createElement('x')))) {

// DOMTokenList
(function (global) {
	var nativeImpl = "DOMTokenList" in global && global.DOMTokenList;

	if (!nativeImpl) {
		global.DOMTokenList = _DOMTokenList;
	} else {
		var NativeToggle = nativeImpl.prototype.toggle;

		nativeImpl.prototype.toggle = function toggle(token) {
			if (1 in arguments) {
				var contains = this.contains(token);
				var force = !!arguments[1];

				if ((contains && force) || (!contains && !force)) {
					return force;
				}
			}

			return NativeToggle.call(this, token);
		};

	}

}(this));

}


// _mutation
// http://dom.spec.whatwg.org/#mutation-method-macro
function _mutation(nodes) { // eslint-disable-line no-unused-vars
	if (!nodes.length) {
		throw new Error('DOM Exception 8');
	} else if (nodes.length === 1) {
		return typeof nodes[0] === 'string' ? document.createTextNode(nodes[0]) : nodes[0];
	} else {
		var
		fragment = document.createDocumentFragment(),
		length = nodes.length,
		index = -1,
		node;

		while (++index < length) {
			node = nodes[index];

			fragment.appendChild(typeof node === 'string' ? document.createTextNode(node) : node);
		}

		return fragment;
	}
}
if (!('Element' in this && 'after' in Element.prototype)) {

// Element.prototype.after
Document.prototype.after = Element.prototype.after = function after() {
	if (this.parentNode) {
		this.parentNode.insertBefore(_mutation(arguments), this.nextSibling);
	}
};

// Not all UAs support the Text constructor.  Polyfill on the Text constructor only where it exists
// TODO: Add a polyfill for the Text constructor, and make it a dependency of this polyfill.
if ("Text" in this) {
	Text.prototype.after = Element.prototype.after;
}

}

if (!('Element' in this && 'append' in Element.prototype)) {

// Element.prototype.append
Document.prototype.append = Element.prototype.append = function append() {
	this.appendChild(_mutation(arguments));
};

}

if (!('Element' in this && 'before' in Element.prototype)) {

// Element.prototype.before
Document.prototype.before = Element.prototype.before = function before() {
	if (this.parentNode) {
		this.parentNode.insertBefore(_mutation(arguments), this);
	}
};

// Not all UAs support the Text constructor.  Polyfill on the Text constructor only where it exists
// TODO: Add a polyfill for the Text constructor, and make it a dependency of this polyfill.
if ("Text" in this) {
	Text.prototype.before = Element.prototype.before;
}

}

if (!('document' in this && "matches" in document.documentElement)) {

// Element.prototype.matches
Element.prototype.matches = Element.prototype.webkitMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.mozMatchesSelector || function matches(selector) {

	var element = this;
	var elements = (element.document || element.ownerDocument).querySelectorAll(selector);
	var index = 0;

	while (elements[index] && elements[index] !== element) {
		++index;
	}

	return !!elements[index];
};

}

if (!('document' in this && "closest" in document.documentElement)) {

// Element.prototype.closest
Element.prototype.closest = function closest(selector) {
	var node = this;

	while (node) {
		if (node.matches(selector)) return node;
		else node = node.parentElement;
	}

	return null;
};

}

if (!('Element' in this && 'prepend' in Element.prototype)) {

// Element.prototype.prepend
Document.prototype.prepend = Element.prototype.prepend = function prepend() {
	this.insertBefore(_mutation(arguments), this.firstChild);
};

}

if (!('Element' in this && 'remove' in Element.prototype)) {

// Element.prototype.remove
Document.prototype.remove = Element.prototype.remove = function remove() {
	if (this.parentNode) {
		this.parentNode.removeChild(this);
	}
};

// Not all UAs support the Text constructor.  Polyfill on the Text constructor only where it exists
// TODO: Add a polyfill for the Text constructor, and make it a dependency of this polyfill.
if ("Text" in this) {
	Text.prototype.remove = Element.prototype.remove;
}

}

if (!('Element' in this && 'replaceWith' in Element.prototype)) {

// Element.prototype.replaceWith
Document.prototype.replaceWith = Element.prototype.replaceWith = function replaceWith() {
	if (this.parentNode) {
		this.parentNode.replaceChild(_mutation(arguments), this);
	}
};

// Not all UAs support the Text constructor.  Polyfill on the Text constructor only where it exists
// TODO: Add a polyfill for the Text constructor, and make it a dependency of this polyfill.
if ('Text' in this) {
	Text.prototype.replaceWith = Element.prototype.replaceWith;
}

}

if (!('bind' in Function.prototype)) {

// Function.prototype.bind
// https://github.com/es-shims/es5-shim/blob/d6d7ff1b131c7ba14c798cafc598bb6780d37d3b/es5-shim.js#L182
Object.defineProperty(Function.prototype, 'bind', {
    value: function bind(that) { // .length is 1
        // add necessary es5-shim utilities
        var $Array = Array;
        var $Object = Object;
        var ObjectPrototype = $Object.prototype;
        var ArrayPrototype = $Array.prototype;
        var Empty = function Empty() {};
        var to_string = ObjectPrototype.toString;
        var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';
        var isCallable; /* inlined from https://npmjs.com/is-callable */ var fnToStr = Function.prototype.toString, tryFunctionObject = function tryFunctionObject(value) { try { fnToStr.call(value); return true; } catch (e) { return false; } }, fnClass = '[object Function]', genClass = '[object GeneratorFunction]'; isCallable = function isCallable(value) { if (typeof value !== 'function') { return false; } if (hasToStringTag) { return tryFunctionObject(value); } var strClass = to_string.call(value); return strClass === fnClass || strClass === genClass; };
        var array_slice = ArrayPrototype.slice;
        var array_concat = ArrayPrototype.concat;
        var array_push = ArrayPrototype.push;
        var max = Math.max;
        // /add necessary es5-shim utilities

        // 1. Let Target be the this value.
        var target = this;
        // 2. If IsCallable(Target) is false, throw a TypeError exception.
        if (!isCallable(target)) {
            throw new TypeError('Function.prototype.bind called on incompatible ' + target);
        }
        // 3. Let A be a new (possibly empty) internal list of all of the
        //   argument values provided after thisArg (arg1, arg2 etc), in order.
        // XXX slicedArgs will stand in for "A" if used
        var args = array_slice.call(arguments, 1); // for normal call
        // 4. Let F be a new native ECMAScript object.
        // 11. Set the [[Prototype]] internal property of F to the standard
        //   built-in Function prototype object as specified in 15.3.3.1.
        // 12. Set the [[Call]] internal property of F as described in
        //   15.3.4.5.1.
        // 13. Set the [[Construct]] internal property of F as described in
        //   15.3.4.5.2.
        // 14. Set the [[HasInstance]] internal property of F as described in
        //   15.3.4.5.3.
        var bound;
        var binder = function () {

            if (this instanceof bound) {
                // 15.3.4.5.2 [[Construct]]
                // When the [[Construct]] internal method of a function object,
                // F that was created using the bind function is called with a
                // list of arguments ExtraArgs, the following steps are taken:
                // 1. Let target be the value of F's [[TargetFunction]]
                //   internal property.
                // 2. If target has no [[Construct]] internal method, a
                //   TypeError exception is thrown.
                // 3. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the
                //   list boundArgs in the same order followed by the same
                //   values as the list ExtraArgs in the same order.
                // 5. Return the result of calling the [[Construct]] internal
                //   method of target providing args as the arguments.

                var result = target.apply(
                    this,
                    array_concat.call(args, array_slice.call(arguments))
                );
                if ($Object(result) === result) {
                    return result;
                }
                return this;

            } else {
                // 15.3.4.5.1 [[Call]]
                // When the [[Call]] internal method of a function object, F,
                // which was created using the bind function is called with a
                // this value and a list of arguments ExtraArgs, the following
                // steps are taken:
                // 1. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 2. Let boundThis be the value of F's [[BoundThis]] internal
                //   property.
                // 3. Let target be the value of F's [[TargetFunction]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the
                //   list boundArgs in the same order followed by the same
                //   values as the list ExtraArgs in the same order.
                // 5. Return the result of calling the [[Call]] internal method
                //   of target providing boundThis as the this value and
                //   providing args as the arguments.

                // equiv: target.call(this, ...boundArgs, ...args)
                return target.apply(
                    that,
                    array_concat.call(args, array_slice.call(arguments))
                );

            }

        };

        // 15. If the [[Class]] internal property of Target is "Function", then
        //     a. Let L be the length property of Target minus the length of A.
        //     b. Set the length own property of F to either 0 or L, whichever is
        //       larger.
        // 16. Else set the length own property of F to 0.

        var boundLength = max(0, target.length - args.length);

        // 17. Set the attributes of the length own property of F to the values
        //   specified in 15.3.5.1.
        var boundArgs = [];
        for (var i = 0; i < boundLength; i++) {
            array_push.call(boundArgs, '$' + i);
        }

        // XXX Build a dynamic function with desired amount of arguments is the only
        // way to set the length property of a function.
        // In environments where Content Security Policies enabled (Chrome extensions,
        // for ex.) all use of eval or Function costructor throws an exception.
        // However in all of these environments Function.prototype.bind exists
        // and so this code will never be executed.
        bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this, arguments); }')(binder);

        if (target.prototype) {
            Empty.prototype = target.prototype;
            bound.prototype = new Empty();
            // Clean up dangling references.
            Empty.prototype = null;
        }

        // TODO
        // 18. Set the [[Extensible]] internal property of F to true.

        // TODO
        // 19. Let thrower be the [[ThrowTypeError]] function Object (13.2.3).
        // 20. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "caller", PropertyDescriptor {[[Get]]: thrower, [[Set]]:
        //   thrower, [[Enumerable]]: false, [[Configurable]]: false}, and
        //   false.
        // 21. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "arguments", PropertyDescriptor {[[Get]]: thrower,
        //   [[Set]]: thrower, [[Enumerable]]: false, [[Configurable]]: false},
        //   and false.

        // TODO
        // NOTE Function objects created using Function.prototype.bind do not
        // have a prototype property or the [[Code]], [[FormalParameters]], and
        // [[Scope]] internal properties.
        // XXX can't delete prototype in pure-js.

        // 22. Return F.
        return bound;
    }
});

}

if (!('Symbol' in this)) {

// Symbol
// A modification of https://github.com/WebReflection/get-own-property-symbols
// (C) Andrea Giammarchi - MIT Licensed

(function (Object, GOPS, global) {

	var	setDescriptor;
	var id = 0;
	var random = '' + Math.random();
	var prefix = '__\x01symbol:';
	var prefixLength = prefix.length;
	var internalSymbol = '__\x01symbol@@' + random;
	var DP = 'defineProperty';
	var DPies = 'defineProperties';
	var GOPN = 'getOwnPropertyNames';
	var GOPD = 'getOwnPropertyDescriptor';
	var PIE = 'propertyIsEnumerable';
	var ObjectProto = Object.prototype;
	var hOP = ObjectProto.hasOwnProperty;
	var pIE = ObjectProto[PIE];
	var toString = ObjectProto.toString;
	var concat = Array.prototype.concat;
	var cachedWindowNames = typeof window === 'object' ? Object.getOwnPropertyNames(window) : [];
	var nGOPN = Object[GOPN];
	var gOPN = function getOwnPropertyNames (obj) {
		if (toString.call(obj) === '[object Window]') {
			try {
				return nGOPN(obj);
			} catch (e) {
				// IE bug where layout engine calls userland gOPN for cross-domain `window` objects
				return concat.call([], cachedWindowNames);
			}
		}
		return nGOPN(obj);
	};
	var gOPD = Object[GOPD];
	var create = Object.create;
	var keys = Object.keys;
	var freeze = Object.freeze || Object;
	var defineProperty = Object[DP];
	var $defineProperties = Object[DPies];
	var descriptor = gOPD(Object, GOPN);
	var addInternalIfNeeded = function (o, uid, enumerable) {
		if (!hOP.call(o, internalSymbol)) {
			try {
				defineProperty(o, internalSymbol, {
					enumerable: false,
					configurable: false,
					writable: false,
					value: {}
				});
			} catch (e) {
				o[internalSymbol] = {};
			}
		}
		o[internalSymbol]['@@' + uid] = enumerable;
	};
	var createWithSymbols = function (proto, descriptors) {
		var self = create(proto);
		gOPN(descriptors).forEach(function (key) {
			if (propertyIsEnumerable.call(descriptors, key)) {
				$defineProperty(self, key, descriptors[key]);
			}
		});
		return self;
	};
	var copyAsNonEnumerable = function (descriptor) {
		var newDescriptor = create(descriptor);
		newDescriptor.enumerable = false;
		return newDescriptor;
	};
	var get = function get(){};
	var onlyNonSymbols = function (name) {
		return name != internalSymbol &&
			!hOP.call(source, name);
	};
	var onlySymbols = function (name) {
		return name != internalSymbol &&
			hOP.call(source, name);
	};
	var propertyIsEnumerable = function propertyIsEnumerable(key) {
		var uid = '' + key;
		return onlySymbols(uid) ? (
			hOP.call(this, uid) &&
			this[internalSymbol]['@@' + uid]
		) : pIE.call(this, key);
	};
	var setAndGetSymbol = function (uid) {
		var descriptor = {
			enumerable: false,
			configurable: true,
			get: get,
			set: function (value) {
			setDescriptor(this, uid, {
				enumerable: false,
				configurable: true,
				writable: true,
				value: value
			});
			addInternalIfNeeded(this, uid, true);
			}
		};
		try {
			defineProperty(ObjectProto, uid, descriptor);
		} catch (e) {
			ObjectProto[uid] = descriptor.value;
		}
		return freeze(source[uid] = defineProperty(
			Object(uid),
			'constructor',
			sourceConstructor
		));
	};
	var Symbol = function Symbol(description) {
		if (this instanceof Symbol) {
			throw new TypeError('Symbol is not a constructor');
		}
		return setAndGetSymbol(
			prefix.concat(description || '', random, ++id)
		);
		};
	var source = create(null);
	var sourceConstructor = {value: Symbol};
	var sourceMap = function (uid) {
		return source[uid];
		};
	var $defineProperty = function defineProp(o, key, descriptor) {
		var uid = '' + key;
		if (onlySymbols(uid)) {
			setDescriptor(o, uid, descriptor.enumerable ?
				copyAsNonEnumerable(descriptor) : descriptor);
			addInternalIfNeeded(o, uid, !!descriptor.enumerable);
		} else {
			defineProperty(o, key, descriptor);
		}
		return o;
	};

	var onlyInternalSymbols = function (obj) {
		return function (name) {
			return hOP.call(obj, internalSymbol) && hOP.call(obj[internalSymbol], '@@' + name);
		};
	};
	var $getOwnPropertySymbols = function getOwnPropertySymbols(o) {
		return gOPN(o).filter(o === ObjectProto ? onlyInternalSymbols(o) : onlySymbols).map(sourceMap);
		}
	;

	descriptor.value = $defineProperty;
	defineProperty(Object, DP, descriptor);

	descriptor.value = $getOwnPropertySymbols;
	defineProperty(Object, GOPS, descriptor);

	descriptor.value = function getOwnPropertyNames(o) {
		return gOPN(o).filter(onlyNonSymbols);
	};
	defineProperty(Object, GOPN, descriptor);

	descriptor.value = function defineProperties(o, descriptors) {
		var symbols = $getOwnPropertySymbols(descriptors);
		if (symbols.length) {
		keys(descriptors).concat(symbols).forEach(function (uid) {
			if (propertyIsEnumerable.call(descriptors, uid)) {
			$defineProperty(o, uid, descriptors[uid]);
			}
		});
		} else {
		$defineProperties(o, descriptors);
		}
		return o;
	};
	defineProperty(Object, DPies, descriptor);

	descriptor.value = propertyIsEnumerable;
	defineProperty(ObjectProto, PIE, descriptor);

	descriptor.value = Symbol;
	defineProperty(global, 'Symbol', descriptor);

	// defining `Symbol.for(key)`
	descriptor.value = function (key) {
		var uid = prefix.concat(prefix, key, random);
		return uid in ObjectProto ? source[uid] : setAndGetSymbol(uid);
	};
	defineProperty(Symbol, 'for', descriptor);

	// defining `Symbol.keyFor(symbol)`
	descriptor.value = function (symbol) {
		if (onlyNonSymbols(symbol))
		throw new TypeError(symbol + ' is not a symbol');
		return hOP.call(source, symbol) ?
		symbol.slice(prefixLength * 2, -random.length) :
		void 0
		;
	};
	defineProperty(Symbol, 'keyFor', descriptor);

	descriptor.value = function getOwnPropertyDescriptor(o, key) {
		var descriptor = gOPD(o, key);
		if (descriptor && onlySymbols(key)) {
		descriptor.enumerable = propertyIsEnumerable.call(o, key);
		}
		return descriptor;
	};
	defineProperty(Object, GOPD, descriptor);

	descriptor.value = function (proto, descriptors) {
		return arguments.length === 1 || typeof descriptors === "undefined" ?
		create(proto) :
		createWithSymbols(proto, descriptors);
	};
	defineProperty(Object, 'create', descriptor);

	descriptor.value = function () {
		var str = toString.call(this);
		return (str === '[object String]' && onlySymbols(this)) ? '[object Symbol]' : str;
	};
	defineProperty(ObjectProto, 'toString', descriptor);


	setDescriptor = function (o, key, descriptor) {
		var protoDescriptor = gOPD(ObjectProto, key);
		delete ObjectProto[key];
		defineProperty(o, key, descriptor);
		if (o !== ObjectProto) {
			defineProperty(ObjectProto, key, protoDescriptor);
		}
	};

}(Object, 'getOwnPropertySymbols', this));

}

if (!('Symbol' in this && 'iterator' in this.Symbol)) {

// Symbol.iterator
Object.defineProperty(Symbol, 'iterator', {value: Symbol('iterator')});

}

if (!('Symbol' in this && 'species' in this.Symbol)) {

// Symbol.species
Object.defineProperty(Symbol, 'species', {value: Symbol('species')});

}

if (!('isNaN' in Number)) {

// Number.isNaN
Number.isNaN = Number.isNaN || function(value) {
    return typeof value === "number" && isNaN(value);
};

}

if (!('Map' in this && (function() {
	try {
		return (new Map([[1,1], [2,2]])).size === 2;
	} catch (e) {
		return false;
	}
}()))) {

// Map
(function(global) {


	// Deleted map items mess with iterator pointers, so rather than removing them mark them as deleted. Can't use undefined or null since those both valid keys so use a private symbol.
	var undefMarker = Symbol('undef');

	// NaN cannot be found in an array using indexOf, so we encode NaNs using a private symbol.
	var NaNMarker = Symbol('NaN');

	function encodeKey(key) {
		return Number.isNaN(key) ? NaNMarker : key;
	}
	function decodeKey(encodedKey) {
		return (encodedKey === NaNMarker) ? NaN : encodedKey;
	}

	function makeIterator(mapInst, getter) {
		var nextIdx = 0;
		var done = false;
		return {
			next: function() {
				if (nextIdx === mapInst._keys.length) done = true;
				if (!done) {
					while (mapInst._keys[nextIdx] === undefMarker) nextIdx++;
					return {value: getter.call(mapInst, nextIdx++), done: false};
				} else {
					return {value: void 0, done:true};
				}
			}
		};
	}

	function calcSize(mapInst) {
		var size = 0;
		for (var i=0, s=mapInst._keys.length; i<s; i++) {
			if (mapInst._keys[i] !== undefMarker) size++;
		}
		return size;
	}

	var ACCESSOR_SUPPORT = true;

	function hasProtoMethod(instance, method){
		return typeof instance[method] === 'function';
	}

	var Map = function(data) {
		this._keys = [];
		this._values = [];
		// If `data` is iterable (indicated by presence of a forEach method), pre-populate the map
		if (data && hasProtoMethod(data, 'forEach')){
			// Fastpath: If `data` is a Map, shortcircuit all following the checks
			if (data instanceof Map ||
				// If `data` is not an instance of Map, it could be because you have a Map from an iframe or a worker or something.
				// Check if  `data` has all the `Map` methods and if so, assume data is another Map
				hasProtoMethod(data, 'clear') &&
				hasProtoMethod(data, 'delete') &&
				hasProtoMethod(data, 'entries') &&
				hasProtoMethod(data, 'forEach') &&
				hasProtoMethod(data, 'get') &&
				hasProtoMethod(data, 'has') &&
				hasProtoMethod(data, 'keys') &&
				hasProtoMethod(data, 'set') &&
				hasProtoMethod(data, 'values')){
				data.forEach(function (value, key) {
					this.set.apply(this, [key, value]);
				}, this);
			} else {
				data.forEach(function (item) {
					this.set.apply(this, item);
				}, this);
			}
		}

		if (!ACCESSOR_SUPPORT) this.size = calcSize(this);
	};
	Map.prototype = {};

	// Some old engines do not support ES5 getters/setters.  Since Map only requires these for the size property, we can fall back to setting the size property statically each time the size of the map changes.
	try {
		Object.defineProperty(Map.prototype, 'size', {
			get: function() {
				return calcSize(this);
			}
		});
	} catch(e) {
		ACCESSOR_SUPPORT = false;
	}

	Map.prototype['get'] = function(key) {
		var idx = this._keys.indexOf(encodeKey(key));
		return (idx !== -1) ? this._values[idx] : undefined;
	};
	Map.prototype['set'] = function(key, value) {
		var idx = this._keys.indexOf(encodeKey(key));
		if (idx !== -1) {
			this._values[idx] = value;
		} else {
			this._keys.push(encodeKey(key));
			this._values.push(value);
			if (!ACCESSOR_SUPPORT) this.size = calcSize(this);
		}
		return this;
	};
	Map.prototype['has'] = function(key) {
		return (this._keys.indexOf(encodeKey(key)) !== -1);
	};
	Map.prototype['delete'] = function(key) {
		var idx = this._keys.indexOf(encodeKey(key));
		if (idx === -1) return false;
		this._keys[idx] = undefMarker;
		this._values[idx] = undefMarker;
		if (!ACCESSOR_SUPPORT) this.size = calcSize(this);
		return true;
	};
	Map.prototype['clear'] = function() {
		this._keys = this._values = [];
		if (!ACCESSOR_SUPPORT) this.size = 0;
	};
	Map.prototype['values'] = function() {
		return makeIterator(this, function(i) { return this._values[i]; });
	};
	Map.prototype['keys'] = function() {
		return makeIterator(this, function(i) { return decodeKey(this._keys[i]); });
	};
	Map.prototype['entries'] =
	Map.prototype[Symbol.iterator] = function() {
		return makeIterator(this, function(i) { return [decodeKey(this._keys[i]), this._values[i]]; });
	};
	Map.prototype['forEach'] = function(callbackFn, thisArg) {
		thisArg = thisArg || global;
		var iterator = this.entries();
		var result = iterator.next();
		while (result.done === false) {
			callbackFn.call(thisArg, result.value[1], result.value[0], this);
			result = iterator.next();
		}
	};
	Map.prototype['constructor'] =
	Map.prototype[Symbol.species] = Map;

	Map.length = 0;

	// Export the object
	this.Map = Map;

}(this));

}

if (!('assign' in Object)) {

// Object.assign
Object.assign = function assign(target, source) { // eslint-disable-line no-unused-vars
	for (var index = 1, key, src; index < arguments.length; ++index) {
		src = arguments[index];

		for (key in src) {
			if (Object.prototype.hasOwnProperty.call(src, key)) {
				target[key] = src[key];
			}
		}
	}

	return target;
};

}

if (!('setImmediate' in this)) {

// setImmediate
(function (global, undefined) {
    "use strict";

    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var setImmediate;

    function addFromSetImmediateArguments(args) {
        tasksByHandle[nextHandle] = partiallyApplied.apply(undefined, args);
        return nextHandle++;
    }

    // This function accepts the same arguments as setImmediate, but
    // returns a function that requires no arguments.
    function partiallyApplied(handler) {
        var args = [].slice.call(arguments, 1);
        return function() {
            if (typeof handler === "function") {
                handler.apply(undefined, args);
            } else {
                (new Function("" + handler))();
            }
        };
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(partiallyApplied(runIfPresent, handle), 0);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    task();
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function installNextTickImplementation() {
        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            process.nextTick(partiallyApplied(runIfPresent, handle));
            return handle;
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            global.postMessage(messagePrefix + handle, "*");
            return handle;
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            channel.port2.postMessage(handle);
            return handle;
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
            return handle;
        };
    }

    function installSetTimeoutImplementation() {
        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            setTimeout(partiallyApplied(runIfPresent, handle), 0);
            return handle;
        };
    }

    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();

    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();

    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();

    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();

    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;
}(this)); // eslint-disable-line no-undef

}

if (!('Promise' in this)) {

// Promise
!function(n){function t(e){if(r[e])return r[e].exports;var o=r[e]={exports:{},id:e,loaded:!1};return n[e].call(o.exports,o,o.exports,t),o.loaded=!0,o.exports}var r={};return t.m=n,t.c=r,t.p="",t(0)}({0:/*!***********************!*\
  !*** ./src/global.js ***!
  \***********************/
function(n,t,r){(function(n){var t=r(/*! ./yaku */80);try{n.Promise=t,window.Promise=t}catch(err){}}).call(t,function(){return this}())},80:/*!*********************!*\
  !*** ./src/yaku.js ***!
  \*********************/
function(n,t){(function(t){!function(){"use strict";function r(){return en[q][B]||D}function e(n,t){for(var r in t)n[r]=t[r]}function o(n){return n&&"object"==typeof n}function i(n){return"function"==typeof n}function u(n,t){return n instanceof t}function c(n){return u(n,A)}function f(n,t,r){if(!t(n))throw v(r)}function s(){try{return C.apply(F,arguments)}catch(e){return nn.e=e,nn}}function a(n,t){return C=n,F=t,s}function l(n,t){function r(){for(var r=0;r<o;)t(e[r],e[r+1]),e[r++]=S,e[r++]=S;o=0,e.length>n&&(e.length=n)}var e=L(n),o=0;return function(n,t){e[o++]=n,e[o++]=t,2===o&&en.nextTick(r)}}function h(n,t){var r,e,o,c,f=0;if(!n)throw v(Q);var s=n[en[q][z]];if(i(s))e=s.call(n);else{if(!i(n.next)){if(u(n,L)){for(r=n.length;f<r;)t(n[f],f++);return f}throw v(Q)}e=n}for(;!(o=e.next()).done;)if(c=a(t)(o.value,f++),c===nn)throw i(e[G])&&e[G](),c.e;return f}function v(n){return new TypeError(n)}function _(n){return(n?"":V)+(new A).stack}function d(n,t){var r="on"+n.toLowerCase(),e=E[r];I&&I.listeners(n).length?n===Z?I.emit(n,t._v,t):I.emit(n,t):e?e({reason:t._v,promise:t}):en[n](t._v,t)}function p(n){return n&&n._s}function w(n){if(p(n))return new n(tn);var t,r,e;return t=new n(function(n,o){if(t)throw v();r=n,e=o}),f(r,i),f(e,i),t}function m(n,t){return function(r){H&&(n[M]=_(!0)),t===U?T(n,r):k(n,t,r)}}function y(n,t,r,e){return i(r)&&(t._onFulfilled=r),i(e)&&(n[J]&&d(Y,n),t._onRejected=e),H&&(t._p=n),n[n._c++]=t,n._s!==$&&on(n,t),t}function j(n){if(n._umark)return!0;n._umark=!0;for(var t,r=0,e=n._c;r<e;)if(t=n[r++],t._onRejected||j(t))return!0}function x(n,t){function r(n){return e.push(n.replace(/^\s+|\s+$/g,""))}var e=[];return H&&(t[M]&&r(t[M]),function o(n){n&&K in n&&(o(n._next),r(n[K]+""),o(n._p))}(t)),(n&&n.stack?n.stack:n)+("\n"+e.join("\n")).replace(rn,"")}function g(n,t){return n(t)}function k(n,t,r){var e=0,o=n._c;if(n._s===$)for(n._s=t,n._v=r,t===O&&(H&&c(r)&&(r.longStack=x(r,n)),un(n));e<o;)on(n,n[e++]);return n}function T(n,t){if(t===n&&t)return k(n,O,v(W)),n;if(t!==P&&(i(t)||o(t))){var r=a(b)(t);if(r===nn)return k(n,O,r.e),n;i(r)?(H&&p(t)&&(n._next=t),p(t)?R(n,t,r):en.nextTick(function(){R(n,t,r)})):k(n,U,t)}else k(n,U,t);return n}function b(n){return n.then}function R(n,t,r){var e=a(r,t)(function(r){t&&(t=P,T(n,r))},function(r){t&&(t=P,k(n,O,r))});e===nn&&t&&(k(n,O,e.e),t=P)}var S,C,F,P=null,E="object"==typeof window?window:t,H=!1,I=E.process,L=Array,A=Error,O=1,U=2,$=3,q="Symbol",z="iterator",B="species",D=q+"("+B+")",G="return",J="_uh",K="_pt",M="_st",N="Invalid this",Q="Invalid argument",V="\nFrom previous ",W="Chaining cycle detected for promise",X="Uncaught (in promise)",Y="rejectionHandled",Z="unhandledRejection",nn={e:P},tn=function(){},rn=/^.+\/node_modules\/yaku\/.+\n?/gm,en=n.exports=function(n){var t,r=this;if(!o(r)||r._s!==S)throw v(N);if(r._s=$,H&&(r[K]=_()),n!==tn){if(!i(n))throw v(Q);t=a(n)(m(r,U),m(r,O)),t===nn&&k(r,O,t.e)}};en["default"]=en,e(en.prototype,{then:function(n,t){if(void 0===this._s)throw v();return y(this,w(en.speciesConstructor(this,en)),n,t)},"catch":function(n){return this.then(S,n)},"finally":function(n){function t(t){return en.resolve(n()).then(function(){return t})}return this.then(t,t)},_c:0,_p:P}),en.resolve=function(n){return p(n)?n:T(w(this),n)},en.reject=function(n){return k(w(this),O,n)},en.race=function(n){var t=this,r=w(t),e=function(n){k(r,U,n)},o=function(n){k(r,O,n)},i=a(h)(n,function(n){t.resolve(n).then(e,o)});return i===nn?t.reject(i.e):r},en.all=function(n){function t(n){k(o,O,n)}var r,e=this,o=w(e),i=[];return r=a(h)(n,function(n,u){e.resolve(n).then(function(n){i[u]=n,--r||k(o,U,i)},t)}),r===nn?e.reject(r.e):(r||k(o,U,[]),o)},en.Symbol=E[q]||{},a(function(){Object.defineProperty(en,r(),{get:function(){return this}})})(),en.speciesConstructor=function(n,t){var e=n.constructor;return e?e[r()]||t:t},en.unhandledRejection=function(n,t){try{E.console.error(X,H?t.longStack:x(n,t))}catch(e){}},en.rejectionHandled=tn,en.enableLongStackTrace=function(){H=!0},en.nextTick=I?I.nextTick:function(n){setTimeout(n)},en._s=1;var on=l(999,function(n,t){var r,e;return e=n._s!==O?t._onFulfilled:t._onRejected,e===S?void k(t,n._s,n._v):(r=a(g)(e,n._v),r===nn?void k(t,O,r.e):void T(t,r))}),un=l(9,function(n){j(n)||(n[J]=1,d(Z,n))})}()}).call(t,function(){return this}())}});
}

if (!('Set' in this && (function() {
	return (new Set([1,2])).size === 2;
}()))) {

// Set
(function(global) {


	// Deleted map items mess with iterator pointers, so rather than removing them mark them as deleted. Can't use undefined or null since those both valid keys so use a private symbol.
	var undefMarker = Symbol('undef');

	// NaN cannot be found in an array using indexOf, so we encode NaNs using a private symbol.
	var NaNMarker = Symbol('NaN');

	function encodeVal(data) {
		return Number.isNaN(data) ? NaNMarker : data;
	}
	function decodeVal(encodedData) {
		return (encodedData === NaNMarker) ? NaN : encodedData;
	}

	function makeIterator(setInst, getter) {
		var nextIdx = 0;
		return {
			next: function() {
				while (setInst._values[nextIdx] === undefMarker) nextIdx++;
				if (nextIdx === setInst._values.length) {
					return {value: void 0, done: true};
				}
				else {
					return {value: getter.call(setInst, nextIdx++), done: false};
				}
			}
		};
	}

	function calcSize(setInst) {
		var size = 0;
		for (var i=0, s=setInst._values.length; i<s; i++) {
			if (setInst._values[i] !== undefMarker) size++;
		}
		return size;
	}

	var ACCESSOR_SUPPORT = true;

	var Set = function(data) {
		this._values = [];

		// If `data` is iterable (indicated by presence of a forEach method), pre-populate the set
		data && (typeof data.forEach === 'function') && data.forEach(function (item) {
			this.add.call(this, item);
		}, this);

		if (!ACCESSOR_SUPPORT) this.size = calcSize(this);
	};

	// Some old engines do not support ES5 getters/setters.  Since Set only requires these for the size property, we can fall back to setting the size property statically each time the size of the set changes.
	try {
		Object.defineProperty(Set.prototype, 'size', {
			get: function() {
				return calcSize(this);
			}
		});
	} catch(e) {
		ACCESSOR_SUPPORT = false;
	}

	Set.prototype['add'] = function(value) {
		value = encodeVal(value);
		if (this._values.indexOf(value) === -1) {
			this._values.push(value);
			if (!ACCESSOR_SUPPORT) this.size = calcSize(this);
		}
		return this;
	};
	Set.prototype['has'] = function(value) {
		return (this._values.indexOf(encodeVal(value)) !== -1);
	};
	Set.prototype['delete'] = function(value) {
		var idx = this._values.indexOf(encodeVal(value));
		if (idx === -1) return false;
		this._values[idx] = undefMarker;
		if (!ACCESSOR_SUPPORT) this.size = calcSize(this);
		return true;
	};
	Set.prototype['clear'] = function() {
		this._values = [];
		if (!ACCESSOR_SUPPORT) this.size = 0;
	};
	Set.prototype['values'] =
	Set.prototype['keys'] = function() {
		return makeIterator(this, function(i) { return decodeVal(this._values[i]); });
	};
	Set.prototype['entries'] =
	Set.prototype[Symbol.iterator] = function() {
		return makeIterator(this, function(i) { return [decodeVal(this._values[i]), decodeVal(this._values[i])]; });
	};
	Set.prototype['forEach'] = function(callbackFn, thisArg) {
		thisArg = thisArg || global;
		var iterator = this.entries();
		var result = iterator.next();
		while (result.done === false) {
			callbackFn.call(thisArg, result.value[1], result.value[0], this);
			result = iterator.next();
		}
	};
	Set.prototype['constructor'] =
	Set.prototype[Symbol.species] = Set;

	Set.length = 0;

	// Export the object
	this.Set = Set;

}(this));

}

if (!('endsWith' in String.prototype)) {

// String.prototype.endsWith
String.prototype.endsWith = function (string) {
	var index = arguments.length < 2 ? this.length : arguments[1];
	var foundIndex = this.lastIndexOf(string);
	return foundIndex !== -1 && foundIndex === index - string.length;
};

}

if (!('includes' in String.prototype)) {

// String.prototype.includes
String.prototype.includes = function (string, index) {
	if (typeof string === 'object' && string instanceof RegExp) throw new TypeError("First argument to String.prototype.includes must not be a regular expression");
	return this.indexOf(string, index) !== -1;
};

}

if (!('startsWith' in String.prototype)) {

// String.prototype.startsWith
String.prototype.startsWith = function (string) {
	var index = arguments.length < 2 ? 0 : arguments[1];

	return this.slice(index).indexOf(string) === 0;
};

}

if (!((function (global) {
	/*
	 * Browsers may have:
	 * No global URL object
	 * URL with static methods only - may have a dummy constructor
	 * URL with members except searchParams
	 * Full URL API support
	 */
	'use strict';

	try {
		var nativeURL = new global.URL('http://example.com');

		return 'href' in nativeURL && 'searchParams' in nativeURL;
	}
	catch (error) {
		return false;
	}
}(this)))) {

// URL
// URL Polyfill
// Draft specification: https://url.spec.whatwg.org

// Notes:
// - Primarily useful for parsing URLs and modifying query parameters
// - Should work in IE8+ and everything more modern, with es5.js polyfills

(function (global) {
  'use strict';

  function isSequence(o) {
    if (!o) return false;
    if ('Symbol' in global && 'iterator' in global.Symbol &&
        typeof o[Symbol.iterator] === 'function') return true;
    if (Array.isArray(o)) return true;
    return false;
  }

  function toArray(iter) {
    return ('from' in Array) ? Array.from(iter) : Array.prototype.slice.call(iter);
  }

  (function() {

    // Browsers may have:
    // * No global URL object
    // * URL with static methods only - may have a dummy constructor
    // * URL with members except searchParams
    // * Full URL API support
    var origURL = global.URL;
    var nativeURL;
    try {
      if (origURL) {
        nativeURL = new global.URL('http://example.com');
        if ('searchParams' in nativeURL)
          return;
        if (!('href' in nativeURL))
          nativeURL = undefined;
      }
    } catch (_) {}

    // NOTE: Doesn't do the encoding/decoding dance
    function urlencoded_serialize(pairs) {
      var output = '', first = true;
      pairs.forEach(function (pair) {
        var name = encodeURIComponent(pair.name);
        var value = encodeURIComponent(pair.value);
        if (!first) output += '&';
        output += name + '=' + value;
        first = false;
      });
      return output.replace(/%20/g, '+');
    }

    // NOTE: Doesn't do the encoding/decoding dance
    function urlencoded_parse(input, isindex) {
      var sequences = input.split('&');
      if (isindex && sequences[0].indexOf('=') === -1)
        sequences[0] = '=' + sequences[0];
      var pairs = [];
      sequences.forEach(function (bytes) {
        if (bytes.length === 0) return;
        var index = bytes.indexOf('=');
        if (index !== -1) {
          var name = bytes.substring(0, index);
          var value = bytes.substring(index + 1);
        } else {
          name = bytes;
          value = '';
        }
        name = name.replace(/\+/g, ' ');
        value = value.replace(/\+/g, ' ');
        pairs.push({ name: name, value: value });
      });
      var output = [];
      pairs.forEach(function (pair) {
        output.push({
          name: decodeURIComponent(pair.name),
          value: decodeURIComponent(pair.value)
        });
      });
      return output;
    }

    function URLUtils(url) {
      if (nativeURL)
        return new origURL(url);
      var anchor = document.createElement('a');
      anchor.href = url;
      return anchor;
    }

    function URLSearchParams(init) {
      var $this = this;
      this._list = [];

      if (init === undefined || init === null) {
        // no-op
      } else if (init instanceof URLSearchParams) {
        // In ES6 init would be a sequence, but special case for ES5.
        this._list = urlencoded_parse(String(init));
      } else if (typeof init === 'object' && isSequence(init)) {
        toArray(init).forEach(function(e) {
          if (!isSequence(e)) throw TypeError();
          var nv = toArray(e);
          if (nv.length !== 2) throw TypeError();
          $this._list.push({name: String(nv[0]), value: String(nv[1])});
        });
      } else if (typeof init === 'object' && init) {
        Object.keys(init).forEach(function(key) {
          $this._list.push({name: String(key), value: String(init[key])});
        });
      } else {
        init = String(init);
        if (init.substring(0, 1) === '?')
          init = init.substring(1);
        this._list = urlencoded_parse(init);
      }

      this._url_object = null;
      this._setList = function (list) { if (!updating) $this._list = list; };

      var updating = false;
      this._update_steps = function() {
        if (updating) return;
        updating = true;

        if (!$this._url_object) return;

        // Partial workaround for IE issue with 'about:'
        if ($this._url_object.protocol === 'about:' &&
            $this._url_object.pathname.indexOf('?') !== -1) {
          $this._url_object.pathname = $this._url_object.pathname.split('?')[0];
        }

        $this._url_object.search = urlencoded_serialize($this._list);

        updating = false;
      };
    }


    Object.defineProperties(URLSearchParams.prototype, {
      append: {
        value: function (name, value) {
          this._list.push({ name: name, value: value });
          this._update_steps();
        }, writable: true, enumerable: true, configurable: true
      },

      'delete': {
        value: function (name) {
          for (var i = 0; i < this._list.length;) {
            if (this._list[i].name === name)
              this._list.splice(i, 1);
            else
              ++i;
          }
          this._update_steps();
        }, writable: true, enumerable: true, configurable: true
      },

      get: {
        value: function (name) {
          for (var i = 0; i < this._list.length; ++i) {
            if (this._list[i].name === name)
              return this._list[i].value;
          }
          return null;
        }, writable: true, enumerable: true, configurable: true
      },

      getAll: {
        value: function (name) {
          var result = [];
          for (var i = 0; i < this._list.length; ++i) {
            if (this._list[i].name === name)
              result.push(this._list[i].value);
          }
          return result;
        }, writable: true, enumerable: true, configurable: true
      },

      has: {
        value: function (name) {
          for (var i = 0; i < this._list.length; ++i) {
            if (this._list[i].name === name)
              return true;
          }
          return false;
        }, writable: true, enumerable: true, configurable: true
      },

      set: {
        value: function (name, value) {
          var found = false;
          for (var i = 0; i < this._list.length;) {
            if (this._list[i].name === name) {
              if (!found) {
                this._list[i].value = value;
                found = true;
                ++i;
              } else {
                this._list.splice(i, 1);
              }
            } else {
              ++i;
            }
          }

          if (!found)
            this._list.push({ name: name, value: value });

          this._update_steps();
        }, writable: true, enumerable: true, configurable: true
      },

      entries: {
        value: function() { return new Iterator(this._list, 'key+value'); },
        writable: true, enumerable: true, configurable: true
      },

      keys: {
        value: function() { return new Iterator(this._list, 'key'); },
        writable: true, enumerable: true, configurable: true
      },

      values: {
        value: function() { return new Iterator(this._list, 'value'); },
        writable: true, enumerable: true, configurable: true
      },

      forEach: {
        value: function(callback) {
          var thisArg = (arguments.length > 1) ? arguments[1] : undefined;
          this._list.forEach(function(pair, index) {
            callback.call(thisArg, pair.value, pair.name);
          });

        }, writable: true, enumerable: true, configurable: true
      },

      toString: {
        value: function () {
          return urlencoded_serialize(this._list);
        }, writable: true, enumerable: false, configurable: true
      }
    });

    function Iterator(source, kind) {
      var index = 0;
      this['next'] = function() {
        if (index >= source.length)
          return {done: true, value: undefined};
        var pair = source[index++];
        return {done: false, value:
                kind === 'key' ? pair.name :
                kind === 'value' ? pair.value :
                [pair.name, pair.value]};
      };
    }

    if ('Symbol' in global && 'iterator' in global.Symbol) {
      Object.defineProperty(URLSearchParams.prototype, global.Symbol.iterator, {
        value: URLSearchParams.prototype.entries,
        writable: true, enumerable: true, configurable: true});
      Object.defineProperty(Iterator.prototype, global.Symbol.iterator, {
        value: function() { return this; },
        writable: true, enumerable: true, configurable: true});
    }

    function URL(url, base) {
      if (!(this instanceof global.URL))
        throw new TypeError("Failed to construct 'URL': Please use the 'new' operator.");

      if (base) {
        url = (function () {
          if (nativeURL) return new origURL(url, base).href;

          var doc;
          // Use another document/base tag/anchor for relative URL resolution, if possible
          if (document.implementation && document.implementation.createHTMLDocument) {
            doc = document.implementation.createHTMLDocument('');
          } else if (document.implementation && document.implementation.createDocument) {
            doc = document.implementation.createDocument('http://www.w3.org/1999/xhtml', 'html', null);
            doc.documentElement.appendChild(doc.createElement('head'));
            doc.documentElement.appendChild(doc.createElement('body'));
          } else if (window.ActiveXObject) {
            doc = new window.ActiveXObject('htmlfile');
            doc.write('<head><\/head><body><\/body>');
            doc.close();
          }

          if (!doc) throw Error('base not supported');

          var baseTag = doc.createElement('base');
          baseTag.href = base;
          doc.getElementsByTagName('head')[0].appendChild(baseTag);
          var anchor = doc.createElement('a');
          anchor.href = url;
          return anchor.href;
        }());
      }

      // An inner object implementing URLUtils (either a native URL
      // object or an HTMLAnchorElement instance) is used to perform the
      // URL algorithms. With full ES5 getter/setter support, return a
      // regular object For IE8's limited getter/setter support, a
      // different HTMLAnchorElement is returned with properties
      // overridden

      var instance = URLUtils(url || '');

      // Detect for ES5 getter/setter support
      // (an Object.defineProperties polyfill that doesn't support getters/setters may throw)
      var ES5_GET_SET = (function() {
        if (!('defineProperties' in Object)) return false;
        try {
          var obj = {};
          Object.defineProperties(obj, { prop: { 'get': function () { return true; } } });
          return obj.prop;
        } catch (_) {
          return false;
        }
      })();

      var self = ES5_GET_SET ? this : document.createElement('a');



      var query_object = new URLSearchParams(
        instance.search ? instance.search.substring(1) : null);
      query_object._url_object = self;

      Object.defineProperties(self, {
        href: {
          get: function () { return instance.href; },
          set: function (v) { instance.href = v; tidy_instance(); update_steps(); },
          enumerable: true, configurable: true
        },
        origin: {
          get: function () {
            if ('origin' in instance) return instance.origin;
            return this.protocol + '//' + this.host;
          },
          enumerable: true, configurable: true
        },
        protocol: {
          get: function () { return instance.protocol; },
          set: function (v) { instance.protocol = v; },
          enumerable: true, configurable: true
        },
        username: {
          get: function () { return instance.username; },
          set: function (v) { instance.username = v; },
          enumerable: true, configurable: true
        },
        password: {
          get: function () { return instance.password; },
          set: function (v) { instance.password = v; },
          enumerable: true, configurable: true
        },
        host: {
          get: function () {
            // IE returns default port in |host|
            var re = {'http:': /:80$/, 'https:': /:443$/, 'ftp:': /:21$/}[instance.protocol];
            return re ? instance.host.replace(re, '') : instance.host;
          },
          set: function (v) { instance.host = v; },
          enumerable: true, configurable: true
        },
        hostname: {
          get: function () { return instance.hostname; },
          set: function (v) { instance.hostname = v; },
          enumerable: true, configurable: true
        },
        port: {
          get: function () { return instance.port; },
          set: function (v) { instance.port = v; },
          enumerable: true, configurable: true
        },
        pathname: {
          get: function () {
            // IE does not include leading '/' in |pathname|
            if (instance.pathname.charAt(0) !== '/') return '/' + instance.pathname;
            return instance.pathname;
          },
          set: function (v) { instance.pathname = v; },
          enumerable: true, configurable: true
        },
        search: {
          get: function () { return instance.search; },
          set: function (v) {
            if (instance.search === v) return;
            instance.search = v; tidy_instance(); update_steps();
          },
          enumerable: true, configurable: true
        },
        searchParams: {
          get: function () { return query_object; },
          enumerable: true, configurable: true
        },
        hash: {
          get: function () { return instance.hash; },
          set: function (v) { instance.hash = v; tidy_instance(); },
          enumerable: true, configurable: true
        },
        toString: {
          value: function() { return instance.toString(); },
          enumerable: false, configurable: true
        },
        valueOf: {
          value: function() { return instance.valueOf(); },
          enumerable: false, configurable: true
        }
      });

      function tidy_instance() {
        var href = instance.href.replace(/#$|\?$|\?(?=#)/g, '');
        if (instance.href !== href)
          instance.href = href;
      }

      function update_steps() {
        query_object._setList(instance.search ? urlencoded_parse(instance.search.substring(1)) : []);
        query_object._update_steps();
      }

      return self;
    }

    if (origURL) {
      for (var i in origURL) {
        if (origURL.hasOwnProperty(i) && typeof origURL[i] === 'function')
          URL[i] = origURL[i];
      }
    }

    global.URL = URL;
    global.URLSearchParams = URLSearchParams;
  }());

  // Patch native URLSearchParams constructor to handle sequences/records
  // if necessary.
  (function() {
    if (new global.URLSearchParams([['a', 1]]).get('a') === '1' &&
        new global.URLSearchParams({a: 1}).get('a') === '1')
      return;
    var orig = global.URLSearchParams;
    global.URLSearchParams = function(init) {
      if (init && typeof init === 'object' && isSequence(init)) {
        var o = new orig();
        toArray(init).forEach(function(e) {
          if (!isSequence(e)) throw TypeError();
          var nv = toArray(e);
          if (nv.length !== 2) throw TypeError();
          o.append(nv[0], nv[1]);
        });
        return o;
      } else if (init && typeof init === 'object') {
        o = new orig();
        Object.keys(init).forEach(function(key) {
          o.set(key, init[key]);
        });
        return o;
      } else {
        return new orig(init);
      }
    };
  }());

}(self));

}

if (!('location' in this && 'origin' in this.location)) {

// location.origin
try {
	Object.defineProperty(window.location, 'origin', {
		enumerable: true,
		writable: false,
		value: window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : ''),
		configurable: false
	});
} catch(e) {

	// IE9 is throwing "Object doesn't support this action" when attempting defineProperty on window.location, so provide an alternative
	window.location.origin = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
}

}

if (!('performance' in this && 'now' in this.performance)) {

// performance.now
(function (global) {

var
startTime = Date.now();

if (!global.performance) {
    global.performance = {};
}

global.performance.now = function () {
    return Date.now() - startTime;
};

}(this));

}

if (!('requestAnimationFrame' in this)) {

// requestAnimationFrame
(function (global) {
	var rafPrefix;

	if ('mozRequestAnimationFrame' in global) {
		rafPrefix = 'moz';

	} else if ('webkitRequestAnimationFrame' in global) {
		rafPrefix = 'webkit';

	}

	if (rafPrefix) {
		global.requestAnimationFrame = function (callback) {
		    return global[rafPrefix + 'RequestAnimationFrame'](function () {
		        callback(performance.now());
		    });
		};
		global.cancelAnimationFrame = global[rafPrefix + 'CancelAnimationFrame'];
	} else {

		var lastTime = Date.now();

		global.requestAnimationFrame = function (callback) {
			if (typeof callback !== 'function') {
				throw new TypeError(callback + ' is not a function');
			}

			var
			currentTime = Date.now(),
			delay = 16 + lastTime - currentTime;

			if (delay < 0) {
				delay = 0;
			}

			lastTime = currentTime;

			return setTimeout(function () {
				lastTime = Date.now();

				callback(performance.now());
			}, delay);
		};

		global.cancelAnimationFrame = function (id) {
			clearTimeout(id);
		};
	}
}(this));

}


// Object.setPrototypeOf
// ES6-shim 0.16.0 (c) 2013-2014 Paul Miller (http://paulmillr.com)
// ES6-shim may be freely distributed under the MIT license.
// For more details and documentation:
// https://github.com/paulmillr/es6-shim/

(function(globals) {
  'use strict';

	var Object = globals.Object;

	// NOTE:  This versions needs object ownership
	//        because every promoted object needs to be reassigned
	//        otherwise uncompatible browsers cannot work as expected
	//
	// NOTE:  This might need es5-shim or polyfills upfront
	//        because it's based on ES5 API.
	//        (probably just an IE <= 8 problem)
	//
	// NOTE:  nodejs is fine in version 0.8, 0.10 and future versions.
	if (!Object.setPrototypeOf) (function () {
		/*jshint proto: true */
		// @author    Andrea Giammarchi - @WebReflection
		var
			// define into target descriptors from source
			copyDescriptors = function (target, source) {
				getOwnPropertyNames(source).forEach(function (key) {
					defineProperty(
						target,
						key,
						getOwnPropertyDescriptor(source, key)
					);
				});
				return target;
			},
			// used as fallback when no promotion is possible
			createAndCopy = function (origin, proto) {
				return copyDescriptors(create(proto), origin);
			},
			create = Object.create,
			defineProperty = Object.defineProperty,
			getPrototypeOf = Object.getPrototypeOf,
			getOwnPropertyNames = Object.getOwnPropertyNames,
			getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor,
			proto = Object.prototype,
			set, setPrototypeOf
		;
		try {
			// this might fail for various reasons
			// ignore if Chrome cought it at runtime
			set = getOwnPropertyDescriptor(proto, '__proto__').set;
			set.call({}, null);
			// setter not poisoned, it can promote
			// Firefox, Chrome
			setPrototypeOf = function (origin, proto) {
				set.call(origin, proto);
				return origin;
			};
		} catch(e) {
			// do one or more feature detections
			set = {__proto__: null};
			// if proto does not work, needs to fallback
			// some Opera, Rhino, ducktape
			if (set instanceof Object) {
				setPrototypeOf = createAndCopy;
			} else {
				// verify if null objects are buggy
				set.__proto__ = proto;
				// if null objects are buggy
				// nodejs 0.8 to 0.10
				if (set instanceof Object) {
					setPrototypeOf = function (origin, proto) {
						// use such bug to promote
						origin.__proto__ = proto;
						return origin;
					};
				} else {
					// try to use proto or fallback
					// Safari, old Firefox, many others
					setPrototypeOf = function (origin, proto) {
						// if proto is not null
						return getPrototypeOf(origin) ?
							// use __proto__ to promote
							((origin.__proto__ = proto), origin) :
							// otherwise unable to promote: fallback
							createAndCopy(origin, proto);
					};
				}
			}
		}
		Object.setPrototypeOf = setPrototypeOf;
	}());
}(this));
if (!('contains' in String.prototype)) {

// String.prototype.contains
String.prototype.contains = String.prototype.includes;

}

if (!('Symbol' in this && 'toStringTag' in this.Symbol)) {

// Symbol.toStringTag
Object.defineProperty(Symbol, 'toStringTag', {
	value: Symbol('toStringTag')
});

}


// _ArrayIterator
// A modification of https://github.com/medikoo/es6-iterator
// Copyright (C) 2013-2015 Mariusz Nowak (www.medikoo.com)

/* global Symbol */

var ArrayIterator = (function() { // eslint-disable-line no-unused-vars
	var Iterator = (function() {
		var clear = function() {
			this.length = 0;
			return this;
		};
		var callable = function(fn) {
			if (typeof fn !== 'function') throw new TypeError(fn + " is not a function");
			return fn;
		};

		var Iterator = function(list, context) {
			if (!(this instanceof Iterator)) {
				return new Iterator(list, context);
			}
			Object.defineProperties(this, {
				__list__: {
					writable: true,
					value: list
				},
				__context__: {
					writable: true,
					value: context
				},
				__nextIndex__: {
					writable: true,
					value: 0
				}
			});
			if (!context) return;
			callable(context.on);
			context.on('_add', this._onAdd.bind(this));
			context.on('_delete', this._onDelete.bind(this));
			context.on('_clear', this._onClear.bind(this));
		};

		Object.defineProperties(Iterator.prototype, Object.assign({
			constructor: {
				value: Iterator,
				configurable: true,
				enumerable: false,
				writable: true
			},
			_next: {
				value: function() {
					var i;
					if (!this.__list__) return;
					if (this.__redo__) {
						i = this.__redo__.shift();
						if (i !== undefined) return i;
					}
					if (this.__nextIndex__ < this.__list__.length) return this.__nextIndex__++;
					this._unBind();
				},
				configurable: true,
				enumerable: false,
				writable: true
			},
			next: {
				value: function() {
					return this._createResult(this._next());
				},
				configurable: true,
				enumerable: false,
				writable: true
			},
			_createResult: {
				value: function(i) {
					if (i === undefined) return {
						done: true,
						value: undefined
					};
					return {
						done: false,
						value: this._resolve(i)
					};
				},
				configurable: true,
				enumerable: false,
				writable: true
			},
			_resolve: {
				value: function(i) {
					return this.__list__[i];
				},
				configurable: true,
				enumerable: false,
				writable: true
			},
			_unBind: {
				value: function() {
					this.__list__ = null;
					delete this.__redo__;
					if (!this.__context__) return;
					this.__context__.off('_add', this._onAdd.bind(this));
					this.__context__.off('_delete', this._onDelete.bind(this));
					this.__context__.off('_clear', this._onClear.bind(this));
					this.__context__ = null;
				},
				configurable: true,
				enumerable: false,
				writable: true
			},
			toString: {
				value: function() {
					return '[object Iterator]';
				},
				configurable: true,
				enumerable: false,
				writable: true
			}
		}, {
			_onAdd: {
				value: function(index) {
					if (index >= this.__nextIndex__) return;
					++this.__nextIndex__;
					if (!this.__redo__) {
						Object.defineProperty(this, '__redo__', {
							value: [index],
							configurable: true,
							enumerable: false,
							writable: false
						});
						return;
					}
					this.__redo__.forEach(function(redo, i) {
						if (redo >= index) this.__redo__[i] = ++redo;
					}, this);
					this.__redo__.push(index);
				},
				configurable: true,
				enumerable: false,
				writable: true
			},
			_onDelete: {
				value: function(index) {
					var i;
					if (index >= this.__nextIndex__) return;
					--this.__nextIndex__;
					if (!this.__redo__) return;
					i = this.__redo__.indexOf(index);
					if (i !== -1) this.__redo__.splice(i, 1);
					this.__redo__.forEach(function(redo, i) {
						if (redo > index) this.__redo__[i] = --redo;
					}, this);
				},
				configurable: true,
				enumerable: false,
				writable: true
			},
			_onClear: {
				value: function() {
					if (this.__redo__) clear.call(this.__redo__);
					this.__nextIndex__ = 0;
				},
				configurable: true,
				enumerable: false,
				writable: true
			}
		}));

		Object.defineProperty(Iterator.prototype, Symbol.iterator, {
			value: function() {
				return this;
			},
			configurable: true,
			enumerable: false,
			writable: true
		});
		Object.defineProperty(Iterator.prototype, Symbol.toStringTag, {
			value: 'Iterator',
			configurable: false,
			enumerable: false,
			writable: false
		});

		return Iterator;
	}());


	var ArrayIterator = function(arr, kind) {
		if (!(this instanceof ArrayIterator)) return new ArrayIterator(arr, kind);
		Iterator.call(this, arr);
		if (!kind) kind = 'value';
		else if (String.prototype.contains.call(kind, 'key+value')) kind = 'key+value';
		else if (String.prototype.contains.call(kind, 'key')) kind = 'key';
		else kind = 'value';
		Object.defineProperty(this, '__kind__', {
			value: kind,
			configurable: false,
			enumerable: false,
			writable: false
		});
	};
	if (Object.setPrototypeOf) Object.setPrototypeOf(ArrayIterator, Iterator.prototype);

	ArrayIterator.prototype = Object.create(Iterator.prototype, {
		constructor: {
			value: ArrayIterator,
			configurable: true,
			enumerable: false,
			writable: true
		},
		_resolve: {
			value: function(i) {
				if (this.__kind__ === 'value') return this.__list__[i];
				if (this.__kind__ === 'key+value') return [i, this.__list__[i]];
				return i;
			},
			configurable: true,
			enumerable: false,
			writable: true
		},
		toString: {
			value: function() {
				return '[object Array Iterator]';
			},
			configurable: true,
			enumerable: false,
			writable: true
		}
	});

	return ArrayIterator;
}());
if (!('Symbol' in this && 'iterator' in this.Symbol && !!Array.prototype[Symbol.iterator])) {

// Array.prototype.@@iterator
/* global Symbol, ArrayIterator*/
Array.prototype[Symbol.iterator] = function values () {
	return new ArrayIterator(this);
};

}

if (!('Symbol' in this && 'iterator' in this.Symbol && !!Array.prototype.entries)) {

// Array.prototype.entries
Object.defineProperty(Array.prototype, 'entries', {
	value: function () {
		return new ArrayIterator(this, 'key+value');
	}
});

}

if (!('find' in Array.prototype)) {

// Array.prototype.find
Object.defineProperty(Array.prototype, 'find', {
	configurable: true,
	value: function find(callback) {
		if (this === undefined || this === null) {
			throw new TypeError(this + ' is not an object');
		}

		if (!(callback instanceof Function)) {
			throw new TypeError(callback + ' is not a function');
		}

		var
		object = Object(this),
		scope = arguments[1],
		arraylike = object instanceof String ? object.split('') : object,
		length = Math.max(Math.min(arraylike.length, 9007199254740991), 0) || 0,
		index = -1,
		element;

		while (++index < length) {
			if (index in arraylike) {
				element = arraylike[index];

				if (callback.call(scope, element, index, object)) {
					return element;
				}
			}
		}
	},
	writable: true
});

}

if (!('findIndex' in Array.prototype)) {

// Array.prototype.findIndex
Object.defineProperty(Array.prototype, 'findIndex', {
	configurable: true,
	value: function findIndex(callback) {
		if (this === undefined || this === null) {
			throw new TypeError(this + ' is not an object');
		}

		if (!(callback instanceof Function)) {
			throw new TypeError(callback + ' is not a function');
		}

		var
		object = Object(this),
		scope = arguments[1],
		arraylike = object instanceof String ? object.split('') : object,
		length = Math.max(Math.min(arraylike.length, 9007199254740991), 0) || 0,
		index = -1;

		while (++index < length) {
			if (index in arraylike) {
				if (callback.call(scope, arraylike[index], index, object)) {
					return index;
				}
			}
		}

		return -1;
	},
	writable: true
});

}

if (!('Symbol' in this && 'iterator' in this.Symbol && !!Array.prototype.keys)) {

// Array.prototype.keys
/* global ArrayIterator*/
Object.defineProperty(Array.prototype, 'keys', {
	value: function () {
		return new ArrayIterator(this, 'key');
	}
});

}

if (!('Symbol' in this && 'iterator' in this.Symbol && !!Array.prototype[Symbol.iterator] && !!Array.prototype.values && (Array.prototype[Symbol.iterator] === Array.prototype.values))) {

// Array.prototype.values
/* global Symbol */
Object.defineProperty(Array.prototype, 'values', {
	value: Array.prototype[Symbol.iterator],
	enumerable: false,
	writable: false
});

}

if (!('acosh' in Math)) {

// Math.acosh
Math.acosh = function (x) {
  return Math.log(x + Math.sqrt(x * x - 1));
};
}

if (!('asinh' in Math)) {

// Math.asinh
Math.asinh = function asinh(x) {
	return x === -Infinity ? x : Math.log(x + Math.sqrt(x * x + 1));
};

}

if (!('atanh' in Math)) {

// Math.atanh
Math.atanh = function atanh(x) {
	return Math.log((1 + x) / (1 - x)) / 2;
};

}

if (!('cbrt' in Math)) {

// Math.cbrt
Math.cbrt = function cbrt(x) {
	var y = Math.pow(Math.abs(x), 1 / 3);

	return x < 0 ? -y : y;
};

}

if (!('clz32' in Math)) {

// Math.clz32
Math.clz32 = function clz32(x) {
	var value = Number(x) >>> 0;

	return value ? 32 - value.toString(2).length : 32;
};

}

if (!('cosh' in Math)) {

// Math.cosh
Math.cosh = function cosh(x) {
	var y = Math.exp(x);

	return (y + 1 / y) / 2;
};

}

if (!('expm1' in Math)) {

// Math.expm1
Math.expm1 = function expm1(x) {
	return Math.exp(x) - 1;
};

}

if (!('hypot' in Math)) {

// Math.hypot
Math.hypot = function hypot() {
	var args = arguments, index = -1, y = 0;

	while (++index in args && Math.abs(y) !== Infinity) {
		y += args[index] * args[index];
	}

	return Math.abs(y) === Infinity ? Infinity : Math.sqrt(y);
};

}

if (!('imul' in Math)) {

// Math.imul
Math.imul = function imul(a, b) {
	var
	ah = (a >>> 16) & 0xffff,
	al = a & 0xffff,
	bh = (b >>> 16) & 0xffff,
	bl = b & 0xffff;

	return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0);
};

}

if (!('log10' in Math)) {

// Math.log10
Math.log10 = function log10(x) {
	return Math.log(x) / Math.LN10;
};

}

if (!('log1p' in Math)) {

// Math.log1p
Math.log1p = function log1p(x) {
	return Math.log(1 + x);
};

}

if (!('log2' in Math)) {

// Math.log2
Math.log2 = function log2(x) {
	return Math.log(x) / Math.LN2;
};

}

if (!('sign' in Math)) {

// Math.sign
Math.sign = function sign(x) {
	return !(x = Number(x)) ? x : x > 0 ? 1 : -1;
};

}

if (!('sinh' in Math)) {

// Math.sinh
Math.sinh = function sinh(x) {
	var y = Math.exp(x);

	return (y - 1 / y) / 2;
};

}

if (!('tanh' in Math)) {

// Math.tanh
Math.tanh = function tanh(x) {
	var y;

	return x === Infinity ? 1 : x === -Infinity ? -1 : (y = Math.exp(2 * x), (y - 1) / (y + 1));
};

}

if (!('trunc' in Math)) {

// Math.trunc
Math.trunc = function trunc(x) {
	return x < 0 ? Math.ceil(x) : Math.floor(x);
};

}

if (!('MAX_SAFE_INTEGER' in Number)) {

// Number.MAX_SAFE_INTEGER
Number.MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;

}

if (!('MIN_SAFE_INTEGER' in Number)) {

// Number.MIN_SAFE_INTEGER
Number.MIN_SAFE_INTEGER = -(Math.pow(2, 53) - 1);

}

if (!('isFinite' in Number)) {

// Number.isFinite
Number.isFinite = Number.isFinite || function(value) {
    return typeof value === "number" && isFinite(value);
};

}

if (!('isInteger' in Number)) {

// Number.isInteger
Number.isInteger = Number.isInteger || function (value) {
	return typeof value === "number" &&
		isFinite(value) &&
		Math.floor(value) === value;
};

}

if (!('parseFloat' in Number)) {

// Number.parseFloat
Number.parseFloat = Number.parseFloat || parseFloat;

}

if (!('parseInt' in Number)) {

// Number.parseInt
Number.parseInt = Number.parseInt || parseInt;

}

if (!('is' in Object)) {

// Object.is
Object.is = function is(a, b) {
	return (a === b && (a !== 0 || 1 / a === 1 / b)) || (a !== a && b !== b);
};

}

if (!('repeat' in String.prototype)) {

// String.prototype.repeat
String.prototype.repeat = function repeat(count) {
	'use strict';

	if (this === undefined || this === null) {
		throw new TypeError(this + ' is not an object');
	}

	if (count < 0 || count === Infinity) {
		throw new RangeError(count + ' is less than zero or equal to infinity');
	}

	return new Array((parseInt(count, 10) || 0) + 1).join(this);
};

}

if (!('Symbol' in this && 'hasInstance' in this.Symbol)) {

// Symbol.hasInstance
Object.defineProperty(Symbol, 'hasInstance', {value: Symbol('hasInstance')});

}

if (!('Symbol' in this && 'isConcatSpreadable' in this.Symbol)) {

// Symbol.isConcatSpreadable
Object.defineProperty(Symbol, 'isConcatSpreadable', {value: Symbol('isConcatSpreadable')});

}

if (!('Symbol' in this && 'match' in this.Symbol)) {

// Symbol.match
Object.defineProperty(Symbol, 'match', {value: Symbol('match')});

}

if (!('Symbol' in this && 'replace' in this.Symbol)) {

// Symbol.replace
Object.defineProperty(Symbol, 'replace', {value: Symbol('replace')});

}

if (!('Symbol' in this && 'search' in this.Symbol)) {

// Symbol.search
Object.defineProperty(Symbol, 'search', {value: Symbol('search')});

}

if (!('Symbol' in this && 'split' in this.Symbol)) {

// Symbol.split
Object.defineProperty(Symbol, 'split', {value: Symbol('split')});

}

if (!('Symbol' in this && 'toPrimitive' in this.Symbol)) {

// Symbol.toPrimitive
Object.defineProperty(Symbol, 'toPrimitive', {value: Symbol('toPrimitive')});

}

if (!('Symbol' in this && 'unscopables' in this.Symbol)) {

// Symbol.unscopables
Object.defineProperty(Symbol, 'unscopables', {value: Symbol('unscopables')});

}

if (!((function(global) {
	if (!("WeakMap" in global)) return false;
	var o = {};
	var wm = new WeakMap([[o, 'test']]);
	return (wm.get(o) === 'test');
}(this)))) {

// WeakMap
/**
 * @license
 *
 * Portions of this polyfill are a derivative work of the Polymer project, which requires the following licence notice:
 *
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

 (function() {
	var defineProperty = Object.defineProperty;
	var counter = Date.now() % 1e9;

	var WeakMap = function(data) {
		this.name = '__st' + (Math.random() * 1e9 >>> 0) + (counter++ + '__');

		// If data is iterable (indicated by presence of a forEach method), pre-populate the map
		data && data.forEach && data.forEach(function (item) {
			this.set.apply(this, item);
		}, this);
	};

	WeakMap.prototype["set"] = function(key, value) {
		if (typeof key !== 'object' && typeof key !== 'function')
			throw new TypeError('Invalid value used as weak map key');

		var entry = key[this.name];
		if (entry && entry[0] === key)
			entry[1] = value;
		else
			defineProperty(key, this.name, {value: [key, value], writable: true});
		return this;
	};
	WeakMap.prototype["get"] = function(key) {
		var entry;
		return (entry = key[this.name]) && entry[0] === key ?
				entry[1] : undefined;
	};
	WeakMap.prototype["delete"] = function(key) {
		var entry = key[this.name];
		if (!entry || entry[0] !== key) return false;
		entry[0] = entry[1] = undefined;
		return true;
	};
	WeakMap.prototype["has"] = function(key) {
		var entry = key[this.name];
		if (!entry) return false;
		return entry[0] === key;
	};

	this.WeakMap = WeakMap;
}(this));

}

if (!((function(global) {
	if (!("WeakSet" in global)) return false;
	var o = {};
	var ws = new WeakSet([o]);
	return (!!ws.has(o));
}(this)))) {

// WeakSet
/**
 * @license
 *
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

(function(global) {
	var counter = Date.now() % 1e9;

	var WeakSet = function WeakSet(data) {
		this.name = '__st' + (Math.random() * 1e9 >>> 0) + (counter++ + '__');
		data && data.forEach && data.forEach(this.add, this);
	};

	WeakSet.prototype["add"] = function(obj) {
		var name = this.name;
		if (!obj[name]) Object.defineProperty(obj, name, {value: true, writable: true});
		return this;
	};
	WeakSet.prototype["delete"] = function(obj) {
		if (!obj[this.name]) return false;
		obj[this.name] = undefined;
		return true;
	};
	WeakSet.prototype["has"] = function(obj) {
		return !!obj[this.name];
	};

	global.WeakSet = WeakSet;
}(this));

}

if (!('includes' in Array.prototype)) {

// Array.prototype.includes
Array.prototype.includes = function includes(searchElement /*, fromIndex*/ ) {'use strict';
	var O = Object(this);
	var len = parseInt(O.length) || 0;
	if (len === 0) {
		return false;
	}
	var n = parseInt(arguments[1]) || 0;
	var k;
	if (n >= 0) {
		k = n;
	} else {
		k = len + n;
		if (k < 0) {k = 0;}
	}
	var currentElement;
	while (k < len) {
		currentElement = O[k];
		if (searchElement === currentElement ||
		   (searchElement !== searchElement && currentElement !== currentElement)) {
			return true;
		}
		k++;
	}
	return false;
};

}

})
.call('object' === typeof window && window || 'object' === typeof self && self || 'object' === typeof global && global || {});

typeof guardianPolyfilled==='function' && guardianPolyfilled();
