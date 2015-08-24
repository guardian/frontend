import ko from 'knockout';
import Promise from 'Promise';
import _ from 'underscore';
import Collection from 'models/collections/collection';
import Presser from 'modules/presser';
import {CONST} from 'modules/vars';
import lastModified from 'utils/fetch-lastmodified';
import humanTime from 'utils/human-time';
import mediator from 'utils/mediator';
import * as sparklines from 'utils/sparklines';
import updateScrollables from 'utils/update-scrollables';
import ColumnWidget from 'widgets/column-widget';

export default class Front extends ColumnWidget {
    constructor(params, element) {
        super(params, element);

        var frontId = params.column.config();
        this.front = ko.observable(frontId);
        this.previousFront = frontId;
        this.frontAge = ko.observable();
        this.collections = ko.observableArray();
        this.mode = ko.observable(params.mode || 'draft');
        this.flattenGroups = ko.observable(params.mode === 'treats');
        this.maxArticlesInHistory = this.confirmSendingAlert() ? 20 : 5;
        this.controlsVisible = ko.observable(false);

        this.front.subscribe(this.onFrontChange.bind(this));
        this.mode.subscribe(this.onModeChange.bind(this));

        this.setFront = id => this.front(id);
        this.setModeLive = () => this.mode('live');
        this.setModeDraft = () => this.mode('draft');

        this.frontMode = ko.pureComputed(() => {
            var classes = [this.mode() + '-mode'];
            if (this.confirmSendingAlert()) {
                classes.push('attention');
            }
            return classes.join(' ');
        });

        this.previewUrl = ko.pureComputed(() => {
            var path = this.mode() === 'live' ? 'http://' + CONST.mainDomain : CONST.previewBase;

            return CONST.previewBase + '/responsive-viewer/' + path + '/' + this.front();
        });

        this.isControlsVisible = ko.observable(sparklines.isEnabled());
        this.controlsText = ko.pureComputed(() => {
            return 'Sparklines: ' + this.sparklinesOptions().hours + 'h';
        });

        this.ophanPerformances = ko.pureComputed(() => {
            return CONST.ophanFrontBase + encodeURIComponent('/' + this.front());
        });

        this.alertFrontIsStale = ko.observable();
        this.uiOpenElement = ko.observable();
        this.uiOpenArticle = ko.observable();

        this.allExpanded = ko.observable(true);

        this.listenOn(mediator, 'presser:lastupdate', (front, date) => {
            if (front === this.front()) {
                this.frontAge(humanTime(date));
                if (this.baseModel.state().defaults.env !== 'dev') {
                    var stale = _.some(this.collections(), collection => {
                        let update = new Date(collection.state.lastUpdated());
                        return _.isDate(update) ? update > date : false;
                    });
                    if (stale) {
                        mediator.emit('presser:stale', 'Sorry, the latest edit to the front \'' + front + '\' hasn\'t gone live.');
                    }
                }
            }
        });

        this.listenOn(mediator, 'ui:open', (element, article, front) => {
            if (front !== this) {
                return;
            }
            var openArticle = this.uiOpenArticle();
            if (openArticle && openArticle.group &&
                openArticle.group.parentType === 'Article' &&
                openArticle !== article) {
                openArticle.close();
            }
            this.uiOpenArticle(article);
            this.uiOpenElement(element);
        });

        this.listenOn(mediator, 'presser:live', this.pressLiveFront);
        this.listenOn(mediator, 'alert:dismiss', () => this.alertFrontIsStale(false));
        this.listenOn(mediator, 'collection:collapse', this.onCollectionCollapse);

        this.subscribeOn(this.column.config, newConfig => {
            if (newConfig !== this.front()) {
                this.front(newConfig);
            }
        });

        this.setIntervals = [];
        this.setTimeouts = [];
        this.refreshCollections(CONST.collectionsPollMs || 60000);
        this.refreshRelativeTimes(CONST.pubTimeRefreshMs || 60000);

        this.presser = new Presser();
        this.sparklinesOptions = ko.observable({
            hours: 1,
            interval: 10
        });
        this.load(frontId);
        sparklines.subscribe(this);
    }

