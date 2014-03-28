define([], function() {

    var effectiveMeasureUrl = 'js!' + (document.location.protocol === 'https:' ? 'https://au-ssl' : 'http://au-cdn') + '.effectivemeasure.net/em.js';

    function load() {
        require([effectiveMeasureUrl], function() {});
    }

    return {
        load: load
    };

});
