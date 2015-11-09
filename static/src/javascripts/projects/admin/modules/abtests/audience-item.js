/*
 Module: audience-item.js
 Description: Displays information about how the test users are divided.
 */
define([
    'common/modules/component',
    'bonzo',
    'lodash/objects/assign',
    'lodash/objects/clone'
], function (
    Component,
    bonzo,
    assign,
    clone) {

    function AudienceItem(config) {
        this.config = assign(clone(this.config), config);
    }

    Component.define(AudienceItem);

    AudienceItem.prototype.config = {
        test: {}
    };

    AudienceItem.prototype.templateName = 'audience-item-template';
    AudienceItem.prototype.componentClass = 'audience-item';
    AudienceItem.prototype.useBem = true;

    AudienceItem.prototype.prerender = function () {
        bonzo(this.getElem('test-label')).prepend(this.config.test.id);

        // Set the width and absolute position to match the audience size and offset.
        var audience = this.config.test.audience * 100;
        var audienceOffset = this.config.test.audienceOffset * 100;
        var audienceEnd = audience + audienceOffset;

        this.getElem('test').style.width = audience.toString() + '%';
        this.getElem('test').style.left = audienceOffset.toString() + '%';

        bonzo(this.getElem('caption-test')).append(this.config.test.id);
        bonzo(this.getElem('caption-range')).append(audienceOffset + '% to ' + audienceEnd  + '%');
    };

    AudienceItem.prototype.ready = function () {

    };

    return AudienceItem;

});
