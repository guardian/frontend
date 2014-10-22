define([
    'bean',
    'bonzo',
    'lodash/collections/contains',
    'lodash/collections/filter',
    'lodash/objects/has',
    'lodash/collections/indexBy',
    'lodash/collections/map',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/mediator',
    'common/utils/detect',
    'common/utils/config',
    'common/utils/template',
    'common/modules/component',
    'common/modules/ui/relativedates',
    'text!common/views/ui/updates.html',
    'text!common/views/ui/updated.html'
], function (
    bean,
    bonzo,
    contains,
    filter,
    has,
    indexBy,
    map,
    $,
    ajax,
    mediator,
    detect,
    config,
    template,
    Component,
    relativedate,
    updatesTpl,
    updatedTpl
) {

    function Cta(id, parent) {
        this.id = id;
        this.isEnabled = parent && parent.length > 0;
        if (this.isEnabled) {
            this.parent = parent[0];
        }
        return this;
    }

    Component.define(Cta);

    Cta.prototype.useBem = false;
    Cta.prototype.componentClass = 'fc-container__updated';
    Cta.prototype.manipulationType = 'html';
    Cta.prototype.classes = {
        timestamp: '.js-updated-timestamp',
        btn: '.fc-container__update-cta',
        btnUpdating: 'fc-container__update-cta--is-updating'
    };
    Cta.prototype.getUpdateText = function () {
        return this.count === 1 ? 'story' : 'stories';
    };

    Cta.prototype.generateUpdatedTemplate = function () {
        var date = new Date();
        return template(updatedTpl, {
            datetime: date.getTime(),
            timestamp: date.toISOString(),
            text: 'Just now'
        });
    };

    Cta.prototype.generateUpdatesTemplate = function () {
        return template(updatesTpl, {
            update: this.getUpdateText(),
            numberOfUpdates: this.count
        });
    };

    Cta.prototype.updateCount = function () {
        $('.js-updates', this.elem).text(this.count + ' new ' + this.getUpdateText());
    };

    Cta.prototype.showTimestamp = function () {
        $(this.getElem('timestamp')).removeClass('u-h').html(this.generateUpdatedTemplate());
    };

    Cta.prototype.hideTimestamp = function () {
        $(this.getElem('timestamp')).addClass('u-h');
    };

    Cta.prototype.update = function (count) {
        this.count = count;

        if (!this.rendered) {
            this.template = this.generateUpdatesTemplate();
            this.render(this.parent);
            this.bindListeners();
        } else {
            this.show();
        }
    };

    Cta.prototype.updating = function () {
        mediator.emit('modules:containers:' + this.id + ':update');
        bonzo(this.getElem('btn')).addClass(this.classes.btnUpdating);
    };

    Cta.prototype.show = function () {
        this.updateCount();
        this.hideTimestamp();
        bonzo(this.getElem('btn')).removeClass('u-h');
    };

    Cta.prototype.hide = function () {
        this.showTimestamp();
        bonzo(this.getElem('btn')).removeClass(this.classes.btnUpdating).addClass('u-h');
    };

    Cta.prototype.bindListeners = function () {
        this.on('click', this.classes.btn, this.updating.bind(this));
        mediator.on('modules:containers:' + this.id + ':rendered', this.hide.bind(this));
    };

    function Container(el) {
        this.elem = el;
        this.$elem = bonzo(el);
        this.id = this.$elem.data('id');
        this.cta = new Cta(this.id, $('.js-container--insert-updates', this.elem));
    }

    Component.define(Container);

    Container.prototype.endpoint = function () {
        return '/' + config.page.pageId + '/collections/' + this.id + '/' + this.index.versionId + '.json';
    };

    Container.prototype.getItems = function () {
        return $('.js-fc-item', this.elem);
    };

    Container.prototype.currentItems = function () {
        var items = this.getItems(),
            visibleOnMobile = filter(items, function (item) {
                return bonzo(item).data('item-visibility') === 'all';
            }),
            visibleOnDesktop = filter(items, function (item) {
                return contains(['desktop', 'all'], bonzo(item).data('item-visibility'));
            });

        function itemInfo(item) { return { id: bonzo(item).data('id') }; }

        return {
            mobile: map(visibleOnMobile, itemInfo),
            desktop: map(visibleOnDesktop, itemInfo)
        };
    };

    Container.prototype.newCount = function (oldItems, newItems) {
        var oldById = indexBy(oldItems, 'id');

        return filter(newItems, function (item) {
            return !has(oldById, item.id);
        }).length;
    };

    Container.prototype.update = function (index) {
        this.index = index.containers[this.id];

        if (this.cta.isEnabled) {
            var currentItems = this.currentItems(),
                count;

            if (detect.isBreakpoint('mobile')) {
                count = this.newCount(currentItems.mobile, filter(this.index.items, function (item) {
                    return item.visibleOnMobile;
                }));
            } else {
                count = this.newCount(currentItems.desktop, this.index.items);
            }

            if (count > 0) {
                this.cta.update(count);
            }
        }
    };

    Container.prototype.render = function (html) {
        var hideCls = 'fc-container__body--is-hidden',
            $old = $('.fc-container__body', this.elem),
            $new = $('.container__body', $.create(html));

        $old.addClass(hideCls);
        $new.addClass(hideCls);

        setTimeout(function () {
            $old.replaceWith($new[0]);

            setTimeout(function () {
                $new.removeClass(hideCls);
                mediator.emit('modules:containers:' + this.id + ':rendered');
            }.bind(this), 20);
        }.bind(this), 500);
    };

    // Having to override Components default fetch method.
    Container.prototype.fetch = function () {
        // jscs:disable disallowDanglingUnderscores
        this._fetch().then(function (resp) {
            if (resp && 'html' in resp) {
                this.render(resp.html);
                mediator.emit('modules:containers:' + this.id + ':loaded');
            }
        }.bind(this));
    };

    Container.prototype.bindListeners = function () {
        mediator.on('modules:containers:' + this.id + ':update', this.fetch.bind(this));
        mediator.on('modules:containers:update', this.update.bind(this));
    };

    Container.prototype.init = function () {
        this.bindListeners();
    };

    function triggerUpdate() {
        ajax({
            url: '/' + config.page.pageId + '/front-index.json',
            type: 'json',
            method: 'get',
            crossOrigin: 'true'
        }).then(function (data) {
            mediator.emit('modules:containers:update', data);
        });
    }

    return function () {
        if (config.switches.autoRefresh) {
            var $containers = $('.js-container--fetch-updates'),
                updateInterval = detect.isBreakpoint('mobile') ? 20000 : 10000;

            if ($containers.length > 0) {
                $containers.each(function (el) {
                    new Container(el).init();
                });
                triggerUpdate();
                setInterval(triggerUpdate, updateInterval);
            }
        }
    };
});
