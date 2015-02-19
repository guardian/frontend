define([
    'config',
    'knockout',
    'underscore',
    'models/collections/collection',
    'modules/vars',
    'utils/fetch-lastmodified',
    'utils/human-time',
    'utils/mediator',
    'utils/presser',
    'utils/update-scrollables'
], function (
    pageConfig,
    ko,
    _,
    Collection,
    vars,
    lastModified,
    humanTime,
    mediator,
    presser,
    updateScrollables
) {
    function Front (params) {
        var frontId, listeners = mediator.scope();

        this.column = params.column;
        frontId = this.column.initialState.config();
        this.front = ko.observable(frontId);
        this.previousFront = frontId;
        this.frontAge = ko.observable();
        this.position = params.position;
        this.collections = ko.observableArray();
        this.listeners = listeners;
        this.mode = ko.observable(params.mode || 'draft');
        this.flattenGroups = ko.observable(params.mode === 'treats');
        this.maxArticlesInHistory = this.confirmSendingAlert() ? 20 : 5;

        this.front.subscribe(this.onFrontChange.bind(this));
        this.mode.subscribe(this.onModeChange.bind(this));

        var model = this;
        this.setFront = function(id) {
            model.front(id);
        };
        this.setModeLive = function() {
            model.mode('live');
        };

        this.setModeDraft = function() {
            model.mode('draft');
        };

        this.frontMode = ko.pureComputed(function () {
            var classes = [this.mode() + '-mode'];
            if (this.confirmSendingAlert()) {
                classes.push('attention');
            }
            return classes.join(' ');
        }, this);

        this.previewUrl = ko.pureComputed(function () {
            var path = this.mode() === 'live' ? 'http://' + vars.CONST.mainDomain : vars.CONST.previewBase;

            return vars.CONST.previewBase + '/responsive-viewer/' + path + '/' + this.front();
        }, this);

        this.pressLiveFront = function () {
            if (this.front()) {
                presser.pressLive(this.front());
            }
        };
        this.pressDraftFront = function () {
            if (this.front()) {
                presser.pressDraft(this.front());
            }
        };

        this.ophanPerformances = ko.pureComputed(function () {
            return vars.CONST.ophanFrontBase + encodeURIComponent('/' + this.front());
        }, this);

        this.alertFrontIsStale = ko.observable();
        this.uiOpenElement = ko.observable();
        this.uiOpenArticle = ko.observable();

        this.allExpanded = ko.observable(true);

        listeners.on('presser:lastupdate', function (front, date) {
            if (front === model.front()) {
                model.frontAge(humanTime(date));
                if (pageConfig.env !== 'dev') {
                    var stale = _.some(model.collections(), function (collection) {
                        var l = new Date(collection.state.lastUpdated());
                        return _.isDate(l) ? l > date : false;
                    });
                    if (stale) {
                        mediator.emit('presser:stale', 'Sorry, the latest edit to the front \'' + front + '\' hasn\'t gone live.');
                    }
                }
            }
        });

        listeners.on('ui:open', function(element, article, front) {
            if (front !== model) {
                return;
            }
            if (model.uiOpenArticle() &&
                model.uiOpenArticle().group &&
                model.uiOpenArticle().group.parentType === 'Article' &&
                model.uiOpenArticle() !== article) {
                model.uiOpenArticle().close();
            }
            model.uiOpenArticle(article);
            model.uiOpenElement(element);
        });

        listeners.on('presser:live', function () {
            model.pressLiveFront();
        });

        listeners.on('alert:dismiss', function () {
            model.alertFrontIsStale(false);
        });

        listeners.on('column:change', function (column) {
            if (model.column === column) {
                model.front(column.initialState.config());
            }
        });

        listeners.on('collection:collapse', this.onCollectionCollapse.bind(this));

        this.setIntervals = [];
        this.setTimeouts = [];
        this.refreshCollections(vars.CONST.collectionsPollMs || 60000);
        this.refreshSparklines(vars.CONST.sparksRefreshMs || 60000);
        this.refreshRelativeTimes(vars.CONST.pubTimeRefreshMs || 60000);

        this.load(frontId);
        mediator.emit('front:loaded', this);
    }

    Front.prototype.load = function (frontId) {
        if (frontId !== this.front()) {
            this.front(frontId);
        }
        var model = this;

        this.allExpanded(true);
        this.collections(
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
                            }, []),
                            front: model
                        }
                    )
                );
            })
        );

        this.getFrontAge({alertIfStale: true});
        updateScrollables();
    };

    Front.prototype.getFrontAge = function (opts) {
        opts = opts || {};
        var model = this;

        if (model.front()) {
            lastModified(model.front()).done(function (last) {
                model.frontAge(last.human);
                if (pageConfig.env !== 'dev') {
                    model.alertFrontIsStale(opts.alertIfStale && last.stale);
                }
            });
        } else {
            model.frontAge(undefined);
        }
    };

    Front.prototype.toggleAll = function () {
        var state = !this.allExpanded();
        this.allExpanded(state);
        _.each(this.collections(), function (collection) {
            collection.state.collapsed(!state);
        });
    };

    Front.prototype.onCollectionCollapse = function (collection, collectionState) {
        if (collection.front !== this) {
            return;
        }
        var differentState = _.find(this.collections(), function (collection) {
            return collection.state.collapsed() !== collectionState;
        });
        if (!differentState) {
            this.allExpanded(!collectionState);
        }
    };

    Front.prototype.refreshCollections = function (period) {
        var length = this.collections().length || 1, model = this;
        this.setIntervals.push(setInterval(function () {
            model.collections().forEach(function (list, index) {
                model.setTimeouts.push(setTimeout(function() {
                    list.refresh();
                }, index * period / length)); // stagger requests
            });
        }, period));
    };
    Front.prototype.refreshSparklines = function (period) {
        var length = this.collections().length || 1, model = this;
        this.setIntervals.push(setInterval(function () {
            model.collections().forEach(function (list, index) {
                model.setTimeouts.push(setTimeout(function() {
                    list.refreshSparklines();
                }, index * period / length)); // stagger requests
            });
        }, period));
    };
    Front.prototype.refreshRelativeTimes = function (period) {
        var model = this;
        this.setIntervals.push(setInterval(function () {
            model.collections().forEach(function (list) {
                list.refreshRelativeTimes();
            });
            model.getFrontAge();
        }, period));
    };

    Front.prototype.onFrontChange = function (front) {
        if (front === this.previousFront) {
            // This happens when the page is loaded and the select is bound
            return;
        }
        this.previousFront = front;
        this.column.setConfig(front).saveChanges();

        this.load(front);

        if (this.mode() === 'draft') {
            this.pressDraftFront();
        }
    };

    Front.prototype.onModeChange = function () {
        _.each(this.collections(), function(collection) {
            collection.closeAllArticles();
            collection.populate();
        });

        if (this.mode() === 'draft') {
            this.pressDraftFront();
        }
    };

    Front.prototype.elementHasFocus = function (meta) {
        return meta === this.uiOpenElement();
    };

    Front.prototype.getCollectionList = function (list) {
        var sublist;
        if (this.mode() === 'treats') {
            sublist = list.treats;
        } else if (this.mode() === 'live') {
            sublist = list.live;
        } else {
            sublist = list.draft || list.live;
        }
        return sublist || [];
    };

    Front.prototype.confirmSendingAlert = function () {
        return _.contains(vars.CONST.askForConfirmation, this.front());
    };

    Front.prototype.showIndicatorsEnabled = function () {
        return !this.confirmSendingAlert() && this.mode() !== 'treats';
    };

    Front.prototype.slimEditor = function () {
        return _.contains(vars.CONST.restrictedEditor, this.front());
    };

    Front.prototype.newItemValidator = function (item) {
        if (this.mode() === 'treats' && item.meta.snapType() !== 'link') {
            // TODO uncomment when we want to restrict to snap link
            // return 'Sorry, you can only add links to treats.';
            return false;
        }
        if (this.confirmSendingAlert() && item.group && (item.group.items().length !== 1 || item.group.items()[0] !== item)) {
            return 'You can only have one article in this collection.';
        }
    };

    Front.prototype.dispose = function () {
        this.listeners.dispose();
        _.each(this.setIntervals, function (timeout) {
            clearInterval(timeout);
        });
        _.each(this.setTimeouts, function (timeout) {
            clearTimeout(timeout);
        });
        mediator.emit('front:disposed', this);
    };

    return Front;
});
