/*
 Module: audience.js
 Description: Displays information about how the test users are divided.
 */
define([
    'common/modules/component',
    'admin/modules/abtests/audience-item',
    'lodash/objects/assign',
    'lodash/objects/clone'
], function (
    Component,
    AudienceItem,
    assign,
    clone
) {

    function Audience(config) {
        this.config = assign(clone(this.config), config);
    }

    Component.define(Audience);

    Audience.prototype.config = {
        tests: []
    };

    Audience.prototype.templateName = 'audience-template';
    Audience.prototype.componentClass = 'audience-breakdown';
    Audience.prototype.useBem = true;

    Audience.prototype.prerender = function () {

        var testsContainer = this.getElem('tests');

        this.config.tests.forEach(function (test) {
            /*eslint-disable new-cap*/
            new AudienceItem({test: test}).render(testsContainer);
            /*eslint-enable new-cap*/
        });
    };

    Audience.prototype.ready = function () {

    };

    return Audience;

});
