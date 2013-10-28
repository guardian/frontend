define([
    'common',
    'ajax',
    'bonzo',
    'modules/relativedates',
    'modules/facia/items-show-more'
], function (common, ajax, bonzo, relativeDates, ItemsShowMore) {

    var updateTmpl = function(tmpl, trail) {
            return tmpl.replace(/@trail\.([A-Za-z.]*)/g, function(match, props) {
                return props.split('.').reduce(function(obj, prop) {
                    return obj[prop];
                }, trail);
            });
        },
        collectionTmpl =
            '<section class="collection collection--popular tone-news" data-type="popular">' +
                '<h2 class="collection__title tone-background tone-accent-border">Popular</h2>' +
            '</section>',
        itemTmpl  = function(trail) {
            return updateTmpl(
                '<li class="item">' +
                    '<a href="@trail.url" class="item__link tone-accent-border"><h2 class="item__title">@trail.headline</h2></a>' +
                    '<div class="item__standfirst"><p>@trail.trailText</p></div>' +
                    '<div class="item__meta item__meta--grey">' +
                        '<time class="item__timestamp js-item__timestamp" itemprop="datePublished" datetime="@trail.published.datetime" data-timestamp="@trail.published.unix">' +
                            '<i class="i i-clock-light-grey"></i><span class="timestamp__text"></span>' +
                        '</time>' +
                    '</div>' +
                '</li>',
                trail
            );
        },
        imageTmpl = function(trail) {
            return updateTmpl(
                '<div class="item__image-container" data-src="@trail.itemPicture"></div>',
                trail
            );
        };

    return  {

        render:  function (config) {
            var hasSection = config.page && config.page.section && config.page.section !== 'global';
            return ajax({
                url: '/most-read' + (hasSection ? '/' + config.page.section : '') + '.json',
                type: 'json',
                crossOrigin: true
            }).then(
                function(resp) {
                    if (!resp || !resp.fullTrails || resp.fullTrails.length === 0) {
                        return;
                    }
                    var $items = bonzo(bonzo.create('<ul class="unstyled items"></ul>'));
                    resp.fullTrails.forEach(function(trail, index) {
                        var $item = bonzo(bonzo.create(
                            itemTmpl(trail)
                        ));

                        if (trail.itemPicture) {
                            common.$g('.item__link', $item).prepend(imageTmpl(trail));
                            $item.addClass('item--has-image');
                        } else {
                            $item.addClass('item--has-no-image');
                        }

                        // add item to the items
                        $items.append($item);
                    });
                    // add the popular collection before the last collection
                    bonzo(bonzo.create(collectionTmpl))
                        .append($items)
                        .insertAfter('.collection:last-child');
                    // add show more button
                    new ItemsShowMore($items[0])
                        .addShowMore();
                    // relativise timestamps
                    relativeDates.init($items[0]);
                    // upgrade image
                    require(['js!imager'], function() {
                        var images = common.toArray(document.querySelectorAll('.item__image-container'), $items[0]).filter(function(img) {
                                return bonzo(img).css('display') !== 'none';
                            }),
                            options = {
                                availableWidths: [ 140, 220, 300, 460, 620, 700 ],
                                strategy: 'container',
                                replacementDelay: 200
                            };
                        Imager.init(images, options);
                    });
                },
                function(req) {
                    common.mediator.emit(
                        'module:error',
                        'Failed to load facia popular: ' + req.statusText,
                        'modules/facia-popular.js'
                    );
                }
            );
        }

    };

});
