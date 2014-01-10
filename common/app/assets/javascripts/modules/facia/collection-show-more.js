define([
    'common/$',
	'bonzo',
    'bean',
    'qwery',
    'common/utils/mediator',
    'common/utils/detect',
    'common/utils/ajax',
    'common/modules/ui/relativedates',
    'common/modules/discussion/comment-count'
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

        this._removeButton = function(afterAjax) {
            var that = this;
            // if we've just made the ajax call, remove without waiting
            if (afterAjax) {
                this._$button.remove();
            } else {
                // listen to the clickstream, as happens later, before removing
                mediator.on('module:clickstream:click', function(clickSpec) {
                    if (qwery(clickSpec.target)[0] === that._$button[0]) {
                        that._$button.remove();
                    }
                });
            }
        };

        this._incrementButtonCounter = function() {
            var newDataAttr = this._$button.attr('data-link-name').replace(/^(.* | )(\d+)$/, function(match, prefix, count) {
                // http://nicolaasmatthijs.blogspot.co.uk/2009/05/missing-radix-parameter.html
                return prefix + (parseInt(count, 10) + 1);
            });
            this._$button.attr('data-link-name', newDataAttr);
        };

        this._enrichItems = function() {
            relativeDates.init(this._collection);
            commentCount.init(this._collection);
        };

        this._showItems = function(afterAjax) {
            var itemsToShow = this._items.splice(0, getShowMoreSize());
            this._$collection.append(itemsToShow);
            this._enrichItems();
            this._$button.attr('disabled', false);
            this._incrementButtonCounter();
            if (this._items.length === 0) {
                this._removeButton(afterAjax || false);
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
            // get items, if we don't have them already
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
                        url: '/' + this._$collection.attr('data-link-context-path') + '.json',
                        type: 'json',
                        crossOrigin: true
                    }).then(function(data) {
                        // get hrefs of items we're showing
                        var itemsHrefs = $('.item__link', that._collection).map(function(item) {
                                return $(item).attr('href');
                            }),
                            newItems = bonzo.create(
                                $('.collection', bonzo.create('<div>' + data.html + '</div>')).html()
                            ) || [],
                            currentItemsCount = $('.item', that._collection).length;
                        that._items = newItems
                            // filter items we're showing
                            .filter(function(newItem) {
                                return itemsHrefs.indexOf($('.item__link', newItem).attr('href')) === -1;
                            })
                            // update data-link-name index
                            .map(function(item, itemIndex) {
                                var $item = $(item),
                                    updatedDataLinkName = $item.attr('data-link-name').replace(/trail \| \d+/, 'trail | ' + (currentItemsCount + itemIndex + 1));
                                $item.attr('data-link-name', updatedDataLinkName);
                                return $item[0];
                            });
                        that._showItems(true);
                    }).fail(function(req) {
                        mediator.emit('module:error', 'Failed to load items: ' + req.statusText);
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
