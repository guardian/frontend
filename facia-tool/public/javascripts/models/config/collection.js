/* global _: true */
define([
    'knockout',
    'modules/vars',
    'modules/content-api',
    'utils/as-observable-props',
    'utils/populate-observables',
    'utils/collection-guid'
], function(
    ko,
    vars,
    contentApi,
    asObservableProps,
    populateObservables,
    collectionGuid
) {
    var checkCount = 0;

    function Collection(opts) {
        opts = opts || {};

        this.id = opts.id || collectionGuid();

        this.parents = ko.observableArray();
        this.capiResults = ko.observableArray();

        this.meta   = asObservableProps([
            'displayName',
            'href',
            'groups',
            'type',
            'uneditable',
            'apiQuery']);

        populateObservables(this.meta, opts);

        if (_.isArray(this.meta.groups())) {
            this.meta.groups(this.meta.groups().join(','));
        }

        this.state = asObservableProps([
            'open',
            'underDrag',
            'apiQueryStatus']);

        this.meta.apiQuery.subscribe(function(val) {
            if (this.state.open()) {
                this.meta.apiQuery(val.replace(/\s+/g, ''));
                this.checkApiQueryStatus();
            }
        }, this);
    }

    Collection.prototype.toggleOpen = function() {
        this.state.open(!this.state.open());
    };

    Collection.prototype.save = function() {
        if (vars.model.collections.indexOf(this) < 0) {
            vars.model.collections.unshift(this);
        }
        this.state.open(false);
        this.state.apiQueryStatus(undefined);
        vars.model.save(this);
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

        this.state.apiQueryStatus('checking');

        checkCount += 1;
        cc = checkCount;

        apiQuery += apiQuery.indexOf('?') < 0 ? '?' : '&';
        apiQuery += 'show-editors-picks=true&show-fields=headline';

        contentApi.fetchContent(apiQuery)
        .done(function(results) {
            if (cc === checkCount) {
                self.capiResults(results);
                self.state.apiQueryStatus(results.length ? 'valid' : 'invalid');
            }
        })
        .fail(function() {
            if (cc === checkCount) {
                self.capiResults.removeAll();
                self.state.apiQueryStatus('invalid');
            }
        });
    };

    Collection.prototype.discard = function() {
        vars.model.collections.remove(this);
        vars.model.save(this);
    };

    return Collection;
});
