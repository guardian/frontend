/* global _: true */
define([
    'config',
    'knockout',
    'modules/vars',
    'utils/mediator',
    'utils/fetch-settings',
    'utils/query-params',
    'utils/ammended-query-str',
    'utils/update-scrollables',
    'utils/terminate',
    'utils/human-time',
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
    mediator,
    fetchSettings,
    queryParams,
    ammendedQueryStr,
    updateScrollables,
    terminate,
    humanTime,
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

        var model = vars.model = {},
            detectPressFailureCount = 0;

        model.alert = ko.observable();
        model.alertFrontIsStale = ko.observable();
        model.clearAlerts = function() {
            model.alert(false);
            model.alertFrontIsStale(false);
        };

        model.switches = ko.observable();

        model.collections = ko.observableArray();

        model.fronts = ko.observableArray();

        model.front = ko.observable();

        model.frontAge = ko.observable();

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

        model.deferredDetectPressFailure = _.debounce(function () {
            var count;

            if (model.front()) {
                count = ++detectPressFailureCount;

                authedAjax.request({
                    url: '/front/lastmodified/' + model.front()
                })
                .always(function(resp) {
                    var lastPressed;

                    if (detectPressFailureCount === count && resp.status === 200) {
                        lastPressed = new Date(resp.responseText);

                        if (_.isDate(lastPressed)) {
                            model.frontAge(humanTime(resp.responseText));
                            if (pageConfig.env !== 'dev') {
                                model.alert(
                                    _.some(model.collections(), function (collection) {
                                        var l = new Date(collection.state.lastUpdated());
                                        return _.isDate(l) ? l > lastPressed : false;
                                    }) ? 'Sorry, the latest edit to this front hasn\'t gone live.' : false
                                );
                            }
                        }
                    }
                });
            }
        }, vars.CONST.detectPressFailureMs || 10000);

        model.pressLiveFront = function () {
            model.clearAlerts();
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

        model.uiOpenElement = ko.observable();

        model.uiOpenArticle = ko.observable();

        function getFront() {
            return queryParams().front;
        }

        function loadFront(frontId) {
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

            getFrontAge({alertIfStale: true});
        }

        function getFrontAge(opts) {
            opts = opts || {};

            if (model.front()) {
                authedAjax.request({
                    url: '/front/lastmodified/' + model.front()
                })
                .always(function(resp) {
                    if (resp.status === 200 && resp.responseText) {
                        model.frontAge(humanTime(resp.responseText));
                        if (pageConfig.env !== 'dev') {
                            model.alertFrontIsStale(opts.alertIfStale && new Date() - new Date(resp.responseText) > getFrontAgeAlertMs());
                        }
                    } else {
                        model.frontAge(undefined);
                    }
                });
            } else {
                model.frontAge(undefined);
            }
        }

        function getFrontAgeAlertMs() {
            return vars.CONST.frontAgeAlertMs[
                vars.CONST.editions.indexOf(model.front()) > -1 ? 'front' : vars.priority || 'editorial'
            ];
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
                getFrontAge();
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
                loadFront(getFront());

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
                    loadFront(front);

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

                var updateClipboardScrollable = function (what) {
                    var onClipboard = true;
                    if (what && what.targetGroup) {
                        onClipboard = what.targetGroup.parentType === 'Clipboard';
                    }
                    if (onClipboard) {
                        _.defer(updateScrollables);
                    }
                };

                mediator.on('ui:open', function(element, article) {
                    if (model.uiOpenArticle() &&
                        model.uiOpenArticle().group &&
                        model.uiOpenArticle().group.parentType === 'Article' &&
                        model.uiOpenArticle() !== article) {
                        model.uiOpenArticle().close();
                    }
                    model.uiOpenArticle(article);
                    model.uiOpenElement(element);

                    updateClipboardScrollable(article ? {
                        targetGroup: article.group
                    } : null);
                });

                mediator.on('collection:updates', updateClipboardScrollable);
                mediator.on('ui:close', updateClipboardScrollable);
                mediator.on('ui:omit', updateClipboardScrollable);
                mediator.on('ui:resize', updateClipboardScrollable);
            });

            listManager.init(newItems);
            droppable.init();
            copiedArticle.flush();
        };

    };
});
