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
    ParticipationItem.prototype.classes = { optIn: 'opt-in', variant: 'variant'};
    ParticipationItem.prototype.useBem = true;

    ParticipationItem.prototype.prerender = function() {
        this.getElem(this.classes.variant).textContent = this.config.variant + ": ";
        this.getElem(this.classes.optIn).href = "http://www.theguardian.com/uk#ab-" + this.config.test + "=" + this.config.variant;
    };

    return ParticipationItem;
});
