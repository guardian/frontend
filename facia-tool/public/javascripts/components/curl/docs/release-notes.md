Release notes for curl.js
---

* 0.7.4
	* curl.js is now available on CDN: http://cdnjs.com/#curl and
	  http://jsdelivr.com/#!curl.js
	* "main" modules specified in config are fetched after a delay for better
	  compatibility with bundles.
	* cram.js support
	* data-curl-run attribute for loading run.js files.
	* fix to stop IE6-8 complaining about sourceURL when @cc_on.
	* new debug dist version of curl.js.
	* bug fixes for running curl.js inside node.js.
* 0.7.3
	* css! plugin no longer fails when sniffing for Opera (Fixes #147)
	* new curl.config() API method (fixes #146)
	* new "main" {String|Array} config option to init loading of main modules
	  for an application
	* new i18n plugin (fixes #26)
* 0.7.2
	* css! plugin now works everywhere (closed an Opera-XDomain issue).
	* css! plugin now returns the stylesheet created (as it used to, but for
	  all browsers).
	* curl() error handler is called even if no success handler is specified.
* 0.7.1
	* fixed inability to load non-anonymous "main" modules (packages) (also #138)
	* restored ability to use urls in place of module ids as dependencies
	* fixed duplicate downloads/execution of modules if dev specified
	  module in two different ways (e.g. as module and as url) (#137)
	* fixed early callback in IE under load (#136)
	* restored plugin-specific config and paths
* 0.7.0
	* new module.config() method when using CommonJS-wrapped modules
	* dontAddFileExt config option (RegExp or string) decides whether or not
	  to add a .js file extension to module urls.
	* Implement error callbacks in require() and plugin load() methods.
	* Improved css! plugin no longer fails on blank stylesheets and supports
	  all features in all browsers (except for error callbacks in Opera, IE6,
	  Safari 5 (and below) and Firefox 8 (and below)).
	* shell scripts now work in more environments
	* many other fixes
* 0.6.8
	* IE10 compatibility! you must upgrade to 0.6.8+ to support IE10!
	* new discussion group at https://groups.google.com/d/forum/cujojs check it!
	* Fix an IE/jquery-related "Permission denied" error.
* 0.6.7
	* Fix problems using google closure compiler to create "dist" versions.
* 0.6.6
	* Fix for Safari 6's strict treatment of string properties in un-compiled
	  files (paths were broken -- thanks Tiago!)
* 0.6.5
	* better support when running under RingoJS and node.js (still experimental)
	* fixed bugs with apiContext/apiName or defineContext/defineName
	* added package.json
	* configuration can be overridden by successive calls: `curl({})`
* 0.6.4
	* curl now restores any previous curl() or define() if the dev reassigns
	  either using apiContext/apiName or defineContext/defineName
* 0.6.3
	* fix !exports option of js! plugin when file is compressed
	* now resolves arbitrarily deep double-dot module ids (dojo and node compatibility)
	* more non-standard dojo-isms added to shim/dojo16 (dojo 1.6.x and 1.7.x)
	* correctly locates relative dependencies from main modules
	* scoped `define` (e.g. `mylib.define()`)
	* new tdd/runner and tdd/undefine modules
	* new experimental shim/ssjs (to be released by v0.7)
	* minor improvements to interpretation of unwrapped CJS modules
* 0.6.2
	* curl no longer repeatedly downloads modules that don't return any value
	  (bug introduced in 0.6 refactor) fixes issue #63
* 0.6.1
	* better CommonJS modules compatibility and circular dependency checking
	* fixes an issue in which curl.js could attempt to download the same module
	  file twice if the module is required using relative paths from
	  different locations
* 0.6
	* works with underscore fork at [amdjs](https://github.com/amdjs/underscore)
	* tested and works with dojo 1.7.1 (using curl/shim/dojo16 as a preload)
	* allows normal, non-AMD js files to return values to AMD modules (!exports
	  option)
	* unwrapped CommonJS Modules/1.1 compatibility (experimental)
	* non-AMD module loading via moduleLoader config property
	* updated to latest AMD plugin specifications
	* preloads config array to ensure shims (or other modules) are loaded
	  first
	* package-specific configurations
	* avoids circular dependencies when using cjsm modules
	* folder reorganization. shims were moved into their own folder
	* many bugs fixed, including #21, #22, #28, #34, #36, #39, #40
* 0.5.4
	* jQuery 1.7 support!!!
	* curl.js indicates to jQuery that it is a jQuery-aware AMD loader (#31)
	* AMD/CJSM Hybrid format (see Manual Conversion section of this
	  page: http://requirejs.org/docs/commonjs.html)
	* Now supports node's module.exports = x; export model
	* bug fixes:
		* multiple .next() calls now pass variables correctly
	* curl.js now ignores blank or falsy module ids for better compatibility
	  wth yepnope and has! (#32)
* 0.5.3
	* fix to js! plugin (now works without !order option)
* 0.5.2
	* better CDN support!
		* protocol-relative urls fixed
		* plugin-specific paths (for segmenting by file type)
		* robust 404 detection for non-module js resources
	* better AMD plugin compliance
		* new `dynamic: true` to prevent resource caching
		* `normalize()` API for non-module-like resource names
	* faster domReady detection in non-IE browsers
	* link! plugin for ultra-simple css loading (no waiting, no embedding)
	* new apiContext config param to keep curl API off global object
	* `curl()` allows a single dependency to be specified without an array
	* removed broken !noexec option for js! plugin since it no longer worked
	  in the current browsers
* 0.5.1:
	* fixes to domReady! in the compiled dist/ versions and
	* fixes for commonjs compatibility caused by google-closure in dist/
	  versions
	* support for parent module ids (../sibling-of-parent)
* 0.5:
	* dojo 1.6 support has been moved to separate module (curl/dojo16Compat)
	* curl/domReady now returns a callback function (not a promise)
	* new async! plugin to allow a module to defer definition
	* new css! plugin that inlines css into javascript when used with cram
	* cram (AMD builder) support (css! and async! plugins)
	* `require` is no longer an alias for `curl` unless you set the
	  `apiName` config param to "require"
	* configuration parameters for plugins are now defined in a sub-object
	  of the main config object: { css: { cssOption: true } }
