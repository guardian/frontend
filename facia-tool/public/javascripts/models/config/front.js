/* global _: true */
define([
    'knockout',
    'config',
    'modules/vars',
    'modules/content-api',
    'models/group',
    'models/config/collection',
    'utils/as-observable-props',
    'utils/populate-observables',
    'utils/find-first-by-id'
], function(
    ko,
    config,
    vars,
    contentApi,
    Group,
    Collection,
    asObservableProps,
    populateObservables,
    findFirstById
) {
    function Front(opts) {
        var self = this,
            props = [
                'section',
                'webTitle',
                'title',
                'description',
                'priority'];

        opts = opts || {};

        this.id = ko.observable(opts.id);

        this.props  = asObservableProps(props);

        this.placeholders  = asObservableProps(props);

        populateObservables(this.props,  opts);

        this.state = asObservableProps([
            'isOpen',
            'isOpenProps',
            'hasContentApiProps']);

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

        this.props.webTitle.subscribe(function() {
            this.derivePlaceholders();
        }, this);

        this.depopulateCollection = this._depopulateCollection.bind(this);
    }

    Front.prototype.validate = function(checkUniqueness) {
        var self = this;

        this.id((this.id() || '')
            .toLowerCase()
            .replace(/^\/|\/$/g, '')
            .replace(/[^a-z0-9\/\-]*/g, '')
        );

        if (!this.id()) { return; }

        if(checkUniqueness && _.filter(vars.model.fronts(), function(front) { return front.id() === self.id(); }).length > 1) {
            this.id(undefined);
            return;
        }
    };

    Front.prototype.derivePlaceholders = function() {
        var path = (this.id() || '').split('/'),
            isEditionalised = _.some(['uk', 'us', 'au'], function(edition) { return edition === path[0]; });

        if (!path.length) { return; }

        this.placeholders.section(this.props.section() || (isEditionalised ? path.length === 1 ? undefined : path[1] : path[0]));
        this.placeholders.webTitle(this.props.webTitle() || toTitleCase(path.slice(path.length > 1 ? 1 : 0).join(' ').replace(/\-/g, ' ')) || this.id());
        this.placeholders.title(this.placeholders.webTitle() + ' news, comment and analysis from the Guardian' + (this.placeholders.section() ? ' | ' + toTitleCase(this.placeholders.section()) : ''));
        this.placeholders.description('Latest ' + this.placeholders.webTitle() + ' news, comment and analysis from the Guardian, the world\'s leading liberal voice');
    };

    Front.prototype.setOpen = function(isOpen, withOpenProps) {
        this.state.isOpen(isOpen);
        this.state.isOpenProps(withOpenProps);
    };

    Front.prototype.toggleOpen = function() {
        this.state.isOpen(!this.state.isOpen());
    };

    Front.prototype.openPropsAttempt = function() {
        var self = this;

        this.state.hasContentApiProps('Checking');

        contentApi.fetchMetaForPath(this.id())
        .done(function() {
            self.state.hasContentApiProps('Metadata for this front must be edited in Tag Manager');
        })
        .fail(function() {
            self.state.hasContentApiProps(false);
            self.openProps();
        });
    };

    Front.prototype.openProps = function() {
        this.state.isOpenProps(true);
        this.derivePlaceholders();
        this.collections.items().map(function(collection) { collection.close(); });
    };

    Front.prototype.saveProps = function() {
        vars.model.save();
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
        vars.model.save(collection);
    };

    function toTitleCase(str) {
        return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    }

    return Front;
});
