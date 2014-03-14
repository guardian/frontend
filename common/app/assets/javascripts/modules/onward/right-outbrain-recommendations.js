/*global OBR:false*/
define([
    'qwery',
    'lodash/objects/assign',
    'common/modules/component',
    'bean',
    'common/modules/analytics/register',

    'common/modules/onward/right-outbrain-recommended-item',
    'common/modules/ui/images'
], function(
    qwery,
    extend,
    Component,
    bean,
    register,
    RecommendedItem,
    Images
    ){

    function RightOutbrainRecommendations(mediator, config) {
        register.begin('right-outbrain-recommendations');
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

    RightOutbrainRecommendations.prototype.template = '<div class="right-recommended" data-component="right-outbrain-recommendations"><h3 class="right-recommended__title">Recommended for you</h3>' +
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
        bean.on(document.body, 'click', '.right-recommended-item__url', function() {
            s.events = "events37";
            s.evar7 = "s.pageName";

            s.evar37 = "right-popular-contrentrec";

            s.linkTrackVars="events,eVar37,eVar37";
            s.linkTrackEvents="event37";
            s.tl(true,"e","right-popular-contentrec");
        });
    };

    RightOutbrainRecommendations.prototype.ready = function() {
        register.end('right-outbrain-recommendations');
    };

    return RightOutbrainRecommendations;
});
