define([
    'knockout',
    'models/common',
    'models/droppable',
    'models/authedAjax',
    'models/collection',
    'models/article',
    'models/latestArticles',
    'models/contentApi',
    'models/ophanApi',
    'models/viewer',
], function(
    ko,
    common,
    droppable,
    authedAjax,
    Collection,
    Article,
    LatestArticles,
    contentApi,
    ophanApi,
    viewer
) {
    return function(selector) {

        var self = this,
            model = {
                collections:    ko.observableArray(),
                configs:        ko.observableArray(),
                config:         ko.observable(),

                latestArticles: new LatestArticles({
                    filterTypes: common.config.filterTypes
                }),

                viewer:         viewer,
                showViewer:     ko.observable(),

                clipboard: {
                    articles:  ko.observableArray(),
                    underDrag: ko.observable(),
                    keepCopy:  true
                },

                actions: {
                    flushClipboard: flushClipboard,
                    toggleViewer:   toggleViewer
                }
            };

        function fetchConfigsList() {
            return authedAjax({
                url: common.config.apiBase + '/config'
            }).then(function(resp) {
                if (!(_.isArray(resp) && resp.length > 0)) {
                    window.alert("Oops, no page definitions were found! Please contact support.");
                    return;
                }
                model.configs(resp.sort());
            });
        };

        function getConfig() {
            return common.util.queryParams().front;
        }

        function setConfig(id) {
            history.pushState({}, "", window.location.pathname + '?' + common.util.ammendedQueryStr('front', id));
            renderCollections();
        }

        function renderConfig() {
            model.config(getConfig());
        }

        function renderCollections() {
            model.collections.removeAll();

            if (!getConfig()) { return; }

            authedAjax({
                url: common.config.apiBase + '/config/' + getConfig()
            })
            .then(function(collections){
                model.collections(
                    (collections || []).map(function(collection){
                        return new Collection(collection);
                    })
                );
                //connectSortableLists();
            });
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

        function toggleViewer() {
            model.showViewer(!model.showViewer());
            if (model.showViewer()) {
                model.viewer.render();
            }
        }

        function flushClipboard() {
            model.clipboard.articles.removeAll();
        };

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

        model.config.subscribe(function(config) {
            var section = (config || '').split('/')[1]; // assumes ids are formed "edition/section/.."
            model.latestArticles.setSection(common.config.sectionSearches[section || 'default'] || section);
            setConfig(config);
        });

        this.init = function() {
            droppable.init();

            fetchConfigsList()
            .then(function(){
                renderConfig();
                window.onpopstate = renderConfig;

                ko.applyBindings(model);

                startPoller();

                model.latestArticles.search();
                model.latestArticles.startPoller();
            });
        };

    };

});
