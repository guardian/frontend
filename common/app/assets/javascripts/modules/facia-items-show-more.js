define(['common', 'bonzo', 'bean', 'qwery', 'modules/detect'], function (common, bonzo, bean, qwery, detect) {

    return function(items) {

        var _collectionType = bonzo(bonzo(items).parent()).attr('data-collection-type'),
            _renderToggle = function(items) {
                var button = bonzo.create('<button class="items__show-more">Show more news</button>')[0];
                bonzo(items).after(button);
                bean.on(button, 'click', function(e) {
                    // show x more, depending on current breakpoint
                    var rowSize = _getOptions(_collectionType).show,
                        moreHidden = qwery('.item.u-h', items).some(function(item, index) {
                            if (index === rowSize) {
                                return true;
                            }
                            bonzo(item).removeClass('u-h');
                        });
                    if (!moreHidden) {
                        bonzo(button).remove();
                    }
                });
            },
            _getOptions = function (collectionType) {
                var collectionOptions = {
                        wide: {
                            default: {
                                initial: 4,
                                show: 8
                            },
                            features: {
                                initial: 3,
                                show: 8
                            },
                            'popular-full-width': {
                                initial: 3,
                                show: 8
                            }
                        },
                        desktop: {
                            default: {
                                initial: 3,
                                show: 6
                            }
                        },
                        tablet: {
                            default: {
                                initial: 2,
                                show: 4
                            }
                        },
                        mobile: {
                            default: {
                                initial: 3,
                                show: 8
                            },
                            'small-stories': {
                                initial: 2,
                                show: 8
                            }
                        }
                    },
                    breakpointOptions = collectionOptions[detect.getBreakpoint()];
                return breakpointOptions[collectionType] || breakpointOptions['default'];
            };

        this.addShowMore = function() {
            var $overflowStories = common.$g('.item:nth-child(n + ' + (_getOptions(_collectionType).initial + 1) + ')', items);
            // hide stories
            $overflowStories.each(function(item) {
                bonzo(item).addClass('u-h item--headline');
            });
            // add toggle button, if we have hidden stories
            if ($overflowStories.length) {
                _renderToggle(items);
            }
        };


    };

});
