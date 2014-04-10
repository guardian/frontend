/*
 *
 * A Jasmine helper to render an array of html fixtures on to the DOM
 * prior to each test case being executed.
 *
 */
define([
    'common/$'
], function(
    $
) {

    function clean(id) {
        $('#' + id).remove();
    };

     function add(id, fixtures) {
        $('body').append('<div id="' + id + '"></div>');
        fixtures.forEach(function(fixture) {
            $('#' + id).append(fixture);
        });
     };

    return {
        render: function(conf) {
            clean(conf.id);
            add(conf.id, conf.fixtures);
        },
        clean: clean
    }

});
