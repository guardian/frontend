/*
  Rip off of rip off of right-most-popular-js
  Description: Display experimental highlights and supplied by gravity.js
*/

define([
    'qwery',
    'common/utils/ajax',
    'lodash/objects/assign',

    'common/modules/component',
    'common/modules/onward/right-gravity-recommendation-item',
    'common/modules/ui/images'
], function(
    qwery,
    ajax,
    extend,

    Component,
    RecommendedItem,
    images
   ) {

    function RightGravityRecommendations(mediator, config) {
        this.config = extend(this.config, config);
        this.maxTrails = ('maxTrails' in config) ? config.maxTrails : 5;
        this.mediator = mediator;
        this.fetch();
    }

    Component.define(RightGravityRecommendations);

    RightGravityRecommendations.prototype.config = {
        maxTrails : 5
    };

    //RightGravityRecommendation..prototype.endpoint = 'http://rma-api.gravity.com/v0/'
    //TODO - change the local url

    RightGravityRecommendations.prototype.endpoint = '/onward/gravity.json';
    RightGravityRecommendations.prototype.templateName = 'right-gravity-recommendation';       //Might need to change this
    RightGravityRecommendations.prototype.componentClass = 'right-gravity-recommendation';     //And this
    RightGravityRecommendations.prototype.classes = { items: 'Items' };
    RightGravityRecommendations.prototype.useBem = true;

    RightGravityRecommendations.prototype.template = '<div class="right-most-popular"><h3 class="right-most-popular__title"></h3>' +
        '<ul class="right-most-popular__items u-unstyled"></ul></div>';

    RightGravityRecommendations.prototype.fetch = function() {
        this.checkAttached();

        var self = this,
            endpoint = this.endpoint,
            opt;

        for ( opt in this.options ) {
            endpoint = endpoint.replace(":" + opt, this.options[opt]);
        }


        return ajax({
            url: endpoint,
            type: 'json',
            method: 'get',
            crossOrigin: true
        }).then(
            function render(resp) {
                if( resp && 'payload' in resp ) {
                    console.log("Got a payload");
                    self.data = resp.payload;
                    self.render(qwery('.mpu-context'));
                }
            }
        );

    };

    RightGravityRecommendations.prototype.prerender = function()  {
        this.setState(this.config(this.config.type));
        this.elem.setAttribute('data-link-name', 'Right hand most popolar');
        var container = this.getElem(this.classes.items);
        this.data.slice(0, this.config.maxTrails).forEach( function(item, index) {
            new RecommendedItem(item, index).render(container);
        });
        images.upgrade(container);
    };

    return RightGravityRecommendations;
});

