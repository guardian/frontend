/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize exports="amd" -o ./compat/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define(['./functions/after', './functions/bind', './functions/bindAll', './functions/bindKey', './functions/compose', './functions/createCallback', './functions/curry', './functions/debounce', './functions/defer', './functions/delay', './functions/memoize', './functions/once', './functions/partial', './functions/partialRight', './functions/throttle', './functions/wrap'], function(after, bind, bindAll, bindKey, compose, createCallback, curry, debounce, defer, delay, memoize, once, partial, partialRight, throttle, wrap) {

  return {
    'after': after,
    'bind': bind,
    'bindAll': bindAll,
    'bindKey': bindKey,
    'compose': compose,
    'createCallback': createCallback,
    'curry': curry,
    'debounce': debounce,
    'defer': defer,
    'delay': delay,
    'memoize': memoize,
    'once': once,
    'partial': partial,
    'partialRight': partialRight,
    'throttle': throttle,
    'wrap': wrap
  };
});
