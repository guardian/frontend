define([
    'common',
    'ajax',
    'bonzo',
    'modules/facia/relativise-timestamp',
    'modules/facia/items-show-more',
    'modules/facia/image-upgrade',
], function (common, ajax, bonzo, RelativiseTimestamp, ItemsShowMore, ImageUpgrade) {

    var updateTmpl = function(tmpl, trail) {
            return tmpl.replace(/@trail\.([A-Za-z.]*)/g, function(match, props) {
                return props.split('.').reduce(function(obj, prop) {
                    return obj[prop];
                }, trail);
            });
        },
        collectionTmpl =
            '<section class="collection collection--popular tone-news" data-collection-type="container" data-section="popular">' +
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
                '<div class="item__image-container">' +
                    '<img class="item__image" alt="" data-src="@trail.mainPicture.item"  data-src-main="@trail.mainPicture.itemMain" data-src-mobile="@trail.mainPicture.itemMobile"  data-src-main-mobile="@trail.mainPicture.itemMainMobile" />' +
                '</div>',
                trail
            );
        };

    var popular =  {

        render:  function (config) {
            var hasSection = config.page && config.page.section !== 'global';
            return ajax({
                url: '/most-read' + (hasSection ? '/' + config.page.section : '') + '.json',
                type: 'json',
                crossOrigin: true
            }).then(
                function(resp) {
                    if (resp.fullTrails.length === 0) {
                        return;
                    }
                    var $items = bonzo(bonzo.create('<ul class="unstyled items"></ul>'));
                    resp.fullTrails.forEach(function(trail, index) {
                        var $item = bonzo(bonzo.create(
                            itemTmpl(trail)
                        ));
                        // relativise timestamp
                        new RelativiseTimestamp(common.$g('.item__timestamp', $item))
                            .relativise();

                        // only show images for the first 3 items
                        if (index < 3 && trail.mainPicture) {
                            common.$g('.item__link', $item).prepend(imageTmpl(trail));
                            if (index < 3) {
                                new ImageUpgrade($item[0], index === 0)
                                    .upgrade();
                            }
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

    return popular;

});
