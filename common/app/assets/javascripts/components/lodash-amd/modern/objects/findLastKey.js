/**
 * Lo-Dash 2.2.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define(['../functions/createCallback', './forOwnRight'], function(createCallback, forOwnRight) {

  /**
   * This method is like `_.findKey` except that it iterates over elements
   * of a `collection` in the opposite order.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Object} object The object to search.
   * @param {Function|Object|string} [callback=identity] The function called per
   *  iteration. If a property name or object is provided it will be used to
   *  create a "_.pluck" or "_.where" style callback, respectively.
   * @param {*} [thisArg] The `this` binding of `callback`.
   * @returns {string|undefined} Returns the key of the found element, else `undefined`.
   * @example
   *
   * _.findLastKey({ 'a': 1, 'b': 2, 'c': 3, 'd': 4 }, function(num) {
   *   return num % 2 == 1;
   * });
   * // => returns `c`, assuming `_.findKey` returns `a`
   */
  function findLastKey(object, callback, thisArg) {
    var result;
    callback = createCallback(callback, thisArg, 3);
    forOwnRight(object, function(value, key, object) {
      if (callback(value, key, object)) {
        result = key;
        return false;
      }
    });
    return result;
  }

  return findLastKey;
});
