/**
 * Lo-Dash 2.2.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize exports="amd" -o ./compat/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define(['../internals/baseIndexOf', '../internals/cacheIndexOf', '../internals/createCache', '../internals/getArray', '../internals/largeArraySize', '../internals/releaseArray', '../internals/releaseObject'], function(baseIndexOf, cacheIndexOf, createCache, getArray, largeArraySize, releaseArray, releaseObject) {

  /**
   * Creates an array of unique values present in all provided arrays using
   * strict equality for comparisons, i.e. `===`.
   *
   * @static
   * @memberOf _
   * @category Arrays
   * @param {...Array} [array] The arrays to inspect.
   * @returns {Array} Returns an array of composite values.
   * @example
   *
   * _.intersection([1, 2, 3], [101, 2, 1, 10], [2, 1]);
   * // => [1, 2]
   */
  function intersection(array) {
    var args = arguments,
        argsLength = args.length,
        argsIndex = -1,
        caches = getArray(),
        index = -1,
        indexOf = baseIndexOf,
        length = array ? array.length : 0,
        result = [],
        seen = getArray();

    while (++argsIndex < argsLength) {
      var value = args[argsIndex];
      caches[argsIndex] = indexOf === baseIndexOf &&
        (value ? value.length : 0) >= largeArraySize &&
        createCache(argsIndex ? args[argsIndex] : seen);
    }
    outer:
    while (++index < length) {
      var cache = caches[0];
      value = array[index];

      if ((cache ? cacheIndexOf(cache, value) : indexOf(seen, value)) < 0) {
        argsIndex = argsLength;
        (cache || seen).push(value);
        while (--argsIndex) {
          cache = caches[argsIndex];
          if ((cache ? cacheIndexOf(cache, value) : indexOf(args[argsIndex], value)) < 0) {
            continue outer;
          }
        }
        result.push(value);
      }
    }
    while (argsLength--) {
      cache = caches[argsLength];
      if (cache) {
        releaseObject(cache);
      }
    }
    releaseArray(caches);
    releaseArray(seen);
    return result;
  }

  return intersection;
});
