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
    'utils/is-valid-date',
    'modules/list-manager',
    'modules/droppable',
    'modules/authed-ajax',
    'modules/copied-article',
    'models/group',
    'models/collections/collection',
    'models/collections/article',
    'models/collections/latest-articles',
    'models/collections/new-items'
], function(
    pageConfig,
    ko,
    vars,
    fetchSettings,
    queryParams,
    ammendedQueryStr,
    updateScrollables,
    terminate,
    isValidDate,
    listManager,
    droppable,
    authedAjax,
    copiedArticle,
    Group,
    Collection,
    Article,
    LatestArticles,
    newItems
) {
    return function() {

        var model = vars.model = {};

        model.statusCapiErrors = ko.observable(false);
        model.statusPressFailure = ko.observable(false);
        model.clearStatuses = function() {
            model.statusCapiErrors(false);
            model.statusPressFailure(false);
        };

        model.switches = ko.observable();

        model.collections = ko.observableArray();

        model.fronts = ko.observableArray();

        model.front = ko.observable();

        model.headlineLength = ko.computed(function() {
            return _.contains(vars.CONST.restrictHeadlinesOn, model.front()) ? vars.CONST.restrictedHeadlineLength : vars.CONST.headlineLength;
        }, this);

        model.title = ko.computed(function() {
            return model.front() || (pageConfig.priority + ' fronts');
        }, this);

        model.liveMode = vars.state.liveMode;

        model.latestArticles = new LatestArticles({
            filterTypes: vars.CONST.filterTypes
        });

        model.clipboard = new Group({
            parentType: 'Clipboard',
            keepCopy:  true
        });

        model.createSnap = function() {
            var blank = new Article();

            blank.convertToSnap();
            model.clipboard.items.unshift(blank);
            _.defer(updateScrollables);
        };

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
            if (pageConfig.env === 'prod' && !model.liveMode()) {
                return vars.CONST.previewBase + '/responsive-viewer/' + model.front();
            } else {
                return vars.CONST.viewer +
                    '#env=' + pageConfig.env +
                    '&mode=' + (model.liveMode() ? 'live' : 'draft' ) +
                    '&url=' + model.front();
            }
        });

        model.detectPressFailureCount = 0;

        model.deferredDetectPressFailure = _.debounce(function () {
            var count;

            if (model.front()) {
                model.statusPressFailure(false);

                count = ++model.detectPressFailureCount;

                authedAjax.request({
                    url: '/front/lastmodified/' + model.front()
                })
                .always(function(resp) {
                    var lastPressed;

                    if (model.detectPressFailureCount === count && resp.status === 200) {
                        lastPressed = new Date(resp.responseText);

                        if (isValidDate(lastPressed)) {
                            model.statusPressFailure(
                                _.some(model.collections(), function(collection) {
                                    var l = new Date(collection.state.lastUpdated());
                                    return isValidDate(l) ? l > lastPressed : false;
                                })
                            );
                        }
                    }
                });
            }
        }, vars.CONST.detectPressFailureMs || 10000);

        model.pressLiveFront = function () {
            model.statusPressFailure(false);
            if (model.front()) {
                authedAjax.request({
                    url: '/press/live/' + model.front(),
                    method: 'post'
                })
                .always(function() {
                    model.deferredDetectPressFailure();
                });
            }
        };

        model.pressDraftFront = function () {
            if (model.front()) {
                authedAjax.request({
                    url: '/press/draft/' + model.front(),
                    method: 'post'
                });
            }
        };

        function getFront() {
            return queryParams().front;
        }

        function loadCollections(frontId) {
            model.collections(
                ((vars.state.config.fronts[frontId] || {}).collections || [])
                .filter(function(id) { return vars.state.config.collections[id]; })
                .filter(function(id) { return !vars.state.config.collections[id].uneditable; })
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
            }, period);
        });

        var startRelativeTimesPoller = _.once(function() {
            var period = vars.CONST.pubTimeRefreshMs || 60000;

            setInterval(function(){
                model.collections().forEach(function(list){
                    list.refreshRelativeTimes();
                });
            }, period);
        });

        this.init = function() {
            fetchSettings(function (config, switches) {
                var fronts;

                if (switches['facia-tool-disable']) {
                    terminate();
                    return;
                }
                model.switches(switches);

                vars.state.config = config;

                fronts = getFront() === 'testcard' ? ['testcard'] :
                   _.chain(config.fronts)
                    .map(function(front, path) {
                        return front.priority === vars.priority ? path : undefined;
                    })
                    .without(undefined)
                    .without('testcard')
                    .sortBy(function(path) { return path; })
                    .value();

                if (!_.isEqual(model.fronts(), fronts)) {
                   model.fronts(fronts);
                }
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

                    if (!model.liveMode()) {
                        model.pressDraftFront();
                    }
                });

                model.liveMode.subscribe(function() {
                    _.each(model.collections(), function(collection) {
                        collection.closeAllArticles();
                        collection.populate();
                    });

                    if (!model.liveMode()) {
                        model.pressDraftFront();
                    }
                });

                updateScrollables();
                window.onresize = updateScrollables;

                startCollectionsPoller();
                startSparksPoller();
                startRelativeTimesPoller();

                model.latestArticles.search();
                model.latestArticles.startPoller();
            });

            listManager.init(newItems);
            droppable.init();
            copiedArticle.flush();
        };
    };
});
