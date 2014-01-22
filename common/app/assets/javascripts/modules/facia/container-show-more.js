define([
    'common/$',
    'bonzo',
    'bean',
    'qwery',
    'common/utils/mediator'
], function (
    $,
    bonzo,
    bean,
    qwery,
    mediator
) {

    return function(container) {

        this._container = container;

        this._$container = bonzo(container);

        this._items = [];

        this._showCount = 8;

        this._$button = bonzo(bonzo.create(
            '<button class="collection__show-more tone-background tone-news" data-link-name="Show more | 0">' +
                '<span class="i i-arrow-white-large">Show more</span>' +
            '</button>'
        ));

        this._renderButton = function() {
            this._$container.append(this._$button);
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

        this.showMore = function(e) {
            this._$button.attr('disabled', true);
            bonzo(this._items.splice(0, this._showCount))
                .removeClass('show-more--hidden');
            this._incrementButtonCounter();
            if (this._items.length === 0) {
                this._removeButton();
            } else {
                this._$button.attr('disabled', false);
            }
        };

        this.addShowMore = function() {
            this._items = $('div:last-child > .linkslist > .linkslist__item', this._container)
                .addClass('show-more--hidden')
                .map(function(item) { return item; });
            this._renderButton();
        };

    };

});
