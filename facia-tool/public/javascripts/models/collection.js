define([
    'knockout',
    'models/common',
    'models/humanizedTimeSpan',
    'models/authedAjax',
    'models/group',
    'models/article',
    'models/contentApi',
    'models/ophanApi'
], function(
    ko,
    common,
    humanizedTimeSpan,
    authedAjax,
    Group,
    Article,
    contentApi,
    ophanApi
) {
    function Collection(opts) {
        var self = this;
            
        if (!opts || !opts.id) { return; }
        
        this.id = opts.id;
        this.response = null;
        this.groups = this.createGroups(opts.groups);
        
        // properties from the config, about this collection
        this.configMeta   = common.util.asObservableProps([
            'displayName',
            'roleName']);
        common.util.populateObservables(this.configMeta, opts);

        // properties from the collection itself
        this.collectionMeta = common.util.asObservableProps([
            'displayName',
            'lastUpdated',
            'updatedBy',
            'updatedEmail']);

        this.state  = common.util.asObservableProps([
            'hasDraft',
            'loadIsPending',
            'editingConfig',
            'timeAgo']);

        this.load();
    }

    Collection.prototype.createGroups = function(groupNames) {
        var self = this,
            dropItem = this.drop.bind(this);

        return _.map(_.isArray(groupNames) ? groupNames : [undefined], function(name, index) {
            return new Group ({
                group: index,
                name: name,
                collection: self,
                dropItem: dropItem
            });
        }).reverse(); // because groupNames is assumed to be in ascending order of importance, yet should render in descending order
    };

    Collection.prototype.toggleEditingConfig = function() {
        this.state.editingConfig(!this.state.editingConfig());
    };

    Collection.prototype.cancelEditingConfig = function() {
        this.state.editingConfig(false);
        this.load();
    };

    Collection.prototype.publishDraft = function() {
        this.processDraft(true);
    };

    Collection.prototype.discardDraft = function() {
        this.processDraft(false);
    };

    Collection.prototype.processDraft = function(goLive) {
        var self = this;

        this.state.loadIsPending(true);

        authedAjax.request({
            type: 'post',
            url: common.config.apiBase + '/collection/' + this.id,
            data: JSON.stringify(goLive ? {publish: true} : {discard: true})
        })
        .then(function() {
            self.load();
        })

        this.state.hasDraft(false);
    };

    Collection.prototype.drop = function(item) {
        var self = this;

        self.state.loadIsPending(true);

        authedAjax.request({
            type: 'delete',
            url: common.config.apiBase + '/collection/' + self.id,
            data: JSON.stringify({
                item: item.props.id(),
                live:   common.state.liveMode(),
                draft: !common.state.liveMode()
            }),
        }).then(function() {
            self.load();
        });
    };

    Collection.prototype.load = function(opts) {
        var self = this;
        opts = opts || {};

        return authedAjax.request({
            url: common.config.apiBase + '/collection/' + this.id
        }).then(function(resp) {
            self.response = resp;
            self.state.loadIsPending(false);
            self.state.hasDraft(_.isArray(self.response.draft));

            if (opts.isRefresh && (self.state.loadIsPending() || self.response.lastUpdated === self.collectionMeta.lastUpdated())) {
                // noop
            } else {
                self.populateLists();
            }

            if (!self.state.editingConfig()) {
                common.util.populateObservables(self.collectionMeta, self.response)
                self.state.timeAgo(self.getTimeAgo(self.response.lastUpdated));
            }
        });
    };

    Collection.prototype.populateLists = function() {
        if (!this.response) { return; }

        if (common.state.liveMode()) {
            this.importList(this.response.live);
        } else {
            this.importList(this.response.draft || this.response.live); // No draft yet? Base it on live.
        }
        this.decorate();
    };

    Collection.prototype.importList = function(source) {
        var self = this;

        _.each(this.groups, function(group) {
            group.items.removeAll();
        });

        _.toArray(source).forEach(function(item, index) {
            var groupInt,
                group;

            //item.sublinks = [{id: 'politics/blog/2013/dec/05/george-osbornes-autumn-statement-live'}]

            groupInt = parseInt((item.meta || {}).group, 10) || 0;

            group = _.find(self.groups, function(g){ return g.group === groupInt; }) || self.groups[0];
            group.items.push(new Article(item, self));
        });
    }

    Collection.prototype.decorate = function() {
        _.each(this.groups, function(group) {
            contentApi.decorateItems(group.items());
            ophanApi.decorateItems(group.items());
        });
    };

    Collection.prototype.refresh = function() {
        if (common.state.uiBusy || this.state.loadIsPending()) { return; }
        this.load({
            isRefresh: true
        });
    };

    Collection.prototype.saveConfig = function() {
        var self = this;

        this.state.editingConfig(false);
        this.state.loadIsPending(true);

        authedAjax.request({
            url: common.config.apiBase + '/collection/' + this.id,
            type: 'post',
            data: JSON.stringify({
                config: {
                    displayName: this.collectionMeta.displayName()
                }
            })
        }).then(function(){
            self.load();
        });
    };

    Collection.prototype.getTimeAgo = function(date) {
        return date ? humanizedTimeSpan(date) : '';
    };

    return Collection;
});
