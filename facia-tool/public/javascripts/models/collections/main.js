/* global _: true */
define([
    'config',
    'knockout',
    'modules/vars',
    'utils/fetch-settings',
    'utils/query-params',
    'utils/ammended-query-str',
    'utils/update-scrollables',
    'utils/terminate',
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
    terminate,
    authedAjax,
    Group,
    droppable,
    Collection,
    Article,
    LatestArticles
) {

    return function() {

        var model = vars.model = {};

        model.collections = ko.observableArray();

        model.fronts = ko.observableArray();

        model.front = ko.observable();

        model.liveMode = vars.state.liveMode;

        model.frontSparkUrl = ko.observable();

        model.latestArticles = new LatestArticles({
            filterTypes: vars.CONST.filterTypes
        });

        model.clipboard = new Group({
            parentType: 'Clipboard',
            reflow: updateScrollables,
            keepCopy:  true
        });

        model.setFront = function(id) {
            model.front(id);
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

        function loadCollections(frontId) {
            model.collections(
                ((vars.state.config.fronts[frontId] || {}).collections || [])
                .filter(function(id){ return vars.state.config.collections[id]; })
                .map(function(id){
                    return new Collection(
                        _.extend(
                            vars.state.config.collections[id],
                            {
                                id: id,
                                alsoOn: _.reduce(vars.state.config.fronts, function(alsoOn, front, fid) {
                                    if (fid !== frontId && front.collections.indexOf(id) > -1) {
                                        alsoOn.push(fid);
                                    }
                                    return alsoOn;
                                }, [])
                            }
                        )
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

        this.init = function() {
            droppable.init();

            fetchSettings(function (config, switches) {
                if (switches['facia-tool-disable']) {
                    terminate();
                    return;
                }
                vars.state.switches = switches;
                vars.state.config = config;
                model.fronts(
                    getFront() === 'testcard' ? ['testcard'] :
                       _.chain(_.keys(config.fronts))
                        .without('testcard')
                        .sortBy(function(id) { return id; })
                        .value()
                );
            }, vars.CONST.configSettingsPollMs, true)
            .done(function() {
                var wasPopstate = false;

                model.setFront(getFront());
                loadCollections(getFront());

                window.onpopstate = function() {
                    wasPopstate = true;
                    model.setFront(getFront());
                };

                ko.applyBindings(model);

                model.front.subscribe(function(front) {
                    if (!wasPopstate) {
                        history.pushState({}, '', window.location.pathname + '?' + ammendedQueryStr('front', front));
                    }
                    wasPopstate = false;
                    loadCollections(front);
                });

                model.liveMode.subscribe(function() {
                    _.each(model.collections(), function(collection) {
                        collection.closeAllArticles();
                        collection.populate();
                    });
                });

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
