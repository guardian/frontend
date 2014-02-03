/*
 Module: highlights-panel.js
 Description: Display experimental highlights panel
 */
define([
    'qwery',
    'common/utils/ajax',
    'common/utils/cookies',
    'lodash/objects/assign',
    'common/modules/component',

    'common/modules/onward/right-recommended-item',
    'common/modules/ui/images'

], function (
    qwery,
    ajax,
    cookies,
    extend,
    Component,

    RecommendedItem,
    images
    ) {

    function RightRecommendedForYou(mediator, config) {
        this.config = extend(this.config, config);
        this.maxTrails = ('maxTrails' in config) ? config.maxTrails : 5;
        this.mediator = mediator;
        this.fetch();
    }

    Component.define(RightRecommendedForYou);

    RightRecommendedForYou.prototype.config = {
        maxTrails : 5
    };

    RightRecommendedForYou.prototype.endpoint = function() {

        var guid = cookies.get('grvinsights');

        return "http://rma-api.gravity.com/v0/site/14b492cf6727dd1ab3a6efc7556b91bc/user/"
            + guid + "/stories?limit=7&rec_type=personalized&c=thisthat";
    };

    RightRecommendedForYou.prototype.templateName = 'right-most-popular';
    RightRecommendedForYou.prototype.componentClass = 'right-most-popular';
    RightRecommendedForYou.prototype.classes = { items: 'items' };
    RightRecommendedForYou.prototype.useBem = true;

    RightRecommendedForYou.prototype.template = '<div class="right-most-popular"><h3 class="right-most-popular__title">Most popular</h3>' +
        '<ul class="right-most-popular__items u-unstyled"></ul></div></div>';

    RightRecommendedForYou.prototype.fetch = function() {
        this.checkAttached();
        var self = this,
            endpoint = this.endpoint(),
            opt;

        for (opt in this.options) {
            endpoint = endpoint.replace(':'+ opt, this.options[opt]);
        }

        return ajax({
            url: endpoint,
            type: 'jsonp',
            method: 'get',
            crossOrigin: true,
            jsonpCallback: 'c',
            success: function(resp) {
                self._render(resp)
            }
        });
    };

    RightRecommendedForYou.prototype._render = function(resp) {
        var self = this;

        if(resp && 'payload' in resp) {
            self.data = resp.payload;
            self.render(qwery('.mpu-context'));
        }
    };

    RightRecommendedForYou.prototype.prerender = function() {
        this.setState(this.config.type);
        this.elem.setAttribute('data-link-name', 'Right hand most popular');
        var container = this.getElem(this.classes.items);
        this.data.slice(0, this.config.maxTrails).forEach(function(item, index) {
            new RecommendedItem(item, index).render(container);
        });
        images.upgrade(container);
    };

    return RightRecommendedForYou;

});

