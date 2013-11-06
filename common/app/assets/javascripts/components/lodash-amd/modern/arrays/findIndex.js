/**
 * Lo-Dash 2.2.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define(['../functions/createCallback'], function(createCallback) {

  /**
   * This method is like `_.find` except that it returns the index of the first
   * element that passes the callback check, instead of the element itself.
   *
   * @static
   * @memberOf _
   * @category Arrays
   * @param {Array} array The array to search.
   * @param {Function|Object|string} [callback=identity] The function called
   *  per iteration. If a property name or object is provided it will be used
   *  to create a "_.pluck" or "_.where" style callback, respectively.
   * @param {*} [thisArg] The `this` binding of `callback`.
   * @returns {number} Returns the index of the found element, else `-1`.
   * @example
   *
   * _.findIndex(['apple', 'banana', 'beet'], function(food) {
   *   return /^b/.test(food);
   * });
   * // => 1
   */
  function findIndex(array, callback, thisArg) {
    var index = -1,
        length = array ? array.length : 0;

    callback = createCallback(callback, thisArg, 3);
    while (++index < length) {
      if (callback(array[index], index, array)) {
        return index;
      }
    }
    return -1;
  }

  return findIndex;
});
