import _ from 'underscore';
import $ from 'jquery';
import ko from 'knockout';
import 'models/common-handlers';
import * as vars from 'modules/vars';
import ammendedQueryStr from 'utils/ammended-query-str';
import mediator from 'utils/mediator';
import * as globalListeners from 'utils/global-listeners';
import * as layoutFromUrl from 'utils/layout-from-url';
import * as sparklines from 'utils/sparklines';
import parseQueryParams from 'utils/parse-query-params';
import updateScrollables from 'utils/update-scrollables';
import listManager from 'modules/list-manager';
import droppable from 'modules/droppable';
import copiedArticle from 'modules/copied-article';
import modalDialog from 'modules/modal-dialog';
import newItems from 'models/collections/new-items';
import Layout from 'models/layout';
import * as widgets from 'models/widgets';

export default function() {

    var model = {
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
    vars.setModel(model);

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

    this.update = function (res) {
        var fronts;

        var frontInURL = parseQueryParams().front;
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

    this.init = function (bootstrap, res) {
        listManager.init(newItems);
        droppable.init();
        copiedArticle.flush();

        this.update(res);

        model.layout = new Layout();

        var wasPopstate = false;
        window.onpopstate = function() {
            wasPopstate = true;
            model.layout.locationChange();
        };
        mediator.on('layout:change', function () {
            if (!wasPopstate) {
                var serializedLayout = layoutFromUrl.serialize(model.layout.serializable());
                if (serializedLayout !== parseQueryParams().layout) {
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
}
