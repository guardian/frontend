/*
 Module: highlights-panel.js
 Description: Display experimental highlights panel
 */
define([
    'qwery',
    'utils/ajax',
    'lodash/objects/assign',

    'modules/component',
    'modules/experiments/right-most-popular-image-item',
    'modules/experiments/right-most-popular-list-item',
    'modules/ui/images'
], function (
    qwery,
    ajax,
    extend,

    Component,
    ImageItem,
    ListItem,
    images
    ) {

    function RightMostPopular(mediator, config) {
        this.config = extend(this.config, config);
        this.maxTrails = ('maxTrails' in config) ? config.maxTrails : 5;
        this.mediator = mediator;
        this.fetch();
    }

    Component.define(RightMostPopular);

    RightMostPopular.prototype.config = {
        type: 'image',
        maxTrails : 5
    };

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
        var self = this;
        this.setState(this.config.type);
        this.elem.setAttribute('data-link-name', 'Right hand most popular');
        var container = this.getElem(this.classes.items);
        this.data.slice(0, this.config.maxTrails).forEach(function(item, index) {
            if(self.config.type === 'image') {
                new ImageItem(item, index).render(container);
            } else {
               new ListItem(item, index).render(container);
            }
        });
        images.upgrade(container);
    };

    return RightMostPopular;

});
