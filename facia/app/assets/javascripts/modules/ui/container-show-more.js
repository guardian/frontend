define([
    'common/$',
    'bonzo',
    'bean',
    'qwery',
    'common/utils/detect',
    'common/utils/mediator'
], function (
    $,
    bonzo,
    bean,
    qwery,
    detect,
    mediator
) {

    return function(container) {

        this._container = container;

        this._$container = bonzo(container);

        this._$appendButtonTo = $('.js-container-append-button', this._$container);

        this._$collection = null;

        this._items = [];

        this._showCount = (detect.getBreakpoint() === 'mobile') ? 8 : 1000000; // Show everything at once on multi column layouts

        this._className = 'show-more--hidden';

        this._$button = bonzo(bonzo.create(
            '<button class="collection__show-more tone-background" data-link-name="Show more | 0">' +
                '<span class="u-hover">' +
                    '<span class="i i-plus-white-mask u-hover--hide"></span>' +
                    '<span class="i i-plus-white u-hover--show"></span>' +
                '</span>' +
                '<span class="u-h">Show more</span>' +
            '</button>'
        ));

        this._renderButton = function() {
            this._$button.addClass('tone-' + (this._$container.attr('data-tone') || 'news'));
            this._$appendButtonTo.append(this._$button);
            var that = this;
            bean.on(this._$button[0], 'click touchstart', function(e) {
                e.preventDefault();
                that.showMore();
            });
            // bean.on(this._$button[0], 'click', this.showMore.bind(this));
            mediator.emit('modules:containerShowMore:renderButton', this);
        };

        this._removeButton = function() {
            this._$button.remove();
        };

        this._incrementButtonCounter = function() {
            var newDataAttr = this._$button.attr('data-link-name').replace(/^(.* | )(\d+)$/, function(match, prefix, count) {
                // http://nicolaasmatthijs.blogspot.co.uk/2009/05/missing-radix-parameter.html
                return prefix + (parseInt(count, 10) + 1);
            });
            this._$button.attr('data-link-name', newDataAttr);
        };

        this.showMore = function(e) {
            this._$button.attr('disabled', true);
            this._$collection.removeClass(this._className);
            bonzo(this._items.splice(0, this._showCount))
                .removeClass(this._className);
            this._incrementButtonCounter();
            if (this._items.length === 0) {
                this._removeButton();
            } else {
                this._$button.attr('disabled', false);
            }
        };

        this.addShowMore = function() {
            this._$collection = $('.js-container--show-more', this._container)
                .addClass(this._className);
            if (this._$collection.length === 0) {
                return false;
            }
            this._items = $('.linkslist > .linkslist__item', this._$collection)
                .addClass(this._className)
                .map(function(item) { return item; });
            this._renderButton();
        };

    };

});
