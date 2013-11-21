/*
    Module: highlights-panel.js
    Description: Display experimental highlights panel
*/
define([
    'bonzo',
    'modules/component',
    'modules/experiments/highlight-item'
], function (
    bonzo,
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
        this.bindListeners();
        this.setState('is-hidden');
    };

    HighlightPanel.prototype.bindListeners = function() {
        var self = this,
            pos;

        this.mediator.on('window:scroll', function(e) {
            var scrollTop = bonzo(document.body).scrollTop();
            if(pos > scrollTop) {
                self.setState('is-open');
            } else {
                self.removeState('is-open');
            }
            pos = scrollTop;
        }) ;
    };

    return HighlightPanel;

});
