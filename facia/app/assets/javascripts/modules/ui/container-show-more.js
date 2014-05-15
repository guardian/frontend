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

        this._$container = bonzo(container);

        this._items = [];

        this._showCount = (detect.getBreakpoint() === 'mobile') ? 8 : 1000000; // Show everything at once on multi column layouts

        this._className = 'show-more--hidden';

        this._$button = bonzo(bonzo.create(
            '<button class="collection__show-more tone-background" data-link-name="Show more | 0">' +
                '<span class="collection__show-more__icon">' +
                    '<span class="i i-plus-white-mask"></span>' +
                    '<span class="i i-plus-white"></span>' +
                '</span>' +
                '<span class="u-h">Show more</span>' +
            '</button>'
        ));

        this._renderButton = function() {
            this._$button
                .addClass('tone-' + (this._$container.attr('data-tone') || 'news'))
                .insertAfter(this._$container);
            // override button icons
            if (this._$container.hasClass('container--show-more-dark')) {
                var buttonIcons = $('.i', this._$button);
                $(buttonIcons.get(0)).removeClass('i-plus-white-mask').addClass('i-plus-neutral1-mask');
                $(buttonIcons.get(1)).removeClass('i-plus-white').addClass('i-plus-neutral1');
            }
            bean.on(this._$button[0], 'click', this.showMore.bind(this));
            mediator.emit('modules:containerShowMore:renderButton', this);
        };

        this._removeButton = function() {
            // listen to the clickstream, as happens later, before removing
            mediator.on('module:clickstream:click', function(clickSpec) {
                if (qwery(clickSpec.target)[0] === this._$button[0]) {
                    this._$button.remove();
                }
            }.bind(this));
        };

        this._incrementButtonCounter = function() {
            var newDataAttr = this._$button.attr('data-link-name').replace(/^(.* | )(\d+)$/, function(match, prefix, count) {
                // http://nicolaasmatthijs.blogspot.co.uk/2009/05/missing-radix-parameter.html
                return prefix + (parseInt(count, 10) + 1);
            });
            this._$button.attr('data-link-name', newDataAttr);
        };

        this.showMore = function() {
            this._$button.attr('disabled', true);
            this._$container.removeClass(this._className);
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
            this._$container.addClass(this._className);
            this._items = $('.linkslist > .linkslist__item', this._$container)
                .addClass(this._className)
                .map(function(item) { return item; });
            this._renderButton();
            this._$container.removeClass('js-container--show-more');
        };

    };

});
