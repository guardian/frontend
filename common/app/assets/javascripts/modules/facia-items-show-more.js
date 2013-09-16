define(['common', 'bonzo', 'bean', 'qwery', 'modules/detect'], function (common, bonzo, bean, qwery, detect) {

    var ItemsShowMore = function(items) {

        var _collectionType = bonzo(bonzo(items).parent()).attr('data-collection-type'),
            _button = bonzo.create('<button class="items__show-more">Show more news</button>')[0],
            _renderToggle = function(items) {
                bonzo(items).after(_button);
                bean.on(_button, 'click', function(e) {
                    // show x more, depending on current breakpoint
                    var rowSize = _getOptions(_collectionType).show,
                        moreHidden = qwery('.item.u-h', items).some(function(item, index) {
                            if (index === rowSize) {
                                return true;
                            }
                            bonzo(item).removeClass('u-h');
                        });
                    if (!moreHidden) {
                        bonzo(_button).remove();
                    }
                });
            },
            _collectionOptions = {
                wide: {
                    highlights: {
                        initial: 3,
                        show: 4
                    },
                    features: {
                        initial: 4,
                        show: 4
                    },
                    'small-stories': {
                        initial: 4,
                        show: 4
                    }
                },
                desktop: {
                    highlights: {
                        initial: 2,
                        show: 3
                    },
                    features: {
                        initial: 3,
                        show: 3
                    },
                    'small-stories': {
                        initial: 3,
                        show: 3
                    }
                },
                tablet: {
                    highlights: {
                        initial: 1,
                        show: 2
                    },
                    features: {
                        initial: 2,
                        show: 2
                    },
                    'small-stories': {
                        initial: 2,
                        show: 2
                    }
                },
                mobile: {
                    highlights: {
                        initial: 3,
                        show: 4
                    },
                    features: {
                        initial: 3,
                        show: 4
                    },
                    'small-stories': {
                        initial: 1,
                        show: 4
                    }
                }
            },
            _getOptions = function (collectionType) {
                return _collectionOptions[detect.getBreakpoint()][collectionType];
            };

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

    return ItemsShowMore;

});
