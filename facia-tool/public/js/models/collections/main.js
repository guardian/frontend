/* global _: true */
define([
    'config',
    'knockout',
    'modules/vars',
    'utils/ammended-query-str',
    'utils/mediator',
    'utils/fetch-settings',
    'utils/global-listeners',
    'utils/layout-from-url',
    'utils/parse-query-params',
    'utils/update-scrollables',
    'utils/terminate',
    'modules/list-manager',
    'modules/droppable',
    'modules/copied-article',
    'models/collections/new-items',
    'models/layout',
    'models/widgets',
    'models/common-handlers'
], function(
    pageConfig,
    ko,
    vars,
    ammendedQueryStr,
    mediator,
    fetchSettings,
    globalListeners,
    layoutFromUrl,
    parseQueryParams,
    updateScrollables,
    terminate,
    listManager,
    droppable,
    copiedArticle,
    newItems,
    Layout,
    widgets,
    commonHandlers
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
            model.clearAlerts();
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
        mediator.on('front:disposed', function (front) {
            model.loadedFronts.remove(front);
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

                var frontInURL = parseQueryParams(window.location.search).front;
                fronts = frontInURL === 'testcard' ? ['testcard'] :
                    _.chain(config.fronts)
                    .map(function(front, path) {
                        return front.priority === vars.priority ? path : undefined;
                    })
                    .without(undefined)
                    .without('testcard')
                    .difference(vars.CONST.askForConfirmation)
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
                    model.layout.locationChange();
                };
                mediator.on('layout:change', function () {
                    if (!wasPopstate) {
                        var serializedLayout = layoutFromUrl.serialize(model.layout.serializable());
                        if (serializedLayout !== parseQueryParams(window.location.search).layout) {
                            history.pushState({}, '', window.location.pathname + '?' + ammendedQueryStr('layout', serializedLayout));
                        }
                    }
                    wasPopstate = false;
                });

                widgets.register();
                ko.applyBindings(model);
                $('.top-button-collections').show();

                updateScrollables();
                globalListeners.on('resize', updateScrollables);
            });

            listManager.init(newItems);
            droppable.init();
            copiedArticle.flush();
        };

    };
});
