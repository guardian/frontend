/* global _: true */
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
    'models/latest-articles'
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
    LatestArticles
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
                config: ko.observable(),

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

        function terminate() {
            window.location.href = '/logout';
        }

        function terminateWithMessage(msg) {
            window.alert("Please contact support. Error: " + (msg || 'unknown'));
            terminate();
        }

        function fetchConfig() {
            return authedAjax.request({
                url: vars.CONST.apiBase + '/config'
            })
            .fail(function () {
                terminateWithMessage("the config was not available");
            })
            .done(function(resp) {
                if (!(_.isObject(resp.fronts) && _.isObject(resp.collections))) {
                    terminateWithMessage("the config is invalid.");
                }
                model.config(resp);
                model.fronts(_.keys(resp.fronts).sort());
            });
        }

        function fetchSwitches() {
            return authedAjax.request({
                url: vars.CONST.apiBase + '/switches'
            })
            .fail(function () {
                terminateWithMessage("the switches are unavailable");
            })
            .done(function(switches) {
                if (switches['facia-tool-disable']) {
                    terminate();
                }
                vars.state.switches = switches || {};
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
                ((model.config().fronts[getFront()] || {}).collections || [])
                .filter(function(id){ return !!model.config().collections[id]; })
                .map(function(id){
                    return new Collection(
                        _.extend(model.config().collections[id], {id: id})
                    );
                })
            );
            showFrontSpark();
        }

        function showFrontSpark() {
            model.frontSparkUrl(undefined);
            if (vars.state.switches['facia-tool-sparklines']) {
                model.frontSparkUrl(vars.CONST.sparksBaseFront + getFront());
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

        var startConfigAndSwitchesPoller = _.once(function() {
            setInterval(function(){
                fetchConfig();
                fetchSwitches();
            }, vars.CONST.configSwitchesPollMs || 60000);
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

            $.when(fetchConfig(), fetchSwitches())
            .done(function(){
                setfront();
                window.onpopstate = setfront;

                ko.applyBindings(model);

                updateLayout();
                window.onresize = updateLayout;

                startCollectionsPoller();
                startSparksPoller();
                startConfigAndSwitchesPoller();

                model.latestArticles.search();
                model.latestArticles.startPoller();
            });
        };

    };

});
