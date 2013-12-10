/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize underscore exports="amd" -o ./underscore/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define(['./objects/assign', './objects/clone', './objects/defaults', './objects/forIn', './objects/forOwn', './objects/functions', './objects/has', './objects/invert', './objects/isArguments', './objects/isArray', './objects/isBoolean', './objects/isDate', './objects/isElement', './objects/isEmpty', './objects/isEqual', './objects/isFinite', './objects/isFunction', './objects/isNaN', './objects/isNull', './objects/isNumber', './objects/isObject', './objects/isRegExp', './objects/isString', './objects/isUndefined', './objects/keys', './objects/omit', './objects/pairs', './objects/pick', './objects/values'], function(assign, clone, defaults, forIn, forOwn, functions, has, invert, isArguments, isArray, isBoolean, isDate, isElement, isEmpty, isEqual, isFinite, isFunction, isNaN, isNull, isNumber, isObject, isRegExp, isString, isUndefined, keys, omit, pairs, pick, values) {

  return {
    'assign': assign,
    'clone': clone,
    'defaults': defaults,
    'extend': assign,
    'forIn': forIn,
    'forOwn': forOwn,
    'functions': functions,
    'has': has,
    'invert': invert,
    'isArguments': isArguments,
    'isArray': isArray,
    'isBoolean': isBoolean,
    'isDate': isDate,
    'isElement': isElement,
    'isEmpty': isEmpty,
    'isEqual': isEqual,
    'isFinite': isFinite,
    'isFunction': isFunction,
    'isNaN': isNaN,
    'isNull': isNull,
    'isNumber': isNumber,
    'isObject': isObject,
    'isRegExp': isRegExp,
    'isString': isString,
    'isUndefined': isUndefined,
    'keys': keys,
    'methods': functions,
    'omit': omit,
    'pairs': pairs,
    'pick': pick,
    'values': values
  };
});
