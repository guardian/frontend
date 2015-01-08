/* globals _ */
define([
    'config',
    'knockout',
    'models/collections/collection',
    'modules/vars',
    'utils/fetch-lastmodified',
    'utils/mediator',
    'utils/presser',
    'utils/update-scrollables'
], function (
    pageConfig,
    ko,
    Collection,
    vars,
    lastModified,
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
        this.liveMode = ko.observable(false);
        this.position = params.position;
        this.collections = ko.observableArray();
        this.listeners = listeners;

        this.front.subscribe(this.onFrontChange.bind(this));
        this.liveMode.subscribe(this.onModeChange.bind(this));

        var model = this;
        this.setFront = function(id) {
            model.front(id);
        };
        this.setModeLive = function() {
            model.liveMode(true);
        };

        this.setModeDraft = function() {
            model.liveMode(false);
        };
        this.previewUrl = ko.pureComputed(function () {
            var path = this.liveMode() ? 'http://' + vars.CONST.mainDomain : vars.CONST.previewBase;

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

        listeners.on('presser:lastupdate', function (front, date) {
            if (front === model.front()) {
                model.frontAge(date);
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

        if (!this.liveMode()) {
            this.pressDraftFront();
        }
    };

    Front.prototype.onModeChange = function () {
        _.each(this.collections(), function(collection) {
            collection.closeAllArticles();
            collection.populate();
        });

        if (!this.liveMode()) {
            this.pressDraftFront();
        }
    };

    Front.prototype.elementHasFocus = function (meta) {
        return meta === this.uiOpenElement();
    };

    Front.prototype.requiresConfirmation = function () {
        return _.contains(vars.CONST.askForConfirmation, this.front());
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
