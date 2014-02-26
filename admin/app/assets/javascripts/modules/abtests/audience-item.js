/*
 Module: audience-item.js
 Description: Displays information about how the test users are divided.
 */
define([
    'lodash/main',
    'common/modules/component',
    'bonzo',
    'qwery',
    'bean'
], function (
    _,
    Component,
    bonzo,
    qwery,
    bean
    ) {

    function AudienceItem(config) {
        this.config = _.extend(_.clone(this.config), config);
    }

    Component.define(AudienceItem);

    AudienceItem.prototype.config = {
        test: {}
    };

    AudienceItem.prototype.templateName = 'audience-item-template';
    AudienceItem.prototype.componentClass = 'audience-item';
    AudienceItem.prototype.useBem = true;

    AudienceItem.prototype.prerender = function() {
        this.getElem('test').textContent = this.config.test.id;
    };

    AudienceItem.prototype.ready = function() {

    };

    return AudienceItem;

});
