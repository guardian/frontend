/**
 * Lo-Dash 2.2.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize exports="amd" -o ./compat/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define(['../collections/forEach', '../objects/functions', '../objects/isFunction'], function(forEach, functions, isFunction) {

  /**
   * Used for `Array` method references.
   *
   * Normally `Array.prototype` would suffice, however, using an array literal
   * avoids issues in Narwhal.
   */
  var arrayRef = [];

  /** Native method shortcuts */
  var push = arrayRef.push;

  /**
   * Adds function properties of a source object to the `lodash` function and
   * chainable wrapper.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {Object} object The object of function properties to add to `lodash`.
   * @param {Object} object The object of function properties to add to `lodash`.
   * @example
   *
   * _.mixin({
   *   'capitalize': function(string) {
   *     return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
   *   }
   * });
   *
   * _.capitalize('moe');
   * // => 'Moe'
   *
   * _('moe').capitalize();
   * // => 'Moe'
   */
  function mixin(object, source) {
    var ctor = object,
        isFunc = !source || isFunction(ctor);

    forEach(functions(source), function(methodName) {
      var func = object[methodName] = source[methodName];
      if (isFunc) {
        ctor.prototype[methodName] = function() {
          var value = this.__wrapped__,
              args = [value];

          push.apply(args, arguments);
          var result = func.apply(object, args);
          if (value && typeof value == 'object' && value === result) {
            return this;
          }
          result = new ctor(result);
          result.__chain__ = this.__chain__;
          return result;
        };
      }
    });
  }

  return mixin;
});
