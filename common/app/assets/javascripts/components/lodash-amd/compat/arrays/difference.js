/**
 * Lo-Dash 2.2.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize exports="amd" -o ./compat/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define(['../internals/baseFlatten', '../internals/baseIndexOf', '../internals/cacheIndexOf', '../internals/createCache', '../internals/largeArraySize', '../internals/releaseObject'], function(baseFlatten, baseIndexOf, cacheIndexOf, createCache, largeArraySize, releaseObject) {

  /**
   * Creates an array excluding all values of the provided arrays using strict
   * equality for comparisons, i.e. `===`.
   *
   * @static
   * @memberOf _
   * @category Arrays
   * @param {Array} array The array to process.
   * @param {...Array} [array] The arrays of values to exclude.
   * @returns {Array} Returns a new array of filtered values.
   * @example
   *
   * _.difference([1, 2, 3, 4, 5], [5, 2, 10]);
   * // => [1, 3, 4]
   */
  function difference(array) {
    var index = -1,
        indexOf = baseIndexOf,
        length = array ? array.length : 0,
        seen = baseFlatten(arguments, true, true, 1),
        result = [];

    var isLarge = length >= largeArraySize;

    if (isLarge) {
      var cache = createCache(seen);
      if (cache) {
        indexOf = cacheIndexOf;
        seen = cache;
      } else {
        isLarge = false;
      }
    }
    while (++index < length) {
      var value = array[index];
      if (indexOf(seen, value) < 0) {
        result.push(value);
      }
    }
    if (isLarge) {
      releaseObject(seen);
    }
    return result;
  }

  return difference;
});
