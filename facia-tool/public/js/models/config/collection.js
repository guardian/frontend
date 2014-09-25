/* global _: true */
define([
    'knockout',
    'config',
    'models/config/persistence',
    'modules/vars',
    'modules/content-api',
    'utils/strip-empty-query-params',
    'utils/as-observable-props',
    'utils/populate-observables',
    'utils/identity'
], function(
    ko,
    pageConfig,
    persistence,
    vars,
    contentApi,
    stripEmptyQueryParams,
    asObservableProps,
    populateObservables,
    identity
) {
    var checkCount = 0;

    function Collection(opts) {
        opts = opts || {};

        this.id = opts.id;

        this.parents = ko.observableArray();

        this.capiResults = ko.observableArray();

        this.meta = asObservableProps([
            'displayName',
            'href',
            'groups',
            'type',
            'uneditable',
            'showTags',
            'showSections',
            'apiQuery']);

        populateObservables(this.meta, opts);

        this.state = asObservableProps([
            'isOpen',
            'underDrag',
            'apiQueryStatus']);

        this.state.withinPriority = ko.computed(function() {
            return _.some(this.parents(), function(front) {return front.props.priority() === vars.priority; });
        }, this);

        this.meta.apiQuery.subscribe(function(apiQuery) {
            if (this.state.isOpen()) {
                this.meta.apiQuery(apiQuery.replace(/\s+/g, ''));
                this.checkApiQueryStatus();
            }
        }, this);

        this.meta.type.subscribe(function(type) {
            this.meta.groups(
                (_.find(vars.CONST.types, function(t) { return t.name === type; }) || {})
                .groups
            );
        }, this);
    }

    Collection.prototype.toggleOpen = function() {
        this.state.isOpen(!this.state.isOpen());
    };

    Collection.prototype.close = function() {
        this.state.isOpen(false);
    };

    Collection.prototype.isInitialCollection = function () {
        var parents = this.parents();

        if (parents.length === 1) {
            var siblings = parents[0].collections.items();

            return siblings.length === 1 && siblings[0] === this;
        } else {
            return false;
        }
    };

    /** IDs of fronts to which the collection belongs */
    Collection.prototype.frontIds = function () {
        return _.chain(this.parents()).map(function (front) {
            return front.id();
        }).filter(identity).value();
    };

    Collection.prototype.save = function() {
        this.state.isOpen(false);
        this.meta.apiQuery(stripEmptyQueryParams(this.meta.apiQuery()));
        this.state.apiQueryStatus(undefined);

        if (vars.model.collections.indexOf(this) === -1) {
            vars.model.collections.unshift(this);
        }

        if (!this.id) {
            if (this.isInitialCollection()) {
                persistence.front.create(this.parents()[0], this);
            } else {
                persistence.collection.create(this);
            }
        } else {
            persistence.collection.update(this);
        }
    };

    Collection.prototype.checkApiQueryStatus = function() {
        var self = this,
            apiQuery = this.meta.apiQuery(),
            cc;

        this.capiResults.removeAll();

        if (!apiQuery) {
            this.state.apiQueryStatus(undefined);
            return;
        }

        this.state.apiQueryStatus('check');

        checkCount += 1;
        cc = checkCount;

        apiQuery += apiQuery.indexOf('?') < 0 ? '?' : '&';
        apiQuery += 'show-editors-picks=true&show-fields=headline';

        contentApi.fetchContent(apiQuery)
        .always(function(results) {
            if (cc === checkCount) {
                self.capiResults(results);
                self.state.apiQueryStatus(results.length ? 'valid' : 'invalid');
            }
        });
    };

    return Collection;
});
