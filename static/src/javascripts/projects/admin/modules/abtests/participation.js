/*
 Module: participation.js
 Description: Displays opt-in and opt-out links for a test
 */
define([
    'common/utils/_',
    'common/modules/component',
    'admin/modules/abtests/participation-item'
], function (
    _,
    Component,
    ParticipationItem
) {

    function Participation(config) {
        this.config = _.extend(this.config, config);
    }

    Component.define(Participation);

    Participation.prototype.config = {
        test: ''
    };

    Participation.prototype.templateName = 'participation-template';
    Participation.prototype.componentClass = 'participation';
    Participation.prototype.useBem = true;

    Participation.prototype.prerender = function () {
        var test = this.config.test,
            origin = /gutools.co.uk$/.test(document.location.origin) ? 'http://www.theguardian.com' : document.location.origin,
            examplePath = (test.examplePath || '/uk') + '#ab-' + test.id;

        this.getElem('opt-out').href = origin + examplePath + '=notintest';

        var linksContainer = this.getElem('links');

        test.variants.forEach(function (variant) {
            new ParticipationItem({test: test.id, examplePath: examplePath, variant: variant.id}).render(linksContainer);
        });
    };

    return Participation;

});
