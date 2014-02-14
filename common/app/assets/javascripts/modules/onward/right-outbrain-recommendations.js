/*global OBR:false*/
define([
    'qwery',
    'lodash/objects/assign',
    'common/modules/component',

    'common/modules/onward/right-outbrain-recommended-item',
    'common/modules/ui/images'
], function(
    qwery,
    extend,
    Component,
    RecommendedItem,
    Images
    ){

    function RightOutbrainRecommendations(mediator, config) {
         this.pageId = config.pageId;
         this.config = extend(this.config, config);
         this.fetch();
    }

    Component.define(RightOutbrainRecommendations);

    RightOutbrainRecommendations.prototype.config = {
        maxTrails: 5
    };

    RightOutbrainRecommendations.prototype.templateName = 'right-recommended';
    RightOutbrainRecommendations.prototype.componentClass = 'right-recommended';
    RightOutbrainRecommendations.prototype.classes = { items: 'items' };
    RightOutbrainRecommendations.prototype.useBem = true;

    RightOutbrainRecommendations.prototype.template = '<div class="right-recommended"><h3 class="right-recommended__title">Recommended by outbrain</h3>' +
        '<ul class="right-recommended__items u-unstyled"></ul></div></div>';

    RightOutbrainRecommendations.prototype.fetch = function(config) {
        var that = this;

        require(['js!outbrain'], function() {

            var request_data = {
                permalink: "http://www.theguardian.com/" + this.pageId,
                widgetId: "APP_2"
            };

            var handle_recommendations = function(json) {
                that.data = json.doc.slice(0,that.config.maxTrails);
                that.render(qwery('.js-right-hand-component'));
            };

            OBR.extern.callRecs(request_data, handle_recommendations);
        });
    };

    RightOutbrainRecommendations.prototype.prerender  = function() {
        this.setState(this.config.type);
        this.elem.setAttribute('data-link-name', 'Right hand most popular');
        var container = this.getElem(this.classes.items);

        this.data.forEach(function(item, index) {
            new RecommendedItem(item, index).render(container);
        });
        Images.upgrade(container);
    };

    return RightOutbrainRecommendations;
});
