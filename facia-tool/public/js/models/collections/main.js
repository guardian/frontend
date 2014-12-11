/* global _: true */
define([
    'config',
    'knockout',
    'modules/vars',
    'utils/mediator',
    'utils/fetch-settings',
    'utils/fronts-from-url',
    'utils/update-scrollables',
    'utils/terminate',
    'modules/list-manager',
    'modules/droppable',
    'modules/copied-article',
    'models/collections/new-items',
    'models/layout',
    'models/widgets'
], function(
    pageConfig,
    ko,
    vars,
    mediator,
    fetchSettings,
    getFrontsFromURL,
    updateScrollables,
    terminate,
    listManager,
    droppable,
    copiedArticle,
    newItems,
    Layout,
    widgets
) {
    return function() {

        var model = vars.model = {
            layout: new Layout(),
            alert: ko.observable(),
            switches: ko.observable(),
            fronts: ko.observableArray(),
            loadedFronts: ko.observableArray()
        };

        model.chooseLayout = function () {
            this.layout.toggleConfigVisible();
        };
        model.saveLayout = function () {
            this.layout.save();
        };
        model.cancelLayout = function () {
            this.layout.cancel();
        };

        model.pressLiveFront = function () {
            mediator.emit('presser:live');
        };

        model.clearAlerts = function() {
            model.alert(false);
            mediator.emit('alert:dismiss');
        };

        model.title = ko.computed(function() {
            return pageConfig.priority + ' fronts';
        }, this);

        mediator.on('presser:stale', function (message) {
            model.alert(message);
        });

        mediator.on('front:loaded', function (front) {
            var currentlyLoaded = model.loadedFronts();
            currentlyLoaded[front.position()] = front;
            model.loadedFronts(currentlyLoaded);
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

                var frontsInURL = getFrontsFromURL();
                fronts = _.contains(frontsInURL, 'testcard') ? ['testcard'] :
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
                window.onpopstate = function() {
                    wasPopstate = true;
                    var newFronts = getFrontsFromURL();
                    mediator.emit('front:change', newFronts);
                };
                mediator.on('front:select', function () {
                    if (!wasPopstate) {
                        var queryStr = _.chain(model.loadedFronts())
                            .filter(function (column) { return !!column; })
                            .map(function (front) {
                                return 'front=' + (front.front() || '');
                            })
                            .value()
                            .join('&');
                        history.pushState({}, '', window.location.pathname + '?' + queryStr);
                    }
                    wasPopstate = false;
                });

                widgets.register();
                ko.applyBindings(model);
                $('.top-button-collections').show();

                updateScrollables();
                window.onresize = updateScrollables;
            });

            listManager.init(newItems);
            droppable.init();
            copiedArticle.flush();
        };

    };
});
