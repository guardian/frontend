/*
 Module: breakdown-item.js
 Description: Displays information about a single test
 */
define([
    'lodash/objects/assign',
    'common/modules/component'
], function (
    extend,
    Component
    ) {

    function BreakdownItem(config) {
        this.config = extend(this.config, config);
    }

    Component.define(BreakdownItem);

    BreakdownItem.prototype.config = {
        test: {}
    };

    BreakdownItem.prototype.templateName = 'breakdown-item-template';
    BreakdownItem.prototype.componentClass = 'breakdown-item';
    BreakdownItem.prototype.classes = {name: 'name'};
    BreakdownItem.prototype.useBem = true;

    BreakdownItem.prototype.prerender = function() {
        this.getElem(this.classes.name).innerHTML = this.config.test.id;
    };

    return BreakdownItem;

});
