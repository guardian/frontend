/*
 Module: participation.js
 Description: Displays a single participation
 */
define([
    'lodash/objects/assign',
    'common/modules/component'
], function (
    extend,
    Component
    ) {

    function Participation(config) {
        this.config = extend(this.config, config);
    }

    Component.define(Participation);

    Participation.prototype.config = {
        test: '',
        variant: ''
    };

    Participation.prototype.templateName = 'participation-template';
    Participation.prototype.componentClass = 'participation';
    Participation.prototype.classes = { test: 'test', variant: 'variant'};
    Participation.prototype.useBem = true;

    Participation.prototype.prerender = function() {
        this.getElem(this.classes.test).innerHTML = this.config.test;
        this.getElem(this.classes.variant).innerHTML = this.config.variant;
    };

    return Participation;

});
