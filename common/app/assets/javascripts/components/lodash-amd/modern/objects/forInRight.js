/**
 * Lo-Dash 2.2.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define(['../internals/baseCreateCallback', './forIn'], function(baseCreateCallback, forIn) {

  /**
   * This method is like `_.forIn` except that it iterates over elements
   * of a `collection` in the opposite order.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Object} object The object to iterate over.
   * @param {Function} [callback=identity] The function called per iteration.
   * @param {*} [thisArg] The `this` binding of `callback`.
   * @returns {Object} Returns `object`.
   * @example
   *
   * function Dog(name) {
   *   this.name = name;
   * }
   *
   * Dog.prototype.bark = function() {
   *   console.log('Woof, woof!');
   * };
   *
   * _.forInRight(new Dog('Dagny'), function(value, key) {
   *   console.log(key);
   * });
   * // => logs 'name' and 'bark' assuming `_.forIn ` logs 'bark' and 'name'
   */
  function forInRight(object, callback, thisArg) {
    var pairs = [];

    forIn(object, function(value, key) {
      pairs.push(key, value);
    });

    var length = pairs.length;
    callback = baseCreateCallback(callback, thisArg, 3);
    while (length--) {
      if (callback(pairs[length--], pairs[length], object) === false) {
        break;
      }
    }
    return object;
  }

  return forInRight;
});
