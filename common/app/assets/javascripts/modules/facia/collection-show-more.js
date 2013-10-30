define([
    'common',
    'bonzo',
    'bean',
    'qwery',
    'modules/detect',
    'modules/relativedates',
    'modules/facia/images'
], function (common, bonzo, bean, qwery, detect, relativeDates, faciaImages) {

    return function(collection) {

        var _getInitialShowSize = function (collectionType) {
                var breakpointOptions = {
                    wide: {
                        default: 4,
                        news: 5,
                        comment: 5,
                        features: 3
                    },
                    desktop: {
                        default: 4,
                        news: 5,
                        comment: 5,
                        features: 3
                    },
                    tablet: {
                        default: 3,
                        news: 6,
                        comment: 4,
                        features: 4
                    },
                    mobile: {
                        default: 2,
                        news: 5,
                        comment: 3,
                        features: 3,
                        popular: 5
                    }
                }[detect.getBreakpoint()];
                return breakpointOptions[collectionType] || breakpointOptions['default'];
            },
            _getShowMoreSize = function() {
                return {
                    wide: 8,
                    desktop: 8,
                    tablet: 6,
                    mobile: 5
                }[detect.getBreakpoint()];
            },
            _renderToggle = function($collection, extraItems) {
                var buttonText = 'Show more',
                    $button = bonzo(bonzo.create(
                                        '<button class="collection__show-more tone-background" data-link-name="' + buttonText + ' | 0">' +
                                            '<span class="i i-arrow-white-large">' +
                                                buttonText +
                                            '</span>' +
                                        '</button>'
                                    ))
                                  .insertAfter($collection);
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
                            $collection.append(extraItem);
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
            var $collection = bonzo(collection).removeClass('js-collection--show-more'),
                extraItems = bonzo.create(
                    common.$g('.collection--template', collection).html()
                ),
                initalShowSize = _getInitialShowSize($collection.parent().attr('data-type'));

            // remove extras from dom
            common.$g('.collection--template', collection).remove();

            // if we are showing more items than necessary, store them
            var excess = qwery('.item:nth-child(n+' + (initalShowSize + 1) + ')', collection);
            extraItems = excess.concat(extraItems);
            bonzo(excess).remove();

            // if we are showing less items than necessary, show more
            bonzo(extraItems.splice(0, initalShowSize - qwery('.item', collection).length))
                .appendTo($collection);

            faciaImages.upgrade($collection[0]);

            // add toggle button, if they are extra items left to show
            if (extraItems.length) {
                _renderToggle($collection, extraItems);
            }
        };

    };

});
