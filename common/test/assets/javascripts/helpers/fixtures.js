/*
 *
 * A Jasmine helper to render an array of html fixtures on to the DOM
 * prior to each test case being executed.
 *
 */

define(['common'], function(common) {
    
    function clean(id) {
        common.$g('#' + id).remove();
        };

     function add(id, fixtures) {
        common.$g('body').append('<div id="' + id + '">foo</div>');
        fixtures.forEach(function(fixture) {
            common.$g('#' + id).append(fixture);
        });
     };

    return {
        render: function(conf) {
            clean(conf.id);
            add(conf.id, conf.fixtures);
        }
    }

});
