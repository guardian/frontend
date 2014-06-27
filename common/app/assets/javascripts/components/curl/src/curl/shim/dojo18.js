/** @license MIT (c) copyright 2010-2013 B Cavalier & J Hann */

/**
 * @module curl/shim/dojo18
 *
 * @description
 *
 * curl dojo 1.8 and 1.9 shim
 *
 * This shim overcomes some issues with dojo 1.8 and 1.9 when used with
 * curl.js as a "foreign loader".
 *
 * Specifics:
 *
 *  1. Adds a global `require` function.
 *  2. Adds a `has` implementation to global and local `require` functions.
 *  3. Adds a `idle` function to global and local `require` functions.
 *  4. Adds a noop `on` function to global and local `require` functions.
 *  5. Copies any curl config.has properties into the `has` implementation
 *     similar to what the dojo loader does.
 *  6. Adds a "null" dojo/_base/loader module to prevent production builds
 *     from trying to load that module.  (This seems compatible with the
 *     same logic dojo uses internally.)
 *  7. Ensures that dojo knows that a foreign loader is being used by
 *     setting the 'dojo-loader' `has` test to true;
 *
 * Many thanks to Bryan Forbes @bryanforbes!
 *
 * @example
 *
 * curl.config({
 *     // <packages, etc. go here>
 *
 *     // load this shim as a preload
 *     preloads: ['curl/shim/dojo18'],
 *
 *     // set any initial has-profile properties
 *     has: { 'mvc-bindings-log-api': 1 }
 * });
 */
var require;
(function (global, doc){
define(/*=='curl/shim/dojo18',==*/ ['curl/_privileged'], function (priv) {
"use strict";

	var _curl, moduleCache, Promise, origCreateContext;

	_curl = priv['_curl'];
	moduleCache = priv['cache'];
	Promise = priv['Promise'];
	origCreateContext = priv['core'].createContext;

	var hasCache, hasElement, has;

	// grab has profile from user config.
	hasCache = priv.config().has || {};
	// element for has() tests
	hasElement = doc && doc.createElement('div');

	// create has implementation
	has = _has;
	has.add = _add;

	// just in case:
	hasCache['dojo-loader'] = false;

	// production builds of dojo assume the sync loader exists.
	// this will prevent anything from trying to use it:
	moduleCache['dojo/_base/loader'] = 0;

	// ugh! dojo 1.9 still expects a global `require` in at least one
	// place: dojo/_base/browser. so make sure it's got one.
	if (typeof require == 'undefined') {
		duckPunchRequire(_curl);
		require = _curl;
	}

	// override createContext to override "local require"
	priv['core'].createContext = function () {
		var def = origCreateContext.apply(this, arguments);
		duckPunchRequire(def.require);
		return def;
	};

	return true;

	function _has (name) {
		// dojo-ish has implementation
		return typeof hasCache[name] == 'function'
			? (hasCache[name] = hasCache[name](global, doc, hasElement))
			: hasCache[name];
	}

	function _add (name, test, now, force) {
		if (hasCache[name] === undefined || force) {
			hasCache[name] = test;
		}
		if (now) {
			return has(name);
		}
	}

	function duckPunchRequire (req) {
		// create a functioning has() for built dojos (1.8 and 1.9)
		if (!req['has']) {
			req['has'] = has;
		}
		// create a stub for on() for dojo 1.8.x
		if (!req['on']) {
			req['on'] = noop;
		}
		// create an idle() for dojo 1.8.x
		if (!req['idle']) {
			req['idle'] = idle;
		}
		// tell dojo to always load async
		req.async = true;
		return req;
	}

	function idle () {
		// looks for unresolved defs in the cache
		for (var id in moduleCache) {
			if (moduleCache[id] instanceof Promise) return false;
		}
		return true;
	}

	function noop () {}

});
}(
	typeof global == 'object' ? global : this.window || this.global,
	typeof document == 'object' && document
));
