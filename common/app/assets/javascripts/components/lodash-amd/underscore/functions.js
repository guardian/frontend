/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize underscore exports="amd" -o ./underscore/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define(['./functions/after', './functions/bind', './functions/bindAll', './functions/compose', './functions/createCallback', './functions/debounce', './functions/defer', './functions/delay', './functions/memoize', './functions/once', './functions/partial', './functions/throttle', './functions/wrap'], function(after, bind, bindAll, compose, createCallback, debounce, defer, delay, memoize, once, partial, throttle, wrap) {

  return {
    'after': after,
    'bind': bind,
    'bindAll': bindAll,
    'compose': compose,
    'createCallback': createCallback,
    'debounce': debounce,
    'defer': defer,
    'delay': delay,
    'memoize': memoize,
    'once': once,
    'partial': partial,
    'throttle': throttle,
    'wrap': wrap
  };
});
