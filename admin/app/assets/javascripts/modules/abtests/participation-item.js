/*
 Module: participation-item.js
 Description: Displays opt-in link for a variant
 */
define([
    'lodash/objects/assign',
    'common/modules/component'
], function (
    extend,
    Component
    ) {

    function ParticipationItem(config) {
        this.config = extend(this.config, config);
    }

    Component.define(ParticipationItem);

    ParticipationItem.prototype.config = {
        test: '',
        variant: ''
    };

    ParticipationItem.prototype.templateName = 'participation-item-template';
    ParticipationItem.prototype.componentClass = 'participation-item';
    ParticipationItem.prototype.classes = {};
    ParticipationItem.prototype.useBem = true;

    ParticipationItem.prototype.prerender = function() {
        this.elem.textContent = this.config.variant;
        this.elem.href = document.location.origin + "/uk#ab-" + this.config.test + "=" + this.config.variant;
    };

    return ParticipationItem;
});
