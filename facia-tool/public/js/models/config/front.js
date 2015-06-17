define([
    'knockout',
    'underscore',
    'modules/vars',
    'modules/content-api',
    'models/group',
    'models/config/collection',
    'models/config/persistence',
    'utils/as-observable-props',
    'utils/populate-observables',
    'utils/find-first-by-id',
    'utils/front-count',
    'utils/validate-image-src'
], function(
    ko,
    _,
    vars,
    contentApi,
    Group,
    Collection,
    persistence,
    asObservableProps,
    populateObservables,
    findFirstById,
    frontCount,
    validateImageSrc
) {
    asObservableProps = asObservableProps.default;
    findFirstById = findFirstById.default;
    populateObservables = populateObservables.default;
    validateImageSrc = validateImageSrc.default;
    frontCount = frontCount.default;

    function Front(opts) {
        var self = this;

        opts = opts || {};

        this.id = ko.observable(opts.id);

        this.props  = asObservableProps([
            'navSection',
            'webTitle',
            'title',
            'description',
            'onPageDescription',
            'imageUrl',
            'imageWidth',
            'imageHeight',
            'isImageDisplayed',
            'isHidden',
            'priority',
            'canonical']);

        populateObservables(this.props, opts);

        this.capiProps = asObservableProps([
            'section',
            'webTitle',
            'description']);

        this.state = asObservableProps([
            'isOpen',
            'isOpenProps',
            'isValidMetadata']);
        this.state.isValidMetadata(true);

        this.state.withinPriority = ko.computed(function() {
            return this.props.priority() === vars.priority || this.state.isOpenProps(); // last clause allows priority change
        }, this);

        this.applyConstraints();

        this.props.priority.subscribe(this.onChangePriority.bind(this));

        this.collections = new Group({
            parent: self,
            parentType: 'Front',
            items:
               _.chain(opts.collections)
                .map(function(id) { return vars.model.collectionsMap[id]; })
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

        this.provisionalImageUrl = ko.observable();

        this.props.imageUrl.subscribe(function(src){
            this.provisionalImageUrl(src);
        }, this);
        this.provisionalImageUrl(this.props.imageUrl());

        this.provisionalImageUrl.subscribe(function(src) {
            var self = this;

            if(!src){
                self.props.imageUrl(undefined);
                self.props.imageWidth(undefined);
                self.props.imageHeight(undefined);
                self.props.isImageDisplayed(undefined);
                return;
            }

            if (src === this.props.imageUrl()) { return; }

            validateImageSrc(src, {minWidth: 120})
            .then(function(img) {
                self.props.imageUrl(img.src);
                self.props.imageWidth(img.width);
                self.props.imageHeight(img.height);
                self.saveProps();
            }, function(err) {
                self.provisionalImageUrl(undefined);
                window.alert('Sorry! ' + err.message);
            });
        }, this);

        this.depopulateCollection = this._depopulateCollection.bind(this);

        this.placeholders = {};

        this.placeholders.navSection = ko.computed(function() {
            var path = asPath(this.id()),
                isEditionalised = [].concat(vars.pageConfig.editions).some(function(edition) { return edition === path[0]; });

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

        this.placeholders.onPageDescription  = ko.computed(function() {
            return this.props.onPageDescription() || this.capiProps.description() || ('Latest ' + this.placeholders.webTitle() + ' news, comment and analysis from the Guardian, the world\'s leading liberal voice');
        }, this);

        this.ophanPerformances = ko.computed(function () {
            return vars.CONST.ophanFrontBase + encodeURIComponent('/' + this.id());
        }, this);
    }

    Front.prototype.validate = function(checkUniqueness) {
        var self = this;

        this.id((this.id() || '')
            .toLowerCase()
            .replace(/\/+/g, '/')
            .replace(/^\/|\/$/g, '')
            .replace(/[^a-z0-9\/\-+]*/g, '')
            .split('/')
            .slice(0, 3)
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
        this.applyConstraints();
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
        if (this.props.canonical() === collection.id) {
            this.props.canonical(null);
        }
        this.saveProps();
    };

    Front.prototype.applyConstraints = function () {
        if (this.props.priority() === 'training') {
            this.state.isTypeLocked = true;
            this.props.isHidden(true);
        }
    };

    Front.prototype.onChangePriority = function (newPriority) {
        var num = frontCount(vars.state.config.fronts, newPriority);

        if (num.count >= num.max) {
            this.state.isValidMetadata(false);
            window.alert('The maximum number of fronts (' + num.max + ') has been exceeded. Please delete one first, by removing all its collections.');
        } else {
            this.state.isValidMetadata(true);
        }
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
