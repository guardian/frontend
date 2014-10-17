//     Jasq v0.4.1 - AMD dependency injector integrated with Jasmine
//
//     https://github.com/biril/jasq
//     Licensed and freely distributed under the MIT License
//     Copyright (c) 2013-2014 Alex Lambiris

/*jshint browser:true */
/*global define:false, require:false */

define(function () {

  "use strict";

  var
    // Helpers
    noOp = function () {},
    isString = function (s) {
      return Object.prototype.toString.call(s) === "[object String]";
    },
    isFunction = function (f) {
      return Object.prototype.toString.call(f) === "[object Function]";
    },
    isStrictlyObject = function (o) {
      return Object.prototype.toString.call(o) === "[object Object]";
    },
    each = function (obj, iterator) {
      var i, l, key;
      if (!obj) { return; }
      if (Array.prototype.forEach && obj.forEach === Array.prototype.forEach) {
        obj.forEach(iterator);
        return;
      }
      if (obj.length === +obj.length) {
        for (i = 0, l = obj.length; i < l; i++) { iterator(obj[i], i, obj); }
        return;
      }
      for (key in obj) {
        if (obj.hasOwnProperty(key)) { iterator(obj[key], key, obj); }
      }
    },
    extend = function () {
      var target = {};
      each(arguments, function (source) {
        each(source, function (v, k) { target[k] = v; });
      });
      return target;
    },

    //
    jasmineApiNames = ["describe", "xdescribe", "it", "xit"],

    // Jasmine's native (non-jasq-patched) global API
    jasmineNativeApi = {},

    //
    jasmineEnv = null,

    //
    jasq = {},

    // Get a value indicating whether Jasmine is available on the global scope
    isJasmineInGlobalScope = function () {
      return window.jasmine && isFunction(window.jasmine.getEnv);
    },

    // Generate a context-id for given `suiteDescription` / `specDescription` pair
    createContextId = (function () {
      var uid = 0;
      return function (suiteDescription, specDescription) {
        return suiteDescription + " " + specDescription + " " + (uid++);
      };
    }()),

    // Re-configure require for context of given id, getting a loader-function. All requirejs
    // [configuration options](http://requirejs.org/docs/api.html#config), except for the
    // context itself, are copied over from the default context `_`
    configRequireForContext = function (contextId) {
      var c = {};
      each(require.s.contexts._.config, function (val, key) {
        if (key !== "deps") { c[key] = val; }
      });
      c.context = contextId;
      return require.config(c);
    },


    // ### suiteConfigs
    // A stack of suite configs, the topmost being the 'current'. For each jasq-`describe` call
    //  (i.e. those that define a module and only those) a config is pushed to the stack which
    //  includes the (name of the) module under test and optionally a mocking function. The module
    //  will be made available to all specs defined within _that_ (or any _nested_) suite. The
    //  mocking function, if present in the configuration, will be invoked on every spec to
    //  instantiate mocks. (Mocks defined on the spec itself (in the specConfig provided during the
    //  invocation of `it`) will override those defined in the suiteConfig)

    //
    suiteConfigs = (function () {
      var sc = [];
      // Get the current suite-config. Or a falsy value if no such thing
      sc.getCurrent = function () {
        return sc[sc.length - 1];
      };
      // Get the path of the current suite-config. Or an empty array if no such thing
      //  A suite's path is defined as an array of suite descriptions where
      //   * `path[0]`: descr. of the top-level suite == (n-1)th parent of current suite
      //   * `path[1]`: descr. of (n-2)th parent of current suite
      //   * `path[path.length - 1]`: descr. of current suite
      sc.getCurrentPath = function () {
        var p = [];
        each(sc, function () {
          p.push(sc.description);
        });
        return p;
      };
      return sc;
    }()),


    // ### createJasqSpec
    // Create a function to execute the spec of given `specDescription` and `specConfig` after
    //  (re)loading the tested module and mocking its dependencies as specified at the (current)
    //  suite and (given) spec level

    //
    createJasqSpec = function (specDescription, specConfig) {

      var contextId, load, suiteConfig, mock;

      // Mods will load in a new requirejs context, specific to this spec. This is its id
      contextId = createContextId(suiteConfigs.getCurrentPath(), specDescription);

      // Create the context, configuring require appropriately and obtaining a loader
      load = configRequireForContext(contextId);

      // Configuration of current suite (name of module to load & mock function)
      suiteConfig = suiteConfigs.getCurrent();

      // Modules to mock, as specified at the suite level as well as the spec level
      mock = extend(suiteConfig.mock ? suiteConfig.mock() : {}, specConfig.mock);

      return function (done) {
        // Re-define modules using given mocks (if any), before they're loaded
        each(mock, function (mod, modName) { define(modName, mod); });

        // And require the tested module
        load(suiteConfig.moduleName ? [suiteConfig.moduleName] : [], function (module) {

          // After module & deps are loaded, just run the original spec's expectations.
          //  Dependencies (mocked and non-mocked) should be available through the
          //  `dependencies` hash. (Note that a (shallow) copy of dependencies is passed, to
          //  avoid exposing the original hash that require maintains)
          specConfig.expect(module, extend(require.s.contexts[contextId].defined), done);

          // In the event that the expectation-function is _not_ meant to complete
          //  asynchronously (<=> the expectation-function did _not_ 'request' a `done`
          //  argument) then it's already completed. Invoke `done`
          if (specConfig.expect.length < 3) {
            done();
          }
        });
      };
    },


    // ### describe
    // Get the jasq version of Jasmine's `(x)describe`

    //
    getJasqDescribe = function (isX) {

      var jasmineDescribe = jasmineNativeApi[isX ? "xdescribe" : "describe"];

      // `(x)describe`, Jasq version
      //  * `suiteDescription`: Description of this suite, as in Jasmine's native `describe`
      //  * `moduleName`: Name of the module to which this test suite refers
      //  * `specify`: The function to execute the suite's specs, as in Jasmine's `describe`
      //
      // OR
      //  * `suiteDescription`: Description of this suite, as in Jasmine's native `describe`
      //  * `suiteConfig`: Configuration of the suite. A hash containing
      //      * `moduleName`: Name of the module to which this test suite refers
      //      * `mock`: Optionally a function that returns a hash of mocks
      //      * `specify`: The function to execute the suite's specs

      //
      return function (suiteDescription) {

        var args, suite;

        // Parse given arguments as if they were suitable for the jasq-version of `describe`.
        //  `args` will contain the expected `moduleName`, `mock` and `specify` properties if they
        //  are, or will be falsy if they're not. In the latter case, just delegate to the native
        //  jasmine version
        args = (function (args) {
          // Either `suiteDescription`, `moduleName`, `specify` ..
          if (isString(args[0]) && isString(args[1]) && isFunction(args[2])) {
            return { moduleName: args[1], specify: args[2] };
          }
          // .. or `suiteDescription`, `suiteConfig`
          if (isString(args[0]) && isStrictlyObject(args[1])) {
            return args[1];
          }
        }(arguments));

        if (!args) { return jasmineDescribe.apply(null, arguments); }

        // Push the current suite-config onto the stack of suite-configs, making it the current
        //  suite-config. All specs (and nested suites) will make use of this configuration. (if
        //  this is an `xdescribe` call, it makes no difference as the suite's specs will never
        //  execute anyway. However, it's simpler to always `push` here and always `pop` later,
        //  avoiding an extra layer of logic)
        suiteConfigs.push({
          description: suiteDescription,
          moduleName: args.moduleName,
          mock: args.mock
        });

        // Ultimately, the native Jasmine version is run. The crucial step was setting a
        //  suite-config for further use in specs and nested suites
        suite = jasmineDescribe(suiteDescription, args.specify);

        // Pop the current suite-config
        suiteConfigs.pop();

        return suite;
      };
    },


    // ### it
    // Get the jasq version of Jasmine's `(x)it`

    //
    getJasqIt = function (isX) {

      var jasmineIt = jasmineNativeApi[isX ? "xit" : "it"];

      // `(x)it`, Jasq version
      //  * `specDescription`: Description of this spec, as in Jasmine's native `it`
      //  * `specConfig`: Configuration of the spec. A hash containing:
      //      * `store`: An array of neames of the modules to 'store': These will be
      //          exposed in the spec through `dependencies.store` - a hash of modules
      //      * `mock`: A hash of mocks, mapping module (name) to mock. These will be
      //          exposed in the spec through `dependencies.mocks` - a hash of modules
      //      * `expect`: The expectation function: A callback to be invoked with
      //          `module` and `dependencies` arguments

      //
      return function (specDescription, specConfig) {

        // In the event that there's no current suite-config (no module to pass to the spec) then
        //  just run the native Jasmine version - this will avoid forcing spec to run
        //  asynchronously. Also run the native version in the case the the caller invoked `xit` -
        //  the spec will not execute so there's no reason to incur the module (re)loading overhead
        if (!suiteConfigs.getCurrent() || isX) {

          // We tolerate the caller passing an expectation-hash into a spec which is not nested
          //  within a jasq-suite - in this case we're only interested in the expectation-function
          if (isStrictlyObject(specConfig)) {
            specConfig = specConfig.expect;
          }

          return jasmineIt.call(null, specDescription, specConfig);
        }

        // Create a specConfig, in case the caller passed an expectation-function instead
        if (!isStrictlyObject(specConfig)) {
            specConfig = { expect: specConfig };
        }

        // Execute Jasmine's `(x)it` on an appropriately modified _asynchronous_ spec
        return jasmineIt(specDescription, createJasqSpec(specDescription, specConfig));
      };
    },


    // ### init
    // Ensure that `jasmineEnv` and `jasmineNativeApi` have been set and create the
    //  patched version of Jasmine's API. Will only run once

    //
    init = function () {
      if (!isJasmineInGlobalScope()) {
        throw "Jasmine is not available in global scope (not loaded?)";
      }

      // Store Jasmine's globals
      jasmineEnv = window.jasmine.getEnv();
      each(jasmineApiNames, function (name) { jasmineNativeApi[name] = window[name]; });

      // Create patched version of Jasmine's API
      jasq.describe  = getJasqDescribe();
      jasq.xdescribe = getJasqDescribe(true);
      jasq.it        = getJasqIt();
      jasq.xit       = getJasqIt(true);

      each(jasmineApiNames, function (name) { jasq[name].isJasq = true; });

      // Don't `init` more than once
      init = noOp;
    };

  //
  jasq.applyGlobals = function () {
    init();
    each(jasmineApiNames, function (name) { window[name] = jasq[name]; });
  };

  //
  jasq.resetGlobals = function () {
    init();
    each(jasmineApiNames, function (name) { window[name] = jasmineNativeApi[name]; });
  };

  // If Jasmine is already in global scope then go ahead and apply globals - this will also
  //  initialize jasq
  if (isJasmineInGlobalScope()) { jasq.applyGlobals(); }

  return jasq;
});
