define(['common', 'bonzo', 'bean', 'qwery', 'modules/detect'], function (common, bonzo, bean, qwery, detect) {

    return function(items) {

        var _$items = bonzo(items),
            _getShownSize = function (collectionType) {
                var breakpointOptions = {
                    wide: {
                        default: 4,
                        'container-news': 9,
                        'container-sport': 9,
                        'container-commentisfree': 5,
                        'container-culture': 5,
                        'container-popular': 3
                    },
                    desktop: {
                        default: 3,
                        'container-news': 6,
                        'container-sport': 6,
                        'container-commentisfree': 3,
                        'container-culture': 3
                    },
                    tablet: {
                        default: 2,
                        'container-news': 5,
                        'container-sport': 5,
                        'container-commentisfree': 3,
                        'container-culture': 3
                    },
                    mobile: {
                        default: 2,
                        'container-news': 5,
                        'container-sport': 5,
                        'container-commentisfree': 3,
                        'container-culture': 3,
                        'container-popular': 3
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
                var buttonText = 'Show more',
                    $button = bonzo(bonzo.create('<button class="items__show-more" data-link-name="' + buttonText + ' | 0">' + buttonText + '</button>'))
                        .insertAfter($items);
                bean.on($button[0], 'click', function(e) {
                    // increment button counter
                    var newDataAttr = $button.attr('data-link-name').replace(/^(.* | )(\d+)$/, function(match, prefix, count) {
                        // http://nicolaasmatthijs.blogspot.co.uk/2009/05/missing-radix-parameter.html
                        return prefix + (parseInt(count, 10) + 1);
                    });
                    $button.attr('data-link-name', newDataAttr);
                    // show x more, depending on current breakpoint
                    var moreHidden = qwery('.item.u-h', $items[0]).some(function(item, index) {
                            if (index === _rowSize) {
                                return true;
                            }
                            bonzo(item).removeClass('u-h');
                        });
                    // listen to the clickstream, as happens later, before removing
                    if (!moreHidden) {
                        common.mediator.on('module:clickstream:click', function(clickSpec) {
                            if (bonzo(clickSpec.target)[0] === $button[0]) {
                                $button.remove();
                            }
                        });
                    }
                });
            };

        this.addShowMore = function() {
            var $collection = _$items.parent(),
                collectionType = $collection.attr('data-collection-type') + '-' + $collection.attr('data-section'),
                $overflowStories = common.$g('.item:nth-child(n+' + (_getShownSize(collectionType) + 1) + ')', _$items[0]);
            // hide stories
            $overflowStories.addClass('u-h');
            // add toggle button, if we have hidden stories
            if ($overflowStories.length) {
                _renderToggle(_$items);
            }
        };


    };

});
