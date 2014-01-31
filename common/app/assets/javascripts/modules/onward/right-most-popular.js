/*
 Module: highlights-panel.js
 Description: Display experimental highlights panel
 */
define([
    'qwery',
    'common/utils/ajax',
    'lodash/objects/assign',

    'common/modules/component',
    'common/modules/onward/right-most-popular-image-item',
    'common/modules/onward/right-recommended-item',
    'common/modules/onward/gravity-cookie',
    'common/modules/ui/images'
], function (
    qwery,
    ajax,
    extend,

    Component,
    ImageItem,
    RecommendedItem,
    GravityCookie,
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
        maxTrails : 5
    };

    RightMostPopular.bar = function() {

        RightMostPopular.endpoint = "http://rma-api.gravity.com/v0/site/14b492cf6727dd1ab3a6efc7556b91bc/user/" + GravityCookie.getGuId() + "/stories?limit=7&rec_type=personalized&c=thisthat";
        RightMostPopular.getGravityRecommendations = true;
    };

    RightMostPopular.data = 'trails';
    RightMostPopular.endpoint = '/most-read.json';
    RightMostPopular.prototype.templateName = 'right-most-popular';
    RightMostPopular.prototype.componentClass = 'right-most-popular';
    RightMostPopular.prototype.classes = { items: 'items' };
    RightMostPopular.prototype.useBem = true;
    RightMostPopular.getGravityRecommendations = false;

    RightMostPopular.prototype.template = '<div class="right-most-popular"><h3 class="right-most-popular__title">Most popular</h3>' +
        '<ul class="right-most-popular__items u-unstyled"></ul></div></div>';

    RightMostPopular.prototype.fetch = function() {
        this.checkAttached();
        var self = this,
            endpoint = RightMostPopular.endpoint,
            opt;

        for (opt in this.options) {
            endpoint = endpoint.replace(':'+ opt, this.options[opt]);
        }

        return ajax( this._configureAjax(endpoint, RightMostPopular.getGravityRecommendations) );
    };


    RightMostPopular.prototype.prerender = function() {

        this.setState(this.config.type);
        this.elem.setAttribute('data-link-name', 'Right hand most popular');
        var container = this.getElem(this.classes.items);
        this.data.slice(0, this.config.maxTrails).forEach(function(item, index) {
            if ( RightMostPopular.getGravityRecommendations ) {
                new RecommendedItem(item, index).render(container);
            } else {
                new ImageItem(item, index).render(container);
            }
        });
        images.upgrade(container);
    };

    RightMostPopular.prototype._render = function(resp)  {
        var self = this;
        if(resp && 'trails' in resp) {
            self.data = resp.trails;
            self.render(qwery('.mpu-context'));
        }
        if(resp && 'payload' in resp) {
           self.data = resp.payload;
           self.render(qwery('.mpu-context'));
        }
    };


    RightMostPopular.prototype._configureAjax = function (endpoint, gravity) {

        var self = this;

        if( gravity ) {
            return {
                url: endpoint,
                type: 'jsonp',
                method: 'get',
                jsonpCallback: 'c',
                crossOrigin: true,
                success: function(response) { self._render(response); }
            };
        } else {
            return {
                url: endpoint,
                type: 'json',
                method: 'get',
                crossOrigin: true,
                success: function(response) { self._render(response); }

            };
        }
    };


    return RightMostPopular;
});
