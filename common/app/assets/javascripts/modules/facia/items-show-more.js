define([
    'common',
    'bonzo',
    'bean',
    'qwery',
    'modules/detect',
    'modules/relativedates',
    'modules/facia/images'
], function (common, bonzo, bean, qwery, detect, relativeDates, faciaImages) {

    return function(items) {

        var _getInitialShowSize = function (collectionType) {
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
                        default: 3,
                        news: 6,
                        sport: 6,
                        commentisfree: 4,
                        culture: 4
                    },
                    mobile: {
                        default: 2,
                        news: 5,
                        sport: 5,
                        commentisfree: 3,
                        culture: 3,
                        popular: 5
                    }
                }[detect.getBreakpoint()];
                return breakpointOptions[collectionType] || breakpointOptions['default'];
            },
            _getShowMoreSize = function() {
                return {
                    wide: 8,
                    desktop: 6,
                    tablet: 6,
                    mobile: 5
                }[detect.getBreakpoint()];
            },
            _renderToggle = function($items, extraItems) {
                var buttonText = 'Show more',
                    $button = bonzo(bonzo.create(
                                        '<button class="items__show-more tone-background" data-link-name="' + buttonText + ' | 0">' +
                                            '<span class="i i-arrow-white-large">' +
                                                buttonText +
                                            '</span>' +
                                        '</button>'
                                    ))
                                  .insertAfter($items);
                bean.on($button[0], 'click', function(e) {
                    // increment button counter
                    var newDataAttr = $button.attr('data-link-name').replace(/^(.* | )(\d+)$/, function(match, prefix, count) {
                        // http://nicolaasmatthijs.blogspot.co.uk/2009/05/missing-radix-parameter.html
                        return prefix + (parseInt(count, 10) + 1);
                    });
                    $button.attr('data-link-name', newDataAttr);

                    // show x more, depending on current breakpoint
                    bonzo(extraItems.splice(0, _getShowMoreSize())).each(function(extraItem) {
                            relativeDates.init(extraItem);
                            $items.append(extraItem);
                        });

                    if (extraItems.length === 0) {
                        // listen to the clickstream, as happens later, before removing
                        common.mediator.on('module:clickstream:click', function(clickSpec) {
                            if (bonzo(clickSpec.target)[0] === $button[0]) {
                                $button.remove();
                            }
                        });
                    }
                });
            };

        this.addShowMore = function() {
            var $items = bonzo(items).removeClass('js-items--show-more'),
                extraItems = bonzo.create(
                    common.$g('.collection--template', items).html()
                ),
                initalShowSize = _getInitialShowSize($items.parent().attr('data-type'));

            // remove extras from dom
            common.$g('.collection--template', items).remove();
            // relativise dates
            extraItems

            // if we are showing more items than necessary, store them
            var excess = qwery('.item:nth-child(n+' + (initalShowSize + 1) + ')', items);
            extraItems = excess.concat(extraItems);
            bonzo(excess).remove();

            // if we are showing less items than necessary, show more
            bonzo(extraItems.splice(0, initalShowSize - qwery('.item', items).length))
                .appendTo($items);

            faciaImages.upgrade($items[0]);

            // add toggle button, if they are extra items left to show
            if (extraItems.length) {
                _renderToggle($items, extraItems);
            }
        };

    };

});
