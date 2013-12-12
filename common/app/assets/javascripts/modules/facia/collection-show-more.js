define([
    '$',
    'bonzo',
    'bean',
    'qwery',
    'utils/mediator',
    'utils/detect',
    'utils/ajax',
    'modules/ui/relativedates',
    'modules/discussion/comment-count'
], function ($, bonzo, bean, qwery, mediator, detect, ajax, relativeDates, commentCount) {

    var buttonText = 'Show more',
        getShowMoreSize = function() {
            return {
                wide: 8,
                desktop: 8,
                tablet: 6,
                mobile: 5
            }[detect.getBreakpoint()];
        };

    return function(collection, items) {

        this._collection = collection;

        this._$collection = bonzo(collection);

        this._items = items;

        this._initialised = false;

        this._$button = bonzo(bonzo.create(
            '<button class="collection__show-more tone-background" data-link-name="' + buttonText + ' | 0">' +
                '<span class="i i-arrow-white-large">' +
                    buttonText +
                '</span>' +
            '</button>'
        ));

        this._renderButton = function() {
            // add tone to button
            this._$button.addClass('tone-' + (this._$collection.attr('data-tone') || 'news'));
            this._$collection.after(this._$button);
            var that = this;
            bean.on(this._$button[0], 'click', function() {
                that._$button.attr('disabled', true);
                that.showMore();
            });
            mediator.emit('modules:collectionShowMore:renderButton', this);
        };

        this._removeButton = function() {
            var that = this;
            // listen to the clickstream, as happens later, before removing
            mediator.on('module:clickstream:click', function(clickSpec) {
                if (qwery(clickSpec.target)[0] === that._$button[0]) {
                    that._$button.remove();
                }
            });
        };

        this._incrementButtonCounter = function() {
            var newDataAttr = this._$button.attr('data-link-name').replace(/^(.* | )(\d+)$/, function(match, prefix, count) {
                // http://nicolaasmatthijs.blogspot.co.uk/2009/05/missing-radix-parameter.html
                return prefix + (parseInt(count, 10) + 1);
            });
            this._$button.attr('data-link-name', newDataAttr);
        };

        this._showItems = function() {
            var itemsToShow = this._items.splice(0, getShowMoreSize());
            // NOTE: wrapping in div so can be passed to commentCount, relativeDates, etc.
            var wrappedItems = bonzo(bonzo.create('<div></div>'))
                .append(itemsToShow)[0];
            relativeDates.init(wrappedItems);
            commentCount.init(wrappedItems);
            this._$collection.append(itemsToShow);
            this._$button.attr('disabled', false);
            if (this._items.length === 0) {
                this._removeButton();
            }
        };

        this.addShowMore = function() {
            this._renderButton();
        };

        this.showMore = function() {
            if (!this._initialised) {
                // delete hidden items
                $('.item', this._collection).each(function(item) {
                    var $item = $(item);
                    if ($item.css('display') === 'none') {
                        $item.remove();
                    }
                });
                // remove class
                this._$collection.removeClass('js-collection--show-more');
            }
            var that = this;
            if (!this._items) {
                ajax({
                    url: this._$collection.attr('data-link-context-path') + '.json',
                    type: 'json',
                    crossOrigin: true
                }).then(function(data) {
                    var newItems = bonzo.create(
                        $('.collection', bonzo.create('<div>' + data.html + '</div>')).html()
                    );
                    // remove items we're showing
                    var itemsSize = $('.item', that._collection).length;
                    that._items = newItems.slice(itemsSize);
                    that._showItems();
                }).always(function() {
                    that._$button.attr('disabled', false);
                });
            } else {
                this._showItems();
            }
            this._initialised = true;
        };

    };

});
