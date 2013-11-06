/**
 * Lo-Dash 2.2.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize underscore exports="amd" -o ./underscore/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define(['../internals/baseFlatten', '../internals/baseIndexOf', './forIn'], function(baseFlatten, baseIndexOf, forIn) {

  /**
   * Creates a shallow clone of `object` excluding the specified properties.
   * Property names may be specified as individual arguments or as arrays of
   * property names. If a callback is provided it will be executed for each
   * property of `object` omitting the properties the callback returns truey
   * for. The callback is bound to `thisArg` and invoked with three arguments;
   * (value, key, object).
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Object} object The source object.
   * @param {Function|...string|string[]} [callback] The properties to omit or the
   *  function called per iteration.
   * @param {*} [thisArg] The `this` binding of `callback`.
   * @returns {Object} Returns an object without the omitted properties.
   * @example
   *
   * _.omit({ 'name': 'moe', 'age': 40 }, 'age');
   * // => { 'name': 'moe' }
   *
   * _.omit({ 'name': 'moe', 'age': 40 }, function(value) {
   *   return typeof value == 'number';
   * });
   * // => { 'name': 'moe' }
   */
  function omit(object) {
    var indexOf = baseIndexOf,
        props = baseFlatten(arguments, true, false, 1),
        result = {};

    forIn(object, function(value, key) {
      if (indexOf(props, key) < 0) {
        result[key] = value;
      }
    });
    return result;
  }

  return omit;
});
