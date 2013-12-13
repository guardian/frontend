/*
 Module: highlights-panel.js
 Description: Display experimental highlights panel
 */
define([
    'qwery',
    'utils/ajax',
    'modules/component',
    'modules/experiments/right-most-popular-item',
    'modules/ui/images'
], function (
    qwery,
    ajax,
    Component,
    Item,
    images
    ) {

    function RightMostPopular(mediator) {
        this.mediator = mediator;
        this.fetch();
    }

    Component.define(RightMostPopular);

    RightMostPopular.prototype.maxTrails = 5;
    RightMostPopular.prototype.endpoint = '/most-read.json';
    RightMostPopular.prototype.templateName = 'right-most-popular';
    RightMostPopular.prototype.componentClass = 'right-most-popular';
    RightMostPopular.prototype.classes = { items: 'items' };
    RightMostPopular.prototype.useBem = true;

    RightMostPopular.prototype.template = '<div class="right-most-popular"><h3 class="right-most-popular__title">Read next &#8230;</h3>' +
        '<ul class="right-most-popular__items u-unstyled"></ul></div></div>';

    RightMostPopular.prototype.fetch = function() {
        this.checkAttached();
        var self = this,
            endpoint = this.endpoint,
            opt;

        for (opt in this.options) {
            endpoint = endpoint.replace(':'+ opt, this.options[opt]);
        }

        return ajax({
            url: endpoint,
            type: 'json',
            method: 'get',
            crossOrigin: true
        }).then(
            function render(resp) {
                if(resp && 'trails' in resp) {
                    self.data = resp.trails;
                    self.render(qwery('.mpu-context'));
                }
            }
        );
    };

    RightMostPopular.prototype.prerender = function() {
        var container = this.getElem(this.classes.items);
        this.data.slice(0, this.maxTrails).forEach(function(item) {
            new Item(item).render(container);
        });
        images.upgrade(container);
    };

    return RightMostPopular;

});
