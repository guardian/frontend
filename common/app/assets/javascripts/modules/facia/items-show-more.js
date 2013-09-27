define(['common', 'bonzo', 'bean', 'qwery', 'modules/detect'], function (common, bonzo, bean, qwery, detect) {

    return function(items) {

        var _$items = bonzo(items),
            _getShownSize = function (collectionType) {
                var breakpointOptions = {
                    wide: {
                        default: 4,
                        news: 9,
                        sport: 9,
                        commentisfree: 5,
                        culture: 5,
                        popular: 3
                    },
                    desktop: {
                        default: 3,
                        news: 6,
                        sport: 6,
                        commentisfree: 3,
                        culture: 3
                    },
                    tablet: {
                        default: 2,
                        news: 5,
                        sport: 5,
                        commentisfree: 3,
                        culture: 3
                    },
                    mobile: {
                        default: 2,
                        news: 5,
                        sport: 5,
                        commentisfree: 3,
                        culture: 3,
                        popular: 3
                    }
                }[detect.getBreakpoint()];
                return breakpointOptions[collectionType] || breakpointOptions['default'];
            },
            _rowSize = {
                wide: 8,
                desktop: 6,
                tablet: 4,
                mobile: 5
            }[detect.getBreakpoint()],
            _renderToggle = function($items) {
                var $button = bonzo(bonzo.create('<button class="items__show-more">Show more news</button>'))
                    .insertAfter($items);
                bean.on($button[0], 'click', function(e) {
                    // show x more, depending on current breakpoint
                    var moreHidden = qwery('.item.u-h', $items[0]).some(function(item, index) {
                            if (index === _rowSize) {
                                return true;
                            }
                            bonzo(item).removeClass('u-h');
                        });
                    if (!moreHidden) {
                        $button.remove();
                    }
                });
            };

        this.addShowMore = function() {
            var collectionType = _$items.parent().attr('data-collection-type'),
                $overflowStories = common.$g('.item:nth-child(n + ' + (_getShownSize(collectionType) + 1) + ')', _$items[0]);
            // hide stories
            $overflowStories.addClass('u-h');
            // add toggle button, if we have hidden stories
            if ($overflowStories.length) {
                _renderToggle(_$items);
            }
        };


    };

});
