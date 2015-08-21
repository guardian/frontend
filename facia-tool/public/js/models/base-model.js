import ko from 'knockout';
import _ from 'underscore';
import {CONST} from 'modules/vars';
import BaseClass from 'models/base-class';
import persistence from 'models/config/persistence';
import Layout from 'models/layout';
import * as widgets from 'models/widgets';
import copiedArticle from 'modules/copied-article';
import Droppable from 'modules/droppable';
import modalDialog from 'modules/modal-dialog';
import cloneWithKey from 'utils/clone-with-key';
import * as globalListeners from 'utils/global-listeners';
import priorityFromUrl from 'utils/priority-from-url';
import updateScrollables from 'utils/update-scrollables';

var droppableSym = Symbol();

export default class BaseModel extends BaseClass {
    constructor(enabledWidgets, extensions, router, res) {
        super();

        var layout = new Layout(router, enabledWidgets);

        this.title = ko.observable('fronts');
        this.layout = layout;
        this.extensions = ko.observableArray(extensions || []);
        this.modalDialog = modalDialog;
        this.state = ko.observable();
        this.frontsList = ko.observableArray();
        this.frontsMap = ko.observable();
        this.switches = ko.observable(res.switches);
        this.pending = ko.observable(true);
        this.priority = priorityFromUrl(router.location.pathname);
        this.fullPriority = this.priority || CONST.defaultPriority;
        this.liveFrontend = CONST.environmentUrlBase[res.defaults.env] || ('http://' + CONST.mainDomain + '/');
        this.identity = {
            email: res.defaults.email,
            avatarUrl: res.defaults.avatarUrl
        };

        this.update(res);

        this[droppableSym] = new Droppable();
        copiedArticle.flush();
        widgets.register();

        this.listenOn(persistence, 'update:before', () => this.pending(true));
        this.listenOn(persistence, 'update:after', () => {
            this.emit('config:needs:update', (res) => {
                this.update(res);
                this.pending(false);
            });
        });

        this.listenOn(globalListeners, 'resize', updateScrollables);

        this.loaded = waitFor(this, layout, extensions).then(() => {
            this.pending(false);
            updateScrollables();
            return this;
        });
    }

    chooseLayout() {
        this.layout.toggleConfigVisible();
    }

    saveLayout() {
        this.layout.save();
    }

    cancelLayout() {
        this.layout.cancel();
    }

    update(res) {
        var frontsList = [], frontsMap = {};

        for (let front in res.config.fronts) {
            let frontConfig = res.config.fronts[front];
            if (frontConfig.priority === this.priority) {
                let frontsConfig = cloneWithKey(frontConfig, front);
                frontsList.push(frontsConfig);
                frontsMap[front] = frontConfig;
            }
        }
        this.frontsList(_.sortBy(frontsList, 'id'));
        this.frontsMap(frontsMap);

        if (!_.isEqual(this.switches(), res.switches)) {
            this.switches(res.switches);
        }
        // State must be changed last
        this.state(res);
    }

    dispose() {
        super.dispose();
        ko.cleanNode(window.document.body);
        this[droppableSym].dispose();
        this.layout.dispose();
    }
}

function waitFor (model, layout, extensions) {
    var extensionsLoadedInDom,
        extensionsClassesLoaded,
        extensionsLoadedPromise = new Promise(resolve => {
            extensionsLoadedInDom = _.after(extensions.length, resolve);
        }),
        extensionsClassesPromise = new Promise(resolve => {
            extensionsClassesLoaded = _.after(extensions.length, resolve);
        });
    model.registerExtension = () => {
        extensionsLoadedInDom();
    };
    model.extensionCreated = () => {
        extensionsClassesLoaded();
    };
    return layout.loaded.then(() => {
        if (extensions.length) {
            return extensionsLoadedPromise.then(() => extensionsClassesPromise);
        }
    });
}
