curl (cujoJS resource loader)
=====================

See the [wiki](https://github.com/cujojs/curl/wiki) for information about using
curl.js with jQuery, dojo, or underscore.

What's New?
=======

* 0.8.4
	* data-curl-run now only supports scripts, not modules, and is
	  documented in the bootstrapping section of the wiki.
	  There are now fewer conflicts when defining a
	  main module in the curl config, as a result.
* 0.8.3
	* Export legacy-loaded modules with normal AMD/CommonJS module ids
	  (thanks @mmacaula!)
	* Build curl/debug into curl/dist/debug/curl.js correctly.
* 0.8.2
	* Run compile.sh from anywhere (thanks @webpro!)
	* Restore quotes to cram text plugin output (thanks @gehan!)
	* Correctly bake-in the locale module in the kitchen-sink dist build.
* 0.8.1
	* Adds a build-time (cram) plugin for the new legacy loader.
* 0.8.0
	* Adds new curl/loader/legacy module loader that provides similar
	  functionality to RequireJS's "shim config".
	* Adds dontAddFileExt config option functionality to js! plugin and
	  curl/loader/legacy module loader.
	* Fixes configuration context mixups. Modules will get their package's
	  config unless they are loaded explicitly via a plugin and that
	  plugin has a custom configuration.
	* Paths can now be objects like packages and can have all of the same
	  properties, except `main`, i.e. `location` (or `path`), `config`, `name`.
	* Fixes an issue in node on windows wherein C: was seen as a web protocol.
	* Updates READMEs in the plugin and loader folders.
	* Drops dojo 1.6 compatibility in the "kitchen sink" distribution.
	* Adds new dojo 1.8 distribution.
* 0.7.6
	* Adds compatibility with dojo 1.8 and 1.9, including the ability to provide
	  `has` configuration via `curl.config()`. (Requires use of the
	  curl/shim/dojo18 shim.)
	* Fixes many bugs in the i18n and cjsm11 cram (build) plugins.
	* Stops encoding the output of the cram plugins that emit javascript code.
	* Adds code documentation improvements in the plugins.
	* Applies Seriously overdue README updates.
	* Restores text! plugin functionality to the "kitchen sink" build.
* 0.7.5
	* Can now resolve relative plugin ids in local require (bug fix).

----------------------------------------

What is curl.js?
================

curl.js is a small and very fast AMD-compliant asynchronous loader.
Size: ~4KB (gzipped) using Google's Closure Compiler.

If you'd like to use curl.js for non-AMD modules (ordinary javascript files),
you'll want to  use a version with the legacy loader built in.  You may also
want to build-in the domReady module.

curl.js, like all async loaders, cannot circumvent browsers' security
restrictions when using the `file:` protocol.  Therefore, you must use
curl from a page served from a web server (i.e. using `http:` or `https:`).
Trying to run curl.js from a page loaded from your local file system
will not work correctly.

What the heck is "cujoJS"?  cujoJS is a web app development platform.
More info: [cujojs.com](http://cujojs.com)

What is "cram"? cram (cujoJS resource assembler) is the build tool companion to
curl.js.  You use cram to compile all of your modules into a small number of
javascript files which are loaded much faster into the browsers.

----------------------------------------

Features at a glance:
=====================

* Loads AMD-formatted javascript modules in parallel (fast!)
* Loads CommonJS Modules (v1.1 when wrapped in a `define()`) (fast!)
* Loads CommonJS Modules (unwrapped when using the cjsm11 loader) (fast!)
* Loads non-AMD javascript files in parallel, too (fast!)
* Loads CSS files and text files in parallel (fast! via plugins)
* Waits for dependencies (js, css, text, etc) before executing javascript
* Waits for domReady, if/when desired
* Allows for virtually limitless combinations of files and dependencies
* Tested with Safari 5+, IE6+, and recent Chrome, FF, Opera

Oh, did we mention?  It's fast!  It's even faster than the leading non-AMD
script loaders.

----------------------------------------

How to get support
===============

1. Go to the issues section of the curl repo
   (https://github.com/cujojs/curl/issues) and search for an answer to your
   question or problem.
2. If no answer exists, file a new ticket!  Somebody will typically respond
   within a few hours.

It's that easy.

Got more in-depth questions?  Browse the
[cujoJS discussion group](https://groups.google.com/d/forum/cujojs) or
come chat with us on freenode @ #cujojs.

----------------------------------------

API at a glance
===============

At it's core, curl.js provides an AMD environment:

```javascript
define(['dep1', 'dep2', 'dep3' /* etc */], factory);
define(['dep1', 'dep2', 'dep3' /* etc */], module);
define(module);
define(name, ['dep1', 'dep2', 'dep3' /* etc */], factory);
define(name, ['dep1', 'dep2', 'dep3' /* etc */], module);
define(name, module);
```

These all define a module per the AMD specification.

* ['dep1', 'dep2', 'dep3']: Module names or plugin-prefixed resource files.
Dependencies may be named 'require', 'exports', or 'module' and will behave
as defined in the CommonJS Modules 1.1 proposal.
* factory: Function called to define the module.  Each dependency is
  passed as a parameter to the factory.
* module: Any javascript object, function, constructor, or primitive
* name: String used to name a module. This is not necessary nor is it
  recommended.  "Named modules" are typically only created by build tools
  and AMD bundlers.

----------------------------------------

```javascript
define(function (require, exports, module) {
	var dep1 = require('app/foo');
	exports.foo2 = function () { return foo() + 2; };
});
```

Defines a module using the AMD-wrapped-CommonJS format.  If a factory function
has parameters, but the dependency list is missing, this format is assumed.
The `exports` and `module` parameters are optional, but when specified, must
be in this exact order.

----------------------------------------

```javascript
define(function (require) {
	var dep1 = require('app/foo');
	return function () { return foo() + 2; };
});
```

Another variation on AMD-wrapped-CommonJS that uses `require()` in the
tidy CommonJS manner, but returns the exports as per typical AMD.

----------------------------------------

```javascript
define(['require', 'exports', 'module'], function (require, exports, module) {
	var dep1 = require('app/foo');
	exports.foo2 = function () { return foo() + 2; };
});
```

Another way to gain access to the CommonJS-like variables, `require`,
`exports`, `module`.  When specified in the dependency list, these
"pseudo-modules" are provided as arguments to the factory function.

----------------------------------------

```javascript
var dep1 = require('app/foo');
exports.foo2 = function () { return foo() + 2; };
```

curl.js also supports *unwrapped* CommonJS modules (and node.js modules)
via the cjsm11 module loader. To use this module loader for a package, say
Backbone, you would provide it to a package config, like this:

```javascript
curl.config({
	packages: [
		{
			name: 'backbone',
			location: 'bower_components/backbone'
			main: 'backbone.min.js',
			config: { moduleLoader: 'curl/loader/cjsm11' } /* <-- hey! */
		}
	]
});
```

Read the notes in the src/curl/loader folder and the cjsm11.js file for
more information about loading CommonJS and node.js modules.

-----

curl.js's global API is for bootstrapping an app.  You would typically only use
this API *once* in your application to load the main module of your application.

For a complete description, check out the [wiki](https://github.com/cujojs/curl/wiki).

```javascript
curl(['main', 'other', 'another' /* etc */], callback, errorback);
```

Loads a module named "main" along with two other modules and the executes
callback, handing it the exported values of the modules as parameters.

* ['main', 'other', 'another']: Module names or plugin-prefixed resource files.
* callback: Function to receive modules or resources. This is where you'd
  typically start up your app. Optional.
* errorback: Function to receive an exception parameter when loading fails.
   Optional.

---------

```javascript
curl(['main', 'other', 'another' /* etc */])
	.then(callback, errorback);
```

Promises-based API for executing callbacks.

* ['main', 'other', 'another']: Module names or plugin-prefixed resource files.
* callback: Function to receive modules or resources. Optional.
* errorback: Function to call if an exception occurred while loading. Optional.
* For full CommonJS Promises/A+ compliance, use [when.js](https://github.com/cujojs/when)
    * `when(curl(['dep1'])).then(callback);`

---------

```javascript
curl(config, ['main' /* etc */], callback, errorback);
```
Specify configuration options, load dependencies, and execute callback.

* config: Object containing curl configuration options (paths, etc.)
* ['main']: Module name(s).
* callback: Function to receive modules or resources. Optional.
* errorback: Function to call if an exception occurred while loading. Optional.

---------

```javascript
curl(['main', 'domReady!' /* etc */]).then(
	callback,
	errorback
);
```

```javascript
curl(['main', 'domReady!' /* etc */], function (main) {
	// do some bootstrapping here
});
```

Executes the callback when the dom is ready for manipulation AND
all dependencies have loaded.

---------

```javascript
curl(['domReady!', 'js!nonAMD.js!order', 'js!another.js!order']), function () {
	/* do something cool here */
});
```

Executes the function when the non-AMD javascript files are loaded and
the dom is ready. The another.js file will wait for the nonAMD.js file
before executing.

Note: Please use curl.js's new legacy loader for much more flexible and
sensible loading of non-AMD scripts.  Please read the docs in the
src/curl/loader folder for more information.

Note: if a file supports AMD or CommonJS module formats, you *can not* use the
js! plugin on that file.

---------

```javascript
curl(['js!nonAMD.js'])
	.next(['dep1', 'dep2', 'dep3'], function (dep1, dep2, dep3) {
		// do something before the dom is ready
	})
	.next(['domReady!'])
	.then(
		function () {
			// do something after the dom is ready
		},
		function (ex) {
			// show an error to the user
		}
	);
```

Executes callbacks in stages using `.next(deps, callback)`.

Note: `.next()` does not load resources in parallel.  Therefore, it is a
last resort when other options do not satisfy your use case.  You should
use the `preloads` config option and/or the legacy loader
whenever possible.

---------

```javascript
curl = {
	baseUrl: '/path/to/my/js',
	pluginPath: 'for/some/reason/plugins/r/here',
	paths: {
		curl: 'curl/src/curl',
		cssx: 'cssx/src/cssx',
		my: '../../my-lib/'
	},
	apiName: 'someOtherName'
};
```

If called before the `<script>` that loads curl.js, a global `curl` var will
configure curl.js when it loads.  All of the configuration parameters are
optional. curl.js tries to do something sensible in their absence. :)

Some common configuration options:

* baseUrl: the root folder to find all modules, default is the document's folder
* paths: a mapping of module paths to relative paths (from baseUrl)
* pluginPath: the place to find plugins when they are specified without a path
(e.g. "css!myCssFile" vs. "cssx/css!myCssFile") and there is no paths
mapping that applies.
* apiName: an alternate name to `curl` and `require` for curl.js's global
  variable
* apiContext: an object, rather than `window`, to place curl on when using
  `apiName`

A more complete list can be found on the
[wiki](https://github.com/cujojs/curl/wiki/Configuring-curl.js).

----------------------------------------

Very Simple Example
===================

```html
<script>

	// configure curl
	curl = {
		paths: {
			cssx: 'cssx/src/cssx/',
			stuff: 'my/stuff/'
		}
	};

</script>
<script src="../js/curl.js" type="text/javascript"></script>
<script type="text/javascript">

	curl(
		// fetch all of these resources ("dependencies")
		[
			'stuff/three', // an AMD module
			'cssx/css!stuff/base', // a css file
			'i18n!stuff/nls/strings', // a translation file
			'text!stuff/template.html', // an html template
			'domReady!'
		]
	)
	// when they are loaded
	.then(
		// execute this callback, passing all dependencies as params
		function (three, link, strings, template) {
			var body = document.body;
			if (body) {
				body.appendChild(document.createTextNode('three == ' + three.toString() + ' '));
				body.appendChild(document.createElement('br'));
				body.appendChild(document.createTextNode(strings.hello));
				body.appendChild(document.createElement('div')).innerHTML = template;
			}
		},
		// execute this callback if there was a problem
		function (ex) {
			var msg = 'OH SNAP: ' + ex.message;
			alert(msg);
		}
	);

</script>
```

The file structure for this example would look as follows:

	js/
		curl/
			plugin/
				i18n.js
				text.js
			domReady.js
		cssx/
			src/
				cssx/
					css.js
		my/
			stuff/
				nls/
					strings.js
				base.css
				template.html
				three.js
		curl.js

----------------------------------------

What is an asynchronous loader?
===============================

Web apps, especially large ones, require many modules and resources. Most of
these modules and resources need to be loaded at page load, but some may be
loaded later, either in the background or "just in time". They also need to be
loaded as quickly as possible.

The traditional way to load javascript modules is via a `<SCRIPT>` element in
an HTML page. Similarly, CSS files are loaded via a `<LINK>` element, and
text resources are either loaded in the page or via XHR calls.

The problem with `<SCRIPT>` and `<LINK>` elements is that a browser must execute
them sequentially since it has no idea if one may depend on another. It just
assumes the developer has placed them in the correct order and that there are
dependencies. (The term "synchronous loading" is used to describe this process
since the elements are executed in a single timeline.)

If there are no dependencies between two files, loading them sequentially is
a waste of time. These files could be loaded and executed in parallel (i.e
at the same time).

An asynchronous loader does just that: it loads javascript files (and
other types of files) in parallel whenever possible.

curl.js has lots of company. Other async loaders include LABjs, Steal.js,
yepnope.js, $script.js, the Backdraft loader (bdLoad), and RequireJS.

[(a more complete list)](https://spreadsheets.google.com/ccc?key=0Aqln2akPWiMIdERkY3J2OXdOUVJDTkNSQ2ZsV3hoWVE&hl=en#gid=2)

----------------------------------------

What is AMD?
============

Asynchronous Module Definition is a *de facto* standard for
javascript modules that can be loaded by asynchronous loaders. It defines
a simple API that developers can use to write their javascript modules so
that they may be loaded by any AMD-compliant loader.

[AMD Spec](https://github.com/amdjs/amdjs-api/wiki/AMD)

The AMD proposal follows some parts of the
[CommonJS Modules](http://wiki.commonjs.org/wiki/Modules/1.1) proposal.
Because of the way browsers load and
evaluate scripts, AMD can't follow it completely without causing significant
processing overhead.  Instead, AMD allows us to place a lightweight wrapper
around javascript modules to help work around the shortcomings.

Ultimately, both proposals (AMD and Modules 1.1) are in preparation for an
official [javascript modules](http://wiki.ecmascript.org/doku.php?id=harmony:modules)
specification and eventual implementation in browsers.

If you don't want to wait for official javascript modules, then don't.
The future is now.  AMD works now -- and it's awesome.

AMD's API focuses on one globally-available function: `define()` and some
CommonJS-inspired variables, `require()`, `exports`, and `module`.
`require()` specifies a list of dependent modules or resources that must be
loaded before running a set of code. This code resides in a callback function
that is executed asynchronously, i.e. it runs later, not in the current
"thread".  Specifically, it executes when all of the dependencies are loaded
and ready.

The proposal does not mandate that `require()` be specified globally.  In fact,
at a global level, the concerns of a loader are about application bootstrapping
and not about finding dependencies. To keep the confusion about these two
concepts to a minimum, curl.js uses `curl()` for the public API.  You may rename
this API back to `require()` by supplying the `apiName` config param
(`apiName: "require"`), but this is not recommended.

It's more important that the `define()` method be consistent.  This is the
method that tells the loader what modules have been loaded by a script.
`define()`  also specifies a list of dependencies and a callback function that
defines and/or creates the resource when the dependencies are ready.
Optionally, `define()` also takes a name parameter, but this is mainly for build
tools and optimizers.

Inside the `define()`, the `require()` method acts like other AMD loaders.

AMD's API also helps code reuse by providing compatibility with CommonJS
(server) modules. AMD-compliant loaders support the same `require()` syntax and
argument signatures as server-side javascript (ssjs) modules.

The beauty of AMD loaders is their ability to remove the drudgery of manually
managing dependencies.  Since all dependencies are listed within the
modules, the loader will ensure that everything is loaded into the browser --
and in the right order.

----------------------------------------

Can curl.js work with non-AMD and non-CommonJS javascript files?
===============================================

Yes, but why would you?  Once you start using AMD, you'll never go back! :)

You may use non-AMD javascript files by using the legacy loader
like this:

```javascript
curl.config({
	paths: {
		plainOldJsFile1: {
			location: 'js/plainOldJsFile1.js',
			exports: 'aGlobal'
		},
		anotherPlainOldJsFile: {
			location: 'js/anotherPlainOldJsFile.js',
			exports: 'anotherGlobal',
			requires: ['plainOldJsFile1']
		}
	}
});
curl(['anotherPlainOldJsFile']).then(
	function (anotherGlobal) {
		/* do something with your plain, boring javascript files */
	},
	function () {
		/* do something if any fail to load */
	}
);
```

Please read the docs in the src/curl/loader folder for more information.

----------------------------------------

Can curl.js load non-javascript files via plugins?
=======================

Yes, curl.js follows the CommonJS Loader Plugin specification, so you can use
any compatible plugin. The following plugins are included:

js! -- loads non-AMD javascript files. more info on the [wiki](https://github.com/cujojs/curl/wiki/js)

text! -- loads text files

link! -- loads css files via a link element (simple, fast)

css! -- loads css files (lots of options)

domReady! -- resolves when the dom is ready for manipulation

async! -- resolves when a module signals it's ready

i18n! -- loads text strings and other locale-specific constants

Some plugin docs are on the [wiki](https://github.com/cujojs/curl/wiki/Plugins).

More documentation is available inside the source of these plugins!

----------------------------------------

How are modules loaded?
=======================

curl.js uses `<script>` element injection rather than XHR/eval for AMD modules.
This allows curl.js to load cross-domain scripts as well as local scripts.
CommonJS modules use XHR/eval so must be wrapped for "transport" if not
on the same domain.  Typically, you will bundle your modules before using them
in production, anyways.  Most bundlers will wrap CommonJS modules in AMD.

To find scripts and other resources, curl.js uses module names.  A module name
looks just like a file path, but typically without the file extension.  If a
module requires a plugin in order to load correctly, it will have a prefix
delimited by a "!" and will also often have a file extension when a plugin
may load different types of files.

Some examples of module names:

* dojo/store/JsonRest
* my/lib/string/format
* js!my/lib/js/plain-old-js.js
* css!my/styles/reset.css
* http://some-cdn/uber/module

By default, curl.js will look in the same folder as the current document's
location. For instance, if your web page is located at
`http://my-domain/apps/myApp.html`, curl.js will look for the JsonRest module
at `http://my-domain/apps/dojo/store/JsonRest.js`.

You can tell curl.js to find modules in other locations by specifying a baseUrl
or individual packages for each of your libraries.  For example, if you specify
a baseUrl of `/resources/` and the following paths:

```javascript
packages: [
	{ name: "dojo", location: "third-party/dojo" },
	{ name: "css", location: "third-party/cssmojo/css" },
	{ name: "my", location: "my-cool-app-v1.3" },
	{ name: "my/lib/js", location: "old-js-libs" }
]
```

Then the modules listed above will be sought in the following locations:

* /resources/third-party/dojo/store/JsonRest.js
* /resources/my-cool-app-v1.3/lib/string/format.js
* /resources/old-js-libs/plain-old-js.js
* /resources/my-cool-app-v1.3/styles/reset.css
* http://some-cdn/uber/module.js

Note: you will need to create a path to curl.js's plugins and other modules if
the curl folder isn't directly under the same folder as your web page. curl.js
uses the same mechanism to find its own modules.

----------------------------------------

What are AMD plugins?
=====================

AMD supports the notion of plugins. Plugins are AMD modules that can be used to
load javascript modules -- or other types of resources. curl comes with several
plugins already, including a text plugin (for templates or other text
resources), two different css plugins, a dom-ready plugin, and several others.

Plugins are designated by a prefix on the name of the module or resource to be
loaded. They are delineated by a ! symbol. The following example shows the use
of some plugins:

```javascript
define(
	[
		'text!myTemplate.html',
		'css!myCssFile'
	],
	function (templateString, cssLinkNode) {
		// do something with the template and css here
	}
);
```

Since plugins are just AMD modules, they would typically be referenced using
their fully-pathed names. curl provides a pluginPath configuration option that
allows you to specify the folder where [most of] your plugins reside so you
don't have to specify their full paths.  This also helps with compatibility
with other AMD loaders.

If one or more of your plugins does not reside in the folder specified by the
pluginPath config option, you can use its full path or you can specify a path
for it in curl's `paths` config object.

```javascript
// example of a fully-pathed plugin under the lib/cssx folder
define(['lib/cssx!myCssFile'], function (cssxDef) {
	// do some awesome css stuff here
});
```

Plugins can also have configuration options. Global options can be specified
on curl's configuration object. Options can also be supplied to plugins via
suffixes. Suffixes are also delineated by the ! symbol. Here's an example of
a plugin using options:

```javascript
// don't try to repair IE6-8 opacity issues in my css file
define(['css!myCssFile!ignore:opacity'], function (cssxDef) {
	// do some awesome css stuff here
});
```

----------------------------------------

How do I use curl.js?
=====================

1. Learn about AMD-formatted javascript modules if you don't already know how.
2. Clone or download curl to your local machine or server.
3. Figure out the baseUrl and paths configuration that makes sense for your
   project.
4. Check out the "API at a glance" section above to figure out which loading
   methodology you want to use.
5. Study the "Very Simple Example" and some of the test files.
6. Try it on your own files.

----------------------------------------

Too Many Modules!
=================

I have dozens (or hundreds) of modules. Even with parallel loading, the
performance sucks! What can I do about that?

True! No parallel loader can lessen the latency required to create an HTTP
connection. If you have dozens or hundreds of files to download, it's going to
take time to initiate each of the connections.

However, there are tools to that are designed to fix this problem! There are
builders and compilers. dojo users are probably already familiar with dojo's
build tool and optimizer. RequireJS comes with a build tool and Google's
Closure compiler.

The build tool is used to concatenate several modules (and/or resources)
into just a few files. It does this by following the dependency chain
specified in the define() and require() calls. You can specify which top-level
modules or resources are in each file and the build tool finds the rest.

After the build tool creates the concatenated files, the files can be passed
into a compiler (also called a shrinker or compressor).

curl.js is compatible with RequireJS's build tool, r.js, but there's
also [cram](https://github.com/cujojs/cram).
Cram is the cujoJS resource assembler.

----------------------------------------

Package Support
========================

cujoJS supports packages.  Packages are defined by the `packages`
configuration parameter:

```javascript
curl = {
	baseUrl: 'path/to/js',
	packages: {
		'my-package': {
			location: 'path/to/my-package',
			main: 'main/main-module-file',
			config: { /* package-specific configuration options */ }
		}
	}
};
```

```javascript
curl = {
	baseUrl: 'path/to/js',
	packages: [
		{
			name: 'my-package',
			location: 'path/to/my-package',
			main: 'main/main-module-file',
			config: { /* package-specific configuration options */ }
		}
	]
};
```

The path property describes where to find the package in relation to the
baseUrl parameter.  The main and lib properties describe where to find modules
inside the package.  The main property gives the relative path to the package's
main module.

In the example above, the main module of the package can be obtained as follows:

```javascript
curl(['my-package'], callback);
```

and will be fetched from the following path:

	path/to/js/path/to/my-package/main/main-module-file.js

Some other file in the package would be obtained as follows:

```javascript
curl(['my-package/other-module'], callback);
```

and will be fetched from the following path:

	path/to/js/path/to/my-package/other-module.js

----------------------------------------

What is cujoJS?
=====================

cujoJS is the JavaScript Architectural Toolkit.  It employs MVC, IOC, AMD
and lots of other TLAs. :)  Our goal is to provide architectural tools and
guidance.  Find out more at [cujoJS.com](http://cujojs.com).

Kudos
=================

Many thanks to Bryan Forbes ([@bryanforbes](http://www.twitter.com/bryanforbes))
for helping to clean up my code and for making curl's domReady much more robust
and help with dojo compatibility.
More about Bryan: <http://www.reigndropsfall.net/>

Kudos also to James Burke ([@jrburke](http://www.twitter.com/jrburke)) who
instigated the AMD standard and paved the way to create AMD-style loaders.
More about James: <http://tagneto.blogspot.com/>

Shout out to Kris Zyp ([@kriszyp](http://www.twitter.com/kriszyp)) for
excellent ideas and feedback and to Kyle Simpson
([@getify](http://www.twitter.com/getify)) who is inarguably the godfather of
javascript loading.
