define(['common', 'bonzo', 'bean', 'qwery', 'modules/detect'], function (common, bonzo, bean, qwery, detect) {

    var TopStoriesShowMore = function(topStories) {

        var _button = bonzo.create('<button class="items__show-more">Show more news</button>')[0],
            _renderToggle = function(section) {
                bonzo(section).append(_button);
                bean.on(_button, 'click', function(e) {
                    // show x more, depending on current breakpoint
                    var rowSize = _getRowSize(),
                        moreHidden = qwery('.item.u-h', topStories).some(function(item, index) {
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
            _getRowSize = function () {
                switch (detect.getBreakpoint()) {
                    case 'wide':
                        return 4;
                    case 'desktop':
                        return 3;
                    case 'tablet':
                        return 2;
                    default:
                        return 1;
                }
            };

        var $overflowStories = common.$g('.item:nth-child(n + ' + (_getRowSize() + 1) + ')', topStories);
        // hide stories
        $overflowStories.each(function(item) {
            bonzo(item).addClass('u-h');
        });
        // add toggle button, if we have hidden stories
        if ($overflowStories.length) {
            _renderToggle(topStories);
        }

    };

    return TopStoriesShowMore;

});
