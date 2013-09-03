define(['common', 'bonzo', 'bean', 'qwery'], function (common, bonzo, bean, qwery) {

    var TopStoriesShowMore = function(topStories) {

        function _renderToggle(section) {
            bonzo(section).append(_button);
            bean.on(_button, 'click', function(e) {
                // show x more, depending on current breakpoint
                var rowSize = _getRowSize(),
                    moreHidden = qwery('.item.h', topStories).some(function(item, index) {
                        if (index === rowSize) {
                            return true;
                        }
                        bonzo(item).removeClass('h');
                    });
                if (!moreHidden) {
                    bonzo(_button).remove();
                }
            });
        }

        function _getRowSize() {
            switch (common.$g('.breakpoint').css('font-family')) {
                case 'mobile':
                    return 1;
                case 'tablet':
                case 'desktop':
                    return 3;
                default:
                    return 4;
            }
        }

        var _button = bonzo.create('<button class="collection__show-more">Show more news</button>')[0];

        // hide stories
        common.$g('.item:nth-child(n + ' + ((_getRowSize() * 2) + 1) + ')', topStories).each(function(item) {
            bonzo(item).addClass('h');
        });

        // add toggle button
        _renderToggle(topStories);
    };

    return TopStoriesShowMore;

});
