define([], function(){

	// qwery & $dom will be null if the browser is html5
	// but then, you shouldn't need them in that case, should you?
	function setupUtils(qwery, $dom) {


		// ##### private, low-level util functions #####

		// convert string into element if necessary
		function makeDomElement(elm) {
			if (typeof(elm) === 'string') {
				return $g.qsa(elm);
			} else if (typeof(elm) === 'object') {
				return elm;
			}
		}

		// used to allow calling from loops
		function bindEvent(obj, eventName, listener) {
			if(obj.addEventListener) {
				obj.addEventListener(eventName, listener, false);
			} else {
				obj.attachEvent("on" + eventName, listener);
			}
		}

		// ##### public functions #####

		var $g = {};

		// can be used for both querySelector and querySelectorAll
		$g.genericQuerySelector = function (selector, selectAll) {
				
			if (!selector) {
				return false;
			}

			if (guardian.config.isModernBrowser) {
				if (selectAll) {
					return document.querySelectorAll(selector);
				} else {
					return document.querySelector(selector);
				}
			} else {
				return qwery(selector);
			}
		};

		$g.qs = function (s) {
			return $g.genericQuerySelector(s, false);
		};

		$g.qsa = function (s) {
			return $g.genericQuerySelector(s, true);
		};

		$g.addEventListener = function (obj, eventName, listener) {
			
			obj = makeDomElement(obj);

			if(obj.length) { // it's an array of elements
				for(var i = 0, l = obj.length; i<l; i++) {
				    bindEvent(obj[i], eventName, listener);
				}
			} else {
				bindEvent(obj, eventName, listener);
			}
		};

		$g.onReady = function (callback)  {
			if (document.addEventListener) {
				// check we're not already loaded
				if (/loaded|complete|interactive/.test(document.readyState)) {
					callback.call(this);
				} else {
					$g.addEventListener(document, 'DOMContentLoaded', callback);
				}
			} else {
				$dom.onready(callback);
			}

		};

		$g.getElementsByClassName = function (className) {
			if (guardian.config.isModernBrowser) {
				return document.getElementsByClassName(className);
			} else {
				return qwery(className);
			}
		};

		$g.next = function (elm) {

			elm = makeDomElement(elm);

			if (guardian.config.isModernBrowser) {
				return elm.nextElementSibling;
			} else {
				return $dom.next(elm);
			}
		};

		$g.prev = function (elm) {

			elm = makeDomElement(elm);

			if (guardian.config.isModernBrowser) {
				return elm.previousElementSibling;
			} else {
				return $dom.previous(elm);
			}
		};

		return $g;

	}

	return {
		init: setupUtils
	};

});

/*

	// worth knowing (x-browser, too!)

	element.firstChild
	element.lastChild
	element.nextSibling
	element.previousSibling
	element.parentNode
	appendChild
	cloneNode
	insertBefore
	removeChild
	replaceChild

*/