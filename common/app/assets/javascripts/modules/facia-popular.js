define([
    'common',
    'ajax',
    'bonzo',
    'modules/facia-relativise-timestamp',
    'modules/facia-items-show-more'
], function (common, ajax, bonzo, RelativiseTimestamp, ItemsShowMore) {

    var collectionTmpl =
        '<section class="collection collection--popular-full-width" data-collection-type="popular-full-width">' +
            '<h2 class="collection__title">Popular</h2>' +
        '</section>',
        itemTmpl  =
            '<li class="item">' +
                '<h2 class="item__title"><a href="" class="item__link"></a></h2>' +
                '<div class="item__meta item__meta--grey">' +
                    '<time class="item__timestamp js-item__timestamp" itemprop="datePublished" datetime="" data-timestamp="">' +
                        '<i class="i"></i><span class="timestamp__text"></span>' +
                    '</time>' +
                '</div>' +
            '</li>',
        imageTmpl = '<div class="item__image-container"><a href="" class="item__link"><img class="item__image" alt="" src="" /></a></div>';

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
                        var $item = bonzo(bonzo.create(itemTmpl));
                        // update template
                        common.$g('.item__link', $item)
                            .attr('href', trail.url)
                            .text(trail.headline);
                        var timestamp = common.$g('.item__timestamp', $item)
                            .attr('data-timestamp', trail.published.unix)
                            .attr('datetime', trail.published.datetime);
                        // relativise timestamp
                        new RelativiseTimestamp(timestamp).relativise();
                        // is there an image
                        if (trail.mainPicture) {
                            var $image = bonzo(bonzo.create(imageTmpl));
                            // update template
                            common.$g('.item__link', $image)
                                .attr('href', trail.url);
                            common.$g('.item__image', $image)
                                .attr('src', trail.mainPicture.path);
                            $item.append($image);
                        }
                        // add it to the collection
                        $item.appendTo($items);
                    });
                    // add the popular collection after
                    bonzo(bonzo.create(collectionTmpl))
                        .append($items)
                        .insertBefore('.collection--news.collection--sport-section');
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
