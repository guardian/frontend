/*
    Module: highlights-panel.js
    Description: Display experimental highlights panel
*/
define([
    'modules/component',
    'modules/experiments/highlight-item'
], function (
    Component,
    Item
) {

    function HighlightPanel(data, mediator) {
        this.data = data;
        this.mediator = mediator;
        this.render();
    }

    Component.define(HighlightPanel);

    HighlightPanel.CONFIG = {
        maxTrails: 3,
        templateName: 'highlight-panel',
        componentClass: 'highlight-panel',
        classes: {
            items: 'items'
        },
        useBem: true
    };

    HighlightPanel.prototype.prerender = function() {
        var container = this.getElem(this.conf().classes.items);
        this.data.slice(0, this.conf().maxTrails).forEach(function(item) {
            new Item(item).render(container);
        });
        this.setState('is-hidden');
    };

    return HighlightPanel;

});
