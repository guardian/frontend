/* global _: true */
define([
    'config',
    'knockout',
    'modules/vars',
    'utils/fetch-settings',
    'utils/query-params',
    'utils/ammended-query-str',
    'utils/update-scrollables',
    'modules/authed-ajax',
    'models/group',
    'models/collections/droppable',
    'models/collections/collection',
    'models/collections/article',
    'models/collections/latest-articles'
], function(
    config,
    ko,
    vars,
    fetchSettings,
    queryParams,
    ammendedQueryStr,
    updateScrollables,
    authedAjax,
    Group,
    droppable,
    Collection,
    Article,
    LatestArticles
) {
    var prefKeyDefaultMode = 'gu.frontsTool.defaultToLiveMode';

    return function() {

        var model = {
                collections: ko.observableArray(),
                fronts: ko.observableArray(),
                front:  ko.observable(),

                latestArticles: new LatestArticles({
                    filterTypes: vars.CONST.filterTypes
                }),

                clipboard: new Group({
                    parentType: 'Clipboard',
                    reflow: updateScrollables,
                    keepCopy:  true
                }),

                liveMode: vars.state.liveMode,

                frontSparkUrl: ko.observable()
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

        function getFront() {
            return queryParams().front;
        }

        function setfront() {
            model.front(getFront());
        }

        function renderFront(id) {
            history.pushState({}, "", window.location.pathname + '?' + ammendedQueryStr('front', id));
            model.collections(
                ((vars.state.config.fronts[getFront()] || {}).collections || [])
                .filter(function(id){ return !!vars.state.config.collections[id]; })
                .map(function(id){
                    return new Collection(
                        _.extend(vars.state.config.collections[id], {id: id})
                    );
                })
            );
            showFrontSpark();
        }

        function showFrontSpark() {
            model.frontSparkUrl(undefined);
            if (vars.state.switches['facia-tool-sparklines']) {
                model.frontSparkUrl(vars.sparksBaseFront + getFront());
            }
        }

        var startCollectionsPoller = _.once(function() {
            var period = vars.CONST.collectionsPollMs || 60000;

            setInterval(function(){
                model.collections().forEach(function(list, index){
                    setTimeout(function(){
                        list.refresh();
                    }, index * period / (model.collections().length || 1)); // stagger requests
                });
            }, period);
        });

        var startSparksPoller = _.once(function() {
            var period = vars.CONST.sparksRefreshMs || 60000;

            setInterval(function(){
                model.collections().forEach(function(list, index){
                    setTimeout(function(){
                        list.refreshSparklines();
                    }, index * period / (model.collections().length || 1)); // stagger requests
                });
                showFrontSpark();
            }, period);
        });

        model.front.subscribe(function(front) {
            renderFront(front);
        });

        model.liveMode.subscribe(function() {
            _.each(model.collections(), function(collection) {
                collection.closeAllArticles();
                collection.populate();
            });
        });

        this.init = function() {
            droppable.init();

            fetchSettings(function (config, switches) {
                vars.state.config = config || {};
                vars.state.switches = switches || {};
                model.fronts(_.keys(config.fronts));
            }, vars.CONST.configSettingsPollMs, true)
            .done(function() {
                setfront();
                window.onpopstate = setfront;

                ko.applyBindings(model);

                updateScrollables();
                window.onresize = updateScrollables;

                startCollectionsPoller();
                startSparksPoller();

                model.latestArticles.search();
                model.latestArticles.startPoller();
            });
        };

    };

});
