define([
    'bean',
    'bonzo',
    'qwery',
    'common/utils/$',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/template',
    'text!facia/views/button-show-more.html'
], function (
    bean,
    bonzo,
    qwery,
    $,
    detect,
    mediator,
    template,
    showMoreBtn
) {
    /** TODO: Remove this once the new Facia Cards work is complete. See container-fc-show-more.js for its replacement.
      */
    return function (container) {
        /* jscs:disable disallowDanglingUnderscores */

        this._$container = bonzo(container);

        this._items = [];

        this._showCount = (detect.getBreakpoint() === 'mobile') ? 8 : 1000000; // Show everything at once on multi column layouts

        this._className = 'show-more--hidden';

        this._$button = $.create(template(showMoreBtn));

        this._renderButton = function () {
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

        this._removeButton = function () {
            // listen to the clickstream, as happens later, before removing
            mediator.on('module:clickstream:click', function (clickSpec) {
                if (qwery(clickSpec.target)[0] === this._$button[0]) {
                    this._$button.remove();
                }
            }.bind(this));
        };

        this.showMore = function () {
            this._removeButton();
            this._$container.removeClass(this._className);
        };

        this.addShowMore = function () {
            this._$container.addClass(this._className);
            this._renderButton();
            this._$container.removeClass('js-container--show-more');
        };
    };
});
