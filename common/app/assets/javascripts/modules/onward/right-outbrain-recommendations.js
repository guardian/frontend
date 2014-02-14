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
         console.log("+++ " + config.pageId);
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
        var start = console.time('outbrain');
        var that = this;

        console.log( "Fetch Mother! -  " + this.pageId + "H: " + window.location.hostname + " Start: " + start );

        require(['js!outbrain'], function() {

            var end =  console.timeEnd('outbrain js');
            console.log("++ End " + end);

            var request_data = {
                permalink: "http://www.theguardian.com/" + this.pageId,
                widgetId: "APP_2"
            };
            console.log("++ " + request_data);


            var handle_recommendations = function(json)
            {
                console.log("Received JSON: " + JSON.stringify(json) );
                that.data = json.doc.slice(0,that.config.maxTrails);
                console.log("=============================== " + that.config.maxTrails );
                that.render(qwery('.js-right-hand-component'));
            }

            OBR.extern.callRecs(request_data, handle_recommendations);
        });
    };

    RightOutbrainRecommendations.prototype.prerender  = function() {
        console.log("++ Pre-rendering " + this.data);
        this.setState(this.config.type);
        this.elem.setAttribute('data-link-name', 'Right hand most popular');
        console.log("++ El stupido uno");
        var container = this.getElem(this.classes.items);
        console.log("++ El stupido duo");

        this.data.forEach(function(item, index) {
            console.log("Item: " + item.url);
            new RecommendedItem(item, index).render(container);
        });
        console.log("++ You say goodbye!");
        Images.upgrade(container);
    };

    return RightOutbrainRecommendations;
});
