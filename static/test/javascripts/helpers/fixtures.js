/*
 *
 * A Jasmine helper to render an array of html fixtures on to the DOM
 * prior to each test case being executed.
 *
 */
define([
    'common/utils/$'
], function (
    $
) {

    function clean(id) {
        $('#' + id).remove();
    }

    function add(id, fixtures) {
        var $fixtureContainer = $.create('<div id="' + id + '"></div>');
        fixtures.forEach(function (fixture) {
            $fixtureContainer.append(fixture);
        });
        return $fixtureContainer.appendTo(document.body);
    }

    return {
        render: function (conf) {
            clean(conf.id);
            return add(conf.id, conf.fixtures);
        },
        clean: clean
    };

});
