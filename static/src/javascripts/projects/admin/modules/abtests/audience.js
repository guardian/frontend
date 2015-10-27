/*
 Module: audience.js
 Description: Displays information about how the test users are divided.
 */
define([
    'common/utils/_',
    'common/modules/component',
    'admin/modules/abtests/audience-item'
], function (
    _,
    Component,
    AudienceItem
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
