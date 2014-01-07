/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize exports="amd" -o ./compat/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define(['./collections/at', './collections/contains', './collections/countBy', './collections/every', './collections/filter', './collections/find', './collections/findLast', './collections/forEach', './collections/forEachRight', './collections/groupBy', './collections/indexBy', './collections/invoke', './collections/map', './collections/max', './collections/min', './collections/pluck', './collections/reduce', './collections/reduceRight', './collections/reject', './collections/sample', './collections/shuffle', './collections/size', './collections/some', './collections/sortBy', './collections/toArray', './collections/where'], function(at, contains, countBy, every, filter, find, findLast, forEach, forEachRight, groupBy, indexBy, invoke, map, max, min, pluck, reduce, reduceRight, reject, sample, shuffle, size, some, sortBy, toArray, where) {

  return {
    'all': every,
    'any': some,
    'at': at,
    'collect': map,
    'contains': contains,
    'countBy': countBy,
    'detect': find,
    'each': forEach,
    'eachRight': forEachRight,
    'every': every,
    'filter': filter,
    'find': find,
    'findLast': findLast,
    'findWhere': find,
    'foldl': reduce,
    'foldr': reduceRight,
    'forEach': forEach,
    'forEachRight': forEachRight,
    'groupBy': groupBy,
    'include': contains,
    'indexBy': indexBy,
    'inject': reduce,
    'invoke': invoke,
    'map': map,
    'max': max,
    'min': min,
    'pluck': pluck,
    'reduce': reduce,
    'reduceRight': reduceRight,
    'reject': reject,
    'sample': sample,
    'select': filter,
    'shuffle': shuffle,
    'size': size,
    'some': some,
    'sortBy': sortBy,
    'toArray': toArray,
    'where': where
  };
});
