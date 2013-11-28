define([
    'Config',
    'knockout',
    'models/common',
    'models/droppable',
    'models/authedAjax',
    'models/collection',
    'models/article',
    'models/latestArticles',
    'models/contentApi',
    'models/ophanApi'
], function(
    Config,
    ko,
    common,
    droppable,
    authedAjax,
    Collection,
    Article,
    LatestArticles,
    contentApi,
    ophanApi
) {
    var prefKeyDefaultMode = 'gu.frontsTool.defaultToLiveMode';

    return function(selector) {

        var self = this,
            model = {
                collections: ko.observableArray(),
                fronts: ko.observableArray(),
                front:  ko.observable(),

                latestArticles: new LatestArticles({
                    filterTypes: common.config.filterTypes
                }),

                clipboard: {
                    articles: ko.observableArray(),
                    underDrag: ko.observable(),
                    callback: updateLayout,
                    dropItem: function(item) {
                        model.clipboard.articles.remove(item);
                        updateLayout();
                    },
                    keepCopy:  true
                },

                liveMode: common.state.liveMode
            };

        model.setModeLive = function() {
            model.liveMode(true);
        }

        model.setModeDraft = function() {
            model.liveMode(false);
        }

        model.previewUrl = ko.computed(function() {
            return common.config.viewer[Config.env] + '/responsive-viewer#env=' + Config.env + '&url=' + model.front() + encodeURIComponent('?view=mobile');
        })

        function fetchFronts() {
            return authedAjax.request({
                url: common.config.apiBase + '/config'
            }).then(function(resp) {

                if (!(_.isObject(resp.fronts) && _.isObject(resp.collections))) {
                    window.alert("Oops, no page definitions were found! Please contact support.");
                    return;
                }

                common.state.fronts = resp.fronts;
                common.state.collections = resp.collections;

                model.fronts(_.keys(resp.fronts).sort());;
            });
        };

        function getFront() {
            return common.util.queryParams().front;
        }

        function setFront(id) {
            history.pushState({}, "", window.location.pathname + '?' + common.util.ammendedQueryStr('front', id));
            renderCollections();
        }

        function renderFront() {
            model.front(getFront());
        }

        function renderCollections() {
            var ids;

            ids = (common.state.fronts[getFront()] || {}).collections;

            if (!_.isArray(ids)) { return; }

            model.collections.removeAll();
            model.collections(
                ids.map(function(id){
                    var collection = common.state.collections[id];
                    if (collection) {
                        collection.id = id;
                        return new Collection(collection);
                    }
                })
            );
        }

        function startPoller() {
            var period = common.config.collectionsPollMs || 60000;

            setInterval(function(){
                model.collections().forEach(function(list, index){
                    setTimeout(function(){
                        list.refresh();
                    }, index * period / (model.collections().length + 1)); // stagger requests
                });
            }, period);

            startPoller = function() {}; // make idempotent
        }

        ko.bindingHandlers.sparkline = {
            update: function (element, valueAccessor, allBindingsAccessor, model) {
                var graphs = ko.utils.unwrapObservable(valueAccessor()),
                    max;

                if (!_.isArray(graphs)) { return; };
                max = _.max(_.pluck(graphs, 'max'));
                if (!max) { return; };

                _.each(_.toArray(graphs).reverse(), function(graph, i){
                    $(element).sparkline(graph.data, {
                        chartRangeMax: max,
                        defaultPixelsPerValue: graph.data.length < 50 ? graph.data.length < 30 ? 3 : 2 : 1,
                        height: Math.round(Math.max(10, Math.min(40, max))),
                        lineColor: '#' + graph.color,
                        spotColor: false,
                        minSpotColor: false,
                        maxSpotColor: false,
                        lineWidth: graph.activity || 1,
                        fillColor: false,
                        composite: i > 0
                    });
                });
            }
        };

        model.front.subscribe(function(front) {
            setFront(front);
        });

        model.liveMode.subscribe(function() {
            _.each(model.collections(), function(collection) {
                collection.populateLists();
            });
        });
        
        function updateLayout() {
            var height = $(window).height();
            $('.scrollable').each(function() {
                $(this).height(Math.max(100, height - $(this).offset().top) - 2)
            });
        };

        this.init = function() {
            droppable.init();

            fetchFronts()
            .then(function(){
                renderFront();
                window.onpopstate = renderFront;

                ko.applyBindings(model);

                updateLayout();
                window.onresize = updateLayout;

                startPoller();

                model.latestArticles.search();
                model.latestArticles.startPoller();
            });
        };

    };

});
