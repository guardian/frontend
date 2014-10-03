/*
 Module: audience.js
 Description: Displays information about how the test users are divided.
 */
define([
    'lodash/main',
    'common/modules/component',
    'modules/abtests/audience-item'
], function (
    _,
    Component,
    audienceItem
    ) {

    function Audience(config) {
        this.config = _.extend(_.clone(this.config), config);
    }

    Component.define(Audience);

    Audience.prototype.config = {
        tests: []
    };

    Audience.prototype.templateName = 'audience-template';
    Audience.prototype.componentClass = 'audience-breakdown';
    Audience.prototype.useBem = true;

    Audience.prototype.prerender = function() {

        var testsContainer = this.getElem('tests');

        this.config.tests.forEach(function(test) {
            new audienceItem({test: test}).render(testsContainer);
        });
    };

    Audience.prototype.ready = function() {

    };

    return Audience;

});
