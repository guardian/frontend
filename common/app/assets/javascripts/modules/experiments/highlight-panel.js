/*
    Module: highlights-panel.js
    Description: Display experimental highlights panel
*/
define([
    'bonzo',
    'utils/request-animation-frame',
    'modules/component',
    'modules/experiments/highlight-item',
    'modules/ui/images'
], function (
    bonzo,
    requestAnimationFrame,
    Component,
    Item,
    images
) {

    function HighlightPanel(data, mediator) {
        this.data = data;
        this.mediator = mediator;
        this.render();
    }

    Component.define(HighlightPanel);

    HighlightPanel.prototype.maxTrails = 3;
    HighlightPanel.prototype.templateName = 'highlight-panel';
    HighlightPanel.prototype.componentClass = 'highlight-panel';
    HighlightPanel.prototype.classes = { items: 'items' };
    HighlightPanel.prototype.useBem = true;

    HighlightPanel.prototype.template = '<div class="highlight-panel"><div class="gs-container">' +
         '<h3 class="highlight-panel__title">Read next &#8230;</h3><ul class="highlight-panel__items u-unstyled"></ul></div></div>';

    HighlightPanel.prototype.prerender = function() {
        var container = this.getElem(this.classes.items);
        this.data.slice(0, this.maxTrails).forEach(function(item, index) {
            new Item(item, index).render(container);
        });
        images.upgrade(container);
        this.bindListeners();
    };

    HighlightPanel.prototype.bindListeners = function() {
        var self = this,
            pos;

        this.mediator.on('window:scroll', function(e) {
            requestAnimationFrame(function() {
                var scrollTop = bonzo(document.body).scrollTop();
                if(pos > scrollTop) {
                    self.setState('is-open');
                } else {
                    self.removeState('is-open');
                }
                pos = scrollTop;
            });
        });
    };

    return HighlightPanel;

});
