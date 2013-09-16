define(['common', 'bonzo', 'bean', 'qwery', 'modules/detect'], function (common, bonzo, bean, qwery, detect) {

    var TopStoriesShowMore = function(topStories) {

        var _button = bonzo.create('<button class="items__show-more">Show more news</button>')[0],
            _renderToggle = function(section) {
                bonzo(section).append(_button);
                bean.on(_button, 'click', function(e) {
                    // show x more, depending on current breakpoint
                    var rowSize = _getOptions().show,
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
            _getOptions = function () {
                switch (detect.getBreakpoint()) {
                    case 'wide':
                        return {
                            initial: 4,
                            show: 4
                        };
                    case 'desktop':
                        return {
                            initial: 3,
                            show: 3
                        };
                    case 'tablet':
                        return {
                            initial: 2,
                            show: 2
                        };
                    default:
                        return {
                            initial: 1,
                            show: 4
                        };
                }
            };

        var $overflowStories = common.$g('.item:nth-child(n + ' + (_getOptions().initial + 1) + ')', topStories);
        // hide stories
        $overflowStories.each(function(item) {
            bonzo(item).addClass('u-h item--headline');
        });
        // add toggle button, if we have hidden stories
        if ($overflowStories.length) {
            _renderToggle(topStories);
        }

    };

    return TopStoriesShowMore;

});
