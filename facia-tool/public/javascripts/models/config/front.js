/* global _: true */
define([
    'knockout',
    'config',
    'modules/vars',
    'modules/content-api',
    'models/group',
    'models/config/collection',
    'models/config/persistence',
    'utils/as-observable-props',
    'utils/populate-observables',
    'utils/find-first-by-id'
], function(
    ko,
    pageConfig,
    vars,
    contentApi,
    Group,
    Collection,
    persistence,
    asObservableProps,
    populateObservables,
    findFirstById
) {
    function Front(opts) {
        var self = this;

        opts = opts || {};

        this.id = ko.observable(opts.id);

        this.props  = asObservableProps([
            'navSection',
            'webTitle',
            'title',
            'description',
            'priority']);

        populateObservables(this.props, opts);

        this.capiProps = asObservableProps([
            'section',
            'webTitle',
            'description']);

        this.state = asObservableProps([
            'isOpen',
            'isOpenProps']);

        this.state.withinPriority = ko.computed(function() {
            return this.props.priority() === vars.priority || this.state.isOpenProps(); // last clause allows priority change
        }, this);

        this.collections = new Group({
            parent: self,
            parentType: 'Front',
            items:
               _.chain(opts.collections)
                .map(function(id) {return findFirstById(vars.model.collections, id); })
                .filter(function(collection) { return !!collection; })
                .map(function(collection) {
                    collection.parents.push(self);
                    return collection;
                })
                .value()
        });

        this.id.subscribe(function() {
            this.validate(true);
            if (this.id()) {
                this.setOpen(true);
            }
        }, this);

        this.depopulateCollection = this._depopulateCollection.bind(this);

        this.placeholders = {};

        this.placeholders.navSection = ko.computed(function() {
            var path = asPath(this.id()),
                isEditionalised = [].concat(pageConfig.editions).some(function(edition) { return edition === path[0]; });

            return this.capiProps.section() || (isEditionalised ? path.length === 1 ? undefined : path[1] : path[0]);
        }, this);

        this.placeholders.webTitle = ko.computed(function() {
            var path = asPath(this.id());

            return this.props.webTitle() || this.capiProps.webTitle() || (toTitleCase(path.slice(path.length > 1 ? 1 : 0).join(' ').replace(/\-/g, ' ')) || this.id());
        }, this);

        this.placeholders.title = ko.computed(function() {
            var section = this.props.navSection() || this.placeholders.navSection();

            return this.props.title() || (this.placeholders.webTitle() + (section ? ' | ' + toTitleCase(section) : ''));
        }, this);

        this.placeholders.description  = ko.computed(function() {
            return this.props.description() || this.capiProps.description() || ('Latest ' + this.placeholders.webTitle() + ' news, comment and analysis from the Guardian, the world\'s leading liberal voice');
        }, this);
    }

    Front.prototype.validate = function(checkUniqueness) {
        var self = this;

        this.id((this.id() || '')
            .toLowerCase()
            .replace(/\/+/g, '/')
            .replace(/^\/|\/$/g, '')
            .replace(/[^a-z0-9\/\-]*/g, '')
            .split('/')
            .slice(0,3)
            .join('/')
        );

        if (!this.id()) { return; }

        if(checkUniqueness && _.filter(vars.model.fronts(), function(front) { return front.id() === self.id(); }).length > 1) {
            this.id(undefined);
            return;
        }
    };

    Front.prototype.setOpen = function(isOpen, withOpenProps) {
        this.state.isOpen(isOpen);
        this.state.isOpenProps(withOpenProps);
    };

    Front.prototype.toggleOpen = function() {
        this.state.isOpen(!this.state.isOpen());
    };

    Front.prototype.openProps = function() {
        var self = this;

        this.state.isOpenProps(true);
        this.collections.items().map(function(collection) { collection.close(); });

        contentApi.fetchMetaForPath(this.id())
        .done(function(meta) {
            meta = meta || {};
            _.each(self.capiProps, function(val, key) {
                val(meta[key]);
            });
        });
    };

    Front.prototype.saveProps = function() {
        persistence.front.update(this);
        this.state.isOpenProps(false);
    };

    Front.prototype.createCollection = function() {
        var collection = new Collection();

        collection.toggleOpen();
        collection.parents.push(this);
        this.collections.items.push(collection);
        vars.model.collections.unshift(collection);
    };

    Front.prototype._depopulateCollection = function(collection) {
        collection.state.isOpen(false);
        collection.parents.remove(this);
        this.collections.items.remove(collection);
        this.saveProps();
    };

    function toTitleCase(str) {
        return (str + '').replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }

    function asPath(str) {
       return (str + '').split('/');
    }

    return Front;
});
