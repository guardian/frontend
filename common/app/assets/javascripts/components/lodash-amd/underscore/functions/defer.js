/**
 * Lo-Dash 2.2.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize underscore exports="amd" -o ./underscore/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define(['../objects/isFunction', '../internals/objectTypes', '../internals/reNative'], function(isFunction, objectTypes, reNative) {

  /** Used as a safe reference for `undefined` in pre ES5 environments */
  var undefined;

  /**
   * Used for `Array` method references.
   *
   * Normally `Array.prototype` would suffice, however, using an array literal
   * avoids issues in Narwhal.
   */
  var arrayRef = [];

  /* Native method shortcuts for methods with the same name as other `lodash` methods */
  var nativeSlice = arrayRef.slice;

  /**
   * Defers executing the `func` function until the current call stack has cleared.
   * Additional arguments will be provided to `func` when it is invoked.
   *
   * @static
   * @memberOf _
   * @category Functions
   * @param {Function} func The function to defer.
   * @param {...*} [arg] Arguments to invoke the function with.
   * @returns {number} Returns the timer id.
   * @example
   *
   * _.defer(function() { console.log('deferred'); });
   * // returns from the function before 'deferred' is logged
   */
  function defer(func) {
    if (!isFunction(func)) {
      throw new TypeError;
    }
    var args = nativeSlice.call(arguments, 1);
    return setTimeout(function() { func.apply(undefined, args); }, 1);
  }

  return defer;
});
