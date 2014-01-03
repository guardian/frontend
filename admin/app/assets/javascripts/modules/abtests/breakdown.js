/*
 Module: breakdown.js
 Description: Displays a list of expired and active test information
 */
define([
    'lodash/objects/assign',
    'common/modules/component',
    'modules/abtests/breakdown-item'
], function (
    extend,
    Component,
    Item
    ) {

    function Breakdown(config) {
        this.config = extend(this.config, config);
    }

    Component.define(Breakdown);

    Breakdown.prototype.config = {
        expired: [],
        active: []
    };

    Breakdown.prototype.templateName = 'breakdown-template';
    Breakdown.prototype.componentClass = 'breakdown';
    Breakdown.prototype.classes = {expired: 'expired', active: 'active'};
    Breakdown.prototype.useBem = true;

    Breakdown.prototype.prerender = function() {

        var expiredContainer = this.getElem(this.classes.expired);

        this.config.expired.forEach(function(test) {
            new Item({test: test}).render(expiredContainer);
        });

        var activeContainer = this.getElem(this.classes.active);

        this.config.active.forEach(function(test) {
            new Item({test: test}).render(activeContainer);
        });
    };

    return Breakdown;

});
