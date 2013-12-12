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

    return function(collection) {

        this._collection = collection;

        this._$collection = bonzo(collection);

        this._items = null;

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
            this._incrementButtonCounter();
            if (this._items.length === 0) {
                this._removeButton();
            }
        };

        this._buttonVisibility = function() {
            // are any hidden?
            var hasHidden = false;
            $('.item', this._collection).map(function(item) {
                if ($(item).css('display') === 'none') {
                    hasHidden = true;
                }
            });
            if (!this._items && !hasHidden) {
                this._$button.hide();
            } else {
                this._$button.show();
            }
        };

        this.addShowMore = function() {
            this._renderButton();
            if (this._$collection.attr('data-can-show-more') === 'false') {
                this._buttonVisibility();
                // handle browser sizing
                var hasBreakpointChanged = detect.hasCrossedBreakpoint(),
                    that = this;
                mediator.on('window:resize', function() {
                    hasBreakpointChanged(function() {
                        that._buttonVisibility();
                    });
                });
            }
        };

        this.showMore = function() {
            if (this._items === null) {
                var hiddenItems = [];
                // get hidden items
                $('.item', this._collection).each(function(item) {
                    var $item = $(item);
                    if ($item.css('display') === 'none') {
                        hiddenItems.push(item);
                    }
                });
                if (this._$collection.attr('data-can-show-more') === 'false') {
                    bonzo(hiddenItems).detach();
                    this._items = hiddenItems;
                    this._showItems();
                } else {
                    bonzo(hiddenItems).remove();
                    var that = this;
                    ajax({
                        url: this._$collection.attr('data-link-context-path') + '.json',
                        type: 'json',
                        crossOrigin: true
                    }).then(function(data) {
                        // get hrefs of items we're showing
                        var itemsHrefs = $('.item__link', that._collection).map(function(item) {
                            return $(item).attr('href');
                        });
                        var newItems = bonzo.create(
                            $('.collection', bonzo.create('<div>' + data.html + '</div>')).html()
                        );
                        // filter items we're showing
                        that._items = newItems.filter(function(newItem) {
                            return itemsHrefs.indexOf($('.item__link', newItem).attr('href')) === -1;
                        });
                        that._showItems();
                    }).always(function() {
                        that._$button.attr('disabled', false);
                    });
                }
                // remove class
                this._$collection.removeClass('js-collection--show-more');
            } else {
                this._showItems();
            }
        };

    };

});
