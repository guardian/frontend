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

        function fetchFronts() {
            return authedAjax.request({
                url: vars.CONST.apiBase + '/config'
            })
            .fail(function () {
                window.alert("Oops, the fronts configuration was not available! Please contact support.");
                return;
            })
            .done(function(resp) {

                if (!(_.isObject(resp.fronts) && _.isObject(resp.collections))) {
                    window.alert("Oops, the fronts configuration is invalid! Please contact support.");
                    return;
                }

                model.config = resp;
                model.fronts(_.keys(resp.fronts).sort());
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
                        _.extend(model.config.collections[id], {id: id})
                    );
                })
            );
            model.frontSparkUrl(vars.CONST.sparksBaseFront + getFront());
        }

        var startPoller = _.once(function() {
            var period = vars.CONST.collectionsPollMs || 60000;

            setInterval(function(){
                model.collections().forEach(function(list, index){
                    setTimeout(function(){
                        list.refresh();
                    }, index * period / (model.collections().length || 1)); // stagger requests
                });
            }, period);
        });

        var startSparksRefresher = _.once(function() {
            var period = vars.CONST.sparksRefreshMs || 60000;

            setInterval(function(){
                model.collections().forEach(function(list, index){
                    setTimeout(function(){
                        list.refreshSparklines();
                    }, index * period / (model.collections().length || 1)); // stagger requests
                });

                model.frontSparkUrl(undefined);
                model.frontSparkUrl(vars.CONST.sparksBaseFront + getFront());
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

            fetchFronts()
            .done(function(){
                setfront();
                window.onpopstate = setfront;

                ko.applyBindings(model);

                updateLayout();
                window.onresize = updateLayout;

                startPoller();
                startSparksRefresher();

                model.latestArticles.search();
                model.latestArticles.startPoller();
            });
        };

    };

});
