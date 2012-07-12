// todo: make methods chainable by returning the object

define([], function(){

	// qwery & $dom will be null if the browser is html5
	// but then, you shouldn't need them in that case, should you?
	function setupUtils(qwery, $dom) {


		// ##### private, low-level util functions #####

		// convert string into element if necessary
		function makeDomElement (elm) {
			if (typeof(elm) === 'string') {
				return $g.qsa(elm);
			} else if (typeof(elm) === 'object') {
				return elm;
			}
		}

		// used to allow calling from loops
		function bindEvent (obj, eventName, listener) {
			if (obj.addEventListener) {
				obj.addEventListener(eventName, listener, false);
			} else {
				obj.attachEvent("on" + eventName, listener);
			}
		}

		// wrapper for document.querySelector/All, or qwery for ancient browsers
		function genericQuerySelector (selector, selectAll, context) {
				
			if (!selector) {
				return false;
			}

			if (!context) {
				context = document;
			}

			if (guardian.config.isModernBrowser) {
				if (selectAll) {
					return context.querySelectorAll(selector);
				} else {
					return context.querySelector(selector);
				}
			} else {
				return qwery(selector, context);
			}
		}

        function findParent(item, f) {
            if (item.tagName.toLowerCase() == 'body') {
                return null;
            }
            if (f(item) == true) {
                return item;
            } else {
                return findParent(item.parentNode, f);
            }
        }



		// ##### public functions #####

		var $g = {};


		// c = context. optional. assumes document if no c
		$g.qs = function (s, c) {
			return genericQuerySelector(s, false, c);
		};

		$g.qsa = function (s, c) {
			return genericQuerySelector(s, true, c);
		};

        $g.findParent = function(item, f) {
            return findParent(item, f);
        };

		$g.addEventListener = function (obj, eventName, listener) {
			
			obj = makeDomElement(obj);

			if (obj.length) { // it's an array of elements
				for (var i = 0, l = obj.length; i<l; i++) {
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

	    $g.addClass = function(elm, classname) {
	    	elm = makeDomElement(elm);
	        var re = new RegExp(classname, 'g');
	        if(!elm.className.match(re)){
	            elm.className += ' ' + classname;
	        }
	    };

	    $g.removeClass = function(elm, classname) {
	    	elm = makeDomElement(elm);
	        var re = new RegExp(classname, 'g');
	        elm.className = elm.className.replace(re, '');
	    };

	    // convenience method to swap one class for another */
	    $g.swapClass = function(elm, classToRemove, classToAdd) {
	    	elm = makeDomElement(elm);
	        $g.removeClass(elm, classToRemove);
	        $g.addClass(elm, classToAdd);
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

		$g.remove = function (elm) {
			elm = makeDomElement(elm);
    		elm.parentNode.removeChild(elm);
		};

		$g.hide = function (elm) {
			elm = makeDomElement(elm);
			elm.style.display = "none"; 
		};

		$g.getUrlVars = function () {
            var vars = [], hash;
            var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
            var hash_length = hashes.length;
            for (var i = 0; i < hash_length; i++)
            {
                hash = hashes[i].split('=');
                vars.push(hash[0]);
                vars[hash[0]] = hash[1];
            }
            return vars;
        }

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