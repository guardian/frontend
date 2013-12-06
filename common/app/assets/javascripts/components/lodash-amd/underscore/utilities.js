/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize underscore exports="amd" -o ./underscore/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define(['./functions/createCallback', './utilities/escape', './utilities/identity', './utilities/mixin', './utilities/noConflict', './utilities/noop', './utilities/now', './utilities/property', './utilities/random', './utilities/result', './utilities/template', './utilities/templateSettings', './utilities/times', './utilities/unescape', './utilities/uniqueId'], function(createCallback, escape, identity, mixin, noConflict, noop, now, property, random, result, template, templateSettings, times, unescape, uniqueId) {

  return {
    'createCallback': createCallback,
    'escape': escape,
    'identity': identity,
    'mixin': mixin,
    'noConflict': noConflict,
    'noop': noop,
    'now': now,
    'property': property,
    'random': random,
    'result': result,
    'template': template,
    'templateSettings': templateSettings,
    'times': times,
    'unescape': unescape,
    'uniqueId': uniqueId
  };
});
