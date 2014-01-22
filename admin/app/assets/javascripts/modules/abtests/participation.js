/*
 Module: participation.js
 Description: Displays opt-in and opt-out links for a test
 */
define([
    'lodash/objects/assign',
    'common/modules/component',
    'modules/abtests/participation-item'
], function (
    extend,
    Component,
    ParticipationItem
    ) {

    function Participation(config) {
        this.config = extend(this.config, config);
    }

    Component.define(Participation);

    Participation.prototype.config = {
        test: ''
    };

    Participation.prototype.templateName = 'participation-template';
    Participation.prototype.componentClass = 'participation';
    Participation.prototype.useBem = true;

    Participation.prototype.prerender = function() {
        var test = this.config.test;
        this.getElem('opt-out').href = "http://www.theguardian.com/uk#ab-" + test.id + "=notintest";

        var linksContainer = this.getElem('links');

        test.variants.forEach(function(variant) {
            new ParticipationItem({test: test.id, variant: variant.id}).render(linksContainer);
        });
    };

    return Participation;

});
