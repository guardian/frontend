define([
    'config',
    'knockout',
    'modules/vars',
    'utils/query-params',
    'utils/ammended-query-str',
    'bindings/droppable',
    'modules/authed-ajax',
    'models/collection',
    'models/group',
    'models/article',
    'models/latest-articles',
    'lodash/objects/isObject',
    'lodash/objects/keys',
    'lodash/objects/assign',
    'lodash/functions/once',
    'lodash/objects/isArray',
    'lodash/collections/max',
    'lodash/collections/pluck',
    'lodash/collections/forEach',
    'lodash/collections/toArray'
], function(
    config,
    ko,
    vars,
    queryParams,
    ammendedQueryStr,
    droppable,
    authedAjax,
    Collection,
    Group,
    Article,
    LatestArticles,
    isObject,
    keys,
    assign,
    once,
    isArray,
    max,
    pluck,
    forEach,
    toArray
) {
    var prefKeyDefaultMode = 'gu.frontsTool.defaultToLiveMode';

    return function() {

        function updateLayout() {
            var height = $(window).height();
            $('.scrollable').each(function() {
                $(this).height(Math.max(100, height - $(this).offset().top) - 2);
            });
        }

        var self = this,
            model = {
                config: null,

                collections: ko.observableArray(),
                fronts: ko.observableArray(),
                front:  ko.observable(),

                latestArticles: new LatestArticles({
                    filterTypes: vars.CONST.filterTypes
                }),

                clipboard: new Group({
                    parentType: 'Clipboard',
                    reflow: updateLayout,
                    keepCopy:  true
                }),

                liveMode: vars.state.liveMode
            };

        model.setModeLive = function() {
            model.liveMode(true);
        };

        model.setModeDraft = function() {
            model.liveMode(false);
        };

        model.previewUrl = ko.computed(function() {
            return vars.CONST.viewer + '#env=' + config.env + '&url=' + model.front() + encodeURIComponent('?view=mobile');
        });

        function fetchFronts() {
            return authedAjax.request({
                url: vars.CONST.apiBase + '/config'
            })
            .fail(function () {
                window.alert("Oops, the fronts configuration was not available! Please contact support.");
                return;
            })
            .done(function(resp) {

                if (!(isObject(resp.fronts) && isObject(resp.collections))) {
                    window.alert("Oops, the fronts configuration is invalid! Please contact support.");
                    return;
                }

                model.config = resp;
                model.fronts(keys(resp.fronts).sort());
            });
        }

        function getFront() {
            return queryParams().front;
        }

        function setfront() {
            model.front(getFront());
        }

        function renderFront(id) {
            history.pushState({}, "", window.location.pathname + '?' + ammendedQueryStr('front', id));
            model.collections(
                ((model.config.fronts[getFront()] || {}).collections || [])
                .filter(function(id){ return !!model.config.collections[id]; })
                .map(function(id){
                    return new Collection(
                        assign(model.config.collections[id], {id: id})
                    );
                })
            );
        }

        var startPoller = once(function() {
            var period = vars.CONST.collectionsPollMs || 60000;

            setInterval(function(){
                model.collections().forEach(function(list, index){
                    setTimeout(function(){
                        list.refresh();
                    }, index * period / (model.collections().length + 1)); // stagger requests
                });
            }, period);
        });

        ko.bindingHandlers.sparkline = {
            update: function (element, valueAccessor, allBindingsAccessor, model) {
                var graphs = ko.utils.unwrapObservable(valueAccessor()),
                    maxValue;

                if (!isArray(graphs)) { return; }
                maxValue = max(pluck(graphs, 'max'));
                if (!maxValue) { return; }

                forEach(toArray(graphs).reverse(), function(graph, i){
                    $(element).sparkline(graph.data, {
                        chartRangeMax: maxValue,
                        defaultPixelsPerValue: graph.data.length < 50 ? graph.data.length < 30 ? 3 : 2 : 1,
                        height: Math.round(Math.max(5, Math.min(30, max))),
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
            renderFront(front);
        });

        model.liveMode.subscribe(function() {
            forEach(model.collections(), function(collection) {
                collection.populateLists();
            });
        });

        this.init = function() {
            droppable.init();

            fetchFronts()
            .done(function(){
                setfront();
                window.onpopstate = setfront;

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
