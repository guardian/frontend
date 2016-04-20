/*
Many of these actually end up in standard because they are transitive
dependencies. This means they won't appear in enhanced at all (because we
subtract standard from enhanced). However, it's necessary to keep these
dependencies listed to avoid duplication across various enhanced bundles if they
do get removed from standard (because we subtract enhanced from each enhanced
bundle).
 */
define([
    'bean',
    'bonzo',
    'enhancer',
    'EventEmitter',
    'fastdom',
    'fence',

    // We bundle Lodash where necessary, but we want the core to be cached
    // efficiently, as most modules use the same core
    'lodash/collections/forEach',
    'lodash/collections/map',
    'lodash/collections/reduce',

    'picturefill',
    'Promise',
    'qwery',

    'reqwest',
    'videojs',
    'videojsads',
    'videojsembed',
    'videojsima',
    'videojspersistvolume',
    'videojsplaylist'
], function () {});
