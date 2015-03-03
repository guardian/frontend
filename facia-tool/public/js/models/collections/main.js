define([
    'knockout',
    'underscore',
    'jquery',
    'modules/vars',
    'utils/ammended-query-str',
    'utils/mediator',
    'utils/global-listeners',
    'utils/layout-from-url',
    'utils/sparklines',
    'utils/parse-query-params',
    'utils/update-scrollables',
    'modules/list-manager',
    'modules/droppable',
    'modules/copied-article',
    'modules/modal-dialog',
    'models/common-handlers',
    'models/collections/new-items',
    'models/layout',
    'models/widgets'
], function(
    ko,
    _,
    $,
    vars,
    ammendedQueryStr,
    mediator,
    globalListeners,
    layoutFromUrl,
    sparklines,
    parseQueryParams,
    updateScrollables,
    listManager,
    droppable,
    copiedArticle,
    modalDialog,
    commonHandlers,
    newItems,
    Layout,
    widgets
) {
    return function() {

        var model = vars.model = {
            layout: null,
            alert: ko.observable(),
            modalDialog: modalDialog,
            switches: ko.observable(),
            fronts: ko.observableArray(),
            loadedFronts: ko.observableArray(),
            isPasteActive: ko.observable(false),
            isSparklinesEnabled: ko.pureComputed(function () {
                return sparklines.isEnabled();
            })
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

        model.title = ko.observable('fronts');

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
        mediator.on('copied-article:change', function (hasArticle) {
            model.isPasteActive(hasArticle);
        });

        this.init = function (bootstrap, res) {
            listManager.init(newItems);
            droppable.init();
            copiedArticle.flush();

            this.update(res);

            model.layout = new Layout();
            model.title((vars.priority || 'editorial') + ' fronts');

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
        };

        this.update = function (res) {
            var fronts;

            model.switches(res.switches);

            vars.state.config = res.config;

            var frontInURL = parseQueryParams(window.location.search).front;
            fronts = frontInURL === 'testcard' ? ['testcard'] :
                _.chain(res.config.fronts)
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
        };

    };
});
