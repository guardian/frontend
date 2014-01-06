Distribution Files
==================

These are "compiled" versions of curl.js for your convenience.

Please note: these versions have been processed with Google Closure Compiler
in Advanced Mode.  Advanced Mode obfuscates any identifiers that haven't
been specifically declared as "exported".
Therefore, any modules/files that aren't compiled at the same time
may not work together after being compiled.

curl.js only exports identifiers needed for AMD compatibility or needed
to process configuration settings. What this means to you:

If you plan to use any of curl's plugins or other auxiliary modules,
you may have to compile them into curl.js (see below) -- or
compile curl.js into your application's optimized files. If you see "method
not defined" or similar errors within curl.js, this is likely the problem.

Use curl/curl.js if you are only loading AMD-formatted javascript modules.

Use curl-with-js-and-domReady/curl.js if you wish to use non-AMD javascript
files and don't have an alternative domReady implementation handy.

Use curl-for-jQuery for a version of curl that has instructions for
jQuery 1.7+ to register as an AMD module and has the js! and link! plugins
built in.  This is an adequate configuration for many simple jQuery projects.

curl-for-dojo1.8 has the domReady! plugin built in as well as a
compatibility shim for dojo 1.8 and dojo 1.9.

You can build your own custom version of curl.js by using the `make.sh` script
in the /bin/ folder.  You must run it from the /bin/ folder.  Syntax:

```
./make.sh destination/curl.js ../src/curl.js [files to concat into curl.js]
```

The following files can be concatenated into curl.js using make.sh:

* ../src/curl/plugin/js.js (the js! plugin)
* ../src/curl/plugin/text.js (the text! plugin)
* ../src/curl/plugin/i18n.js (the i18n! plugin)
* ../src/curl/plugin/css.js (the css! plugin)
* ../src/curl/plugin/link.js (the link! plugin)
* ../src/curl/plugin/domReady.js (the domReady plugin)
* ../src/curl/domReady.js (the domReady module)
* ../src/curl/shim/dojo16.js (the dojo 1.6 compatibility shim / module)
* ../src/curl/shim/dojo18.js (the dojo 1.6 compatibility shim / module)
* ../src/curl/loader/cjsm11.js (a CommonJS Modules/1.1 and node.js loader)
* ../src/curl/loader/ssjs.js (a shim that allows curl.js to run in node.js)
* ../src/curl/loader/legacy.js (a better alternative to the js! plugin)
* Any named AMD module (does not support anonymous modules, yet!)
* Any non-AMD javascript file

For example, to make a version of curl with the js! and css! plugins built-in:

```
./make.sh destination/curl.js ../src/curl.js ../src/curl/plugin/js.js ../src/curl/plugin/css.js
```

Note: The make.sh bash script is not smart.  You must tell it to concat
dependencies -- and in the right order.  For instance, to use the text!
and json! plugins, you must also include the _fetchText.js module (in the
same folder).

Note: you will need a fairly recent version of `curl` (the unix utility, not
curl.js!) to run `make.sh`.  Version 7.18 or later is fine.