    load(frontId) {
        if (frontId !== this.front()) {
            this.front(frontId);
        }
        var allCollections = this.baseModel.state().config.collections;

        this.allExpanded(true);
        this.collections(
            ((this.baseModel.frontsMap()[frontId] || {}).collections || [])
            .filter(id => allCollections[id] && !allCollections[id].uneditable)
            .map(id => new Collection(
                _.extend(
                    allCollections[id],
                    {
                        id: id,
                        alsoOn: _.reduce(this.baseModel.frontsList(), (alsoOn, front) => {
                            if (front.id !== frontId && (front.collections || []).indexOf(id) > -1) {
                                alsoOn.push(front.id);
                            }
                            return alsoOn;
                        }, []),
                        front: this
                    }
                )
            ))
        );

        this.getFrontAge({ alertIfStale: true });
        updateScrollables();
        this.loaded = Promise.all(
            this.collections().map(collection => collection.loaded)
        ).then(() => mediator.emit('front:loaded', this));
    }

    pressLiveFront() {
        if (this.front()) {
            this.presser.press('live', this.front());
        }
    }

    pressDraftFront() {
        if (this.front()) {
            this.presser.press('draft', this.front());
        }
    }

    setSparklines(hours, interval) {
        this.sparklinesOptions({
            hours: hours,
            interval: interval
        });
    }

    getFrontAge(opts) {
        // TODO Phantom Babel bug
        if (!opts) { opts = {}; }
        var alertIfStale = opts.alertIfStale;
        if (this.front()) {
            lastModified(this.front()).then(last => {
                this.frontAge(last.human);
                if (this.baseModel.state().defaults.env !== 'dev') {
                    this.alertFrontIsStale(alertIfStale && last.stale);
                }
            });
        } else {
            this.frontAge(undefined);
        }
    }

    toggleAll() {
        var state = !this.allExpanded();
        this.allExpanded(state);
        _.each(this.collections(), collection => collection.state.collapsed(!state));
    }

    onCollectionCollapse(collection, collectionState) {
        if (collection.front !== this) {
            return;
        }
        var differentState = _.find(this.collections(), collection => collection.state.collapsed() !== collectionState);
        if (!differentState) {
            this.allExpanded(!collectionState);
        }
    }

    refreshCollections(period) {
        var length = this.collections().length || 1;
        this.setIntervals.push(setInterval(() => {
            this.collections().forEach((list, index) => {
                this.setTimeouts.push(setTimeout(() => list.refresh(), index * period / length)); // stagger requests
            });
        }, period));
    }

    refreshRelativeTimes(period) {
        this.setIntervals.push(setInterval(() => {
            this.collections().forEach(list => list.refreshRelativeTimes());
            this.getFrontAge();
        }, period));
    }

    onFrontChange(front) {
        if (front === this.previousFront) {
            // This happens when the page is loaded and the select is bound
            return;
        }
        this.previousFront = front;
        this.column.setConfig(front);

        this.load(front);

        if (this.mode() === 'draft') {
            this.pressDraftFront();
        }
    }

    onModeChange() {
        _.each(this.collections(), function(collection) {
            collection.closeAllArticles();
            collection.populate();
        });

        if (this.mode() === 'draft') {
            this.pressDraftFront();
        }
    }

    elementHasFocus(meta) {
        return meta === this.uiOpenElement();
    }

    getCollectionList(list) {
        var sublist;
        if (this.mode() === 'treats') {
            sublist = list.treats;
        } else if (this.mode() === 'live') {
            sublist = list.live;
        } else {
            sublist = list.draft || list.live;
        }
        return sublist || [];
    }

    confirmSendingAlert() {
        return _.contains(CONST.askForConfirmation, this.front());
    }

    showIndicatorsEnabled() {
        return !this.confirmSendingAlert() && this.mode() !== 'treats';
    }

    slimEditor() {
        return _.contains(CONST.restrictedEditor, this.front());
    }

    newItemValidator(item) {
        if (this.mode() === 'treats' && item.meta.snapType() !== 'link') {
            // TODO uncomment when we want to restrict to snap link
            // return 'Sorry, you can only add links to treats.';
            return false;
        }
        if (this.confirmSendingAlert() && !isOnlyArticle(item, this)) {
            return 'You can only have one article in this collection.';
        }
    }

    dispose() {
        super.dispose();
        _.each(this.setIntervals, timeout => clearInterval(timeout));
        _.each(this.setTimeouts, timeout => clearTimeout(timeout));
        sparklines.unsubscribe(this);
        this.presser.dispose();
    }
}

function isOnlyArticle (item, front) {
    var only = true,
        containingCollection = _.find(front.collections(), function (collection) {
            return _.find(collection.groups, function (group) {
                return group === item.group;
            });
        });

    containingCollection.eachArticle(function (article) {
        only = only && article.id() === item.id();
    });
    return only;
}
