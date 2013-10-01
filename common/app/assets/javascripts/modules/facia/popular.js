define([
    'common',
    'ajax',
    'bonzo',
    'modules/facia/relativise-timestamp',
    'modules/facia/items-show-more'
], function (common, ajax, bonzo, RelativiseTimestamp, ItemsShowMore) {

    var updateTmpl = function(tmpl, trail) {
            return tmpl.replace(/@trail\.([A-Za-z.]*)/g, function(match, props) {
                return props.split('.').reduce(function(obj, prop) {
                    return obj[prop];
                }, trail);
            });
        },
        collectionTmpl =
            '<section class="collection collection--popular items--cards" data-collection-type="container" data-section="popular">' +
                '<h2 class="collection__title">Popular</h2>' +
            '</section>',
        itemTmpl  = function(trail) {
            return updateTmpl(
                '<li class="item">' +
                    '<h2 class="item__title"><a href="@trail.url" class="item__link">@trail.headline</a></h2>' +
                    '<p class="item__standfirst">@trail.trailText</p>' +
                    '<div class="item__meta item__meta--grey">' +
                        '<time class="item__timestamp js-item__timestamp" itemprop="datePublished" datetime="@trail.published.datetime" data-timestamp="@trail.published.unix">' +
                            '<i class="i"></i><span class="timestamp__text"></span>' +
                        '</time>' +
                    '</div>' +
                '</li>',
                trail
            );
        },
        imageTmpl = function(trail) {
            return updateTmpl(
                '<div class="item__image-container">' +
                    '<a href="@trail.url" class="item__link">' +
                        '<img class="item__image" alt="" src="@trail.mainPicture.path" />' +
                    '</a>' +
                '</div>',
                trail
            );
        };

    var popular =  {

        render:  function () {
            return ajax({
                url: '/most-read.json',
                type: 'json',
                crossOrigin: true
            }).then(
                function(resp) {
                    var $items = bonzo(bonzo.create('<ul class="unstyled items"></ul>'));
                    resp.fullTrails.forEach(function(trail) {
                        var $item = bonzo(bonzo.create(
                            itemTmpl(trail)
                        ));
                        // relativise timestamp
                        new RelativiseTimestamp(common.$g('.item__timestamp', $item))
                            .relativise();

                        // is there an image
                        if (trail.mainPicture) {
                            $item.addClass('item--with-image')
                                .append(imageTmpl(trail));
                        }

                        // add item to the items
                        $items.append($item);
                    });
                    // add the popular collection before the sports zone
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
