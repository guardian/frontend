/*
 Module: participation-item.js
 Description: Displays opt-in link for a variant
 */
define([
    'common/utils/_',
    'common/modules/component'
], function (
    _,
    Component
    ) {

    function ParticipationItem(config) {
        this.config = _.extend(this.config, config);
    }

    Component.define(ParticipationItem);

    ParticipationItem.prototype.config = {
        test: '',
        examplePath: '',
        variant: ''
    };

    ParticipationItem.prototype.templateName = 'participation-item-template';
    ParticipationItem.prototype.componentClass = 'participation-item';
    ParticipationItem.prototype.classes = {};
    ParticipationItem.prototype.useBem = true;

    ParticipationItem.prototype.prerender = function () {
        var origin = /gutools.co.uk$/.test(document.location.origin) ? 'http://www.theguardian.com' : document.location.origin,
            href = this.config.examplePath + '=' + this.config.variant;
        this.elem.textContent = this.config.variant;
        this.elem.href = origin + href;
    };

    return ParticipationItem;
});
