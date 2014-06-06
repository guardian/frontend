define(['lodash/arrays/compact', 'lodash/arrays/flatten', 'lodash/arrays/zip', 'lodash/chaining/wrapperValueOf',
        'lodash/collections/forEach', 'lodash/collections/map', 'lodash/collections/pluck', 'lodash/collections/sortBy',
        'lodash/objects/mapValues', 'lodash/collections/max', 'lodash/objects/pairs', 'lodash/objects/values',
        'lodash/objects/forOwn', 'lodash/objects/isArray', 'lodash/utilities/mixin', 'lodash/internals/lodashWrapper',
        'lodash/objects/functions', 'lodash/collections/filter', 'lodash/arrays/first', 'lodash/arrays/last', 'lodash/collections/find', 'lodash/collections/every'],
function(compact, flatten, zip, wrapperValueOf, forEach, map, pluck, sortBy, mapValues, max, pairs, values,
         forOwn, isArray, mixin, LodashWrapper, functions, filter, first, last, find, every) {

    var arrayRef = [];
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;


    function Lodash(value) {
        // don't wrap if already wrapped, even if wrapped by a different `lodash` constructor
        return (value && typeof value === 'object' && !isArray(value) && hasOwnProperty.call(value, '__wrapped__'))
            ? value : new LodashWrapper(value);
    }
    // ensure `new lodashWrapper` is an instance of `lodash`
    LodashWrapper.prototype = Lodash.prototype;

    // wrap `_.mixin` so it works when provided only one argument
    mixin = (function(fn) {
        var functions = functions;
        return function(object, source, options) {
          if (!source || (!options && !functions(source).length)) {
            if (options === null) {
              options = source;
            }
            source = object;
            object = Lodash;
          }
          return fn(object, source, options);
        };
    }(mixin));

    // add functions that return wrapped values when chaining
    Lodash.compact = compact;
    Lodash.flatten = flatten;
    Lodash.forEach = forEach;
    Lodash.filter = filter;
    Lodash.map = map;
    Lodash.mapValues = mapValues;
    Lodash.max = max;
    Lodash.pairs = pairs;
    Lodash.pluck = pluck;
    Lodash.sortBy = sortBy;
    Lodash.values = values;
    Lodash.zip = zip;
    Lodash.last = last;
    Lodash.find = find;

    Lodash.first = first;
    Lodash.take = first;

    Lodash.forOwn = forOwn;
    Lodash.every = every;

    // add functions to `Lodash.prototype`
    mixin(Lodash);

    // add functions that return unwrapped values when chaining
    Lodash.mixin = mixin;

    mixin((function() {
        var source = {};
        forOwn(Lodash, function(func, methodName) {
          if (!Lodash.prototype[methodName]) {
            source[methodName] = func;
          }
        });
        return source;
    })(), false);

    forOwn(Lodash, function(func, methodName) {
        var callbackable = methodName !== 'sample';
        if (!Lodash.prototype[methodName]) {
          Lodash.prototype[methodName]= function(n, guard) {
            var chainAll = this.__chain__,
                result = func(this.__wrapped__, n, guard);

            return !chainAll && (n === null || (guard && !(callbackable && typeof n === 'function')))
              ? result
              : new LodashWrapper(result, chainAll);
          };
        }
    });

    /**
    * The semantic version number.
    *
    * @static
    * @memberOf _
    * @type string
    */
    Lodash.VERSION = '2.4.1';

    // add "Chaining" functions to the wrapper
    Lodash.prototype.valueOf = wrapperValueOf;

    // add `Array` functions that return unwrapped values
    forEach(['join', 'pop', 'shift'], function(methodName) {
        var func = arrayRef[methodName];
        Lodash.prototype[methodName] = function() {
          var chainAll = this.__chain__,
              result = func.apply(this.__wrapped__, arguments);

          return chainAll
            ? new LodashWrapper(result, chainAll)
            : result;
        };
    });

    // add `Array` functions that return the existing wrapped value
    forEach(['push', 'reverse', 'sort', 'unshift'], function(methodName) {
        var func = arrayRef[methodName];
        Lodash.prototype[methodName] = function() {
          func.apply(this.__wrapped__, arguments);
          return this;
        };
    });

    // add `Array` functions that return new wrapped values
    forEach(['concat', 'slice', 'splice'], function(methodName) {
        var func = arrayRef[methodName];
        Lodash.prototype[methodName] = function() {
          return new LodashWrapper(func.apply(this.__wrapped__, arguments), this.__chain__);
        };
    });

    //(Lodash.templateSettings = utilities.templateSettings).imports._ = Lodash;
    return Lodash;
});
