define(['common', 'ajax', 'bonzo'], function (common, ajax, bonzo) {

    var collectionTmpl =
        '<section class="collection collection--popular">' +
            '<h2 class="collection__title">Most Read</h2>' +
        '</section>',
        itemTmpl = '<li class="item"><a href="" class="item__link"></a></li>';

    var CollectionPopular =  function(collection) {

        var _$collection = bonzo(collection);

        // Initialise
        this.render =  function () {
            var section = _$collection.attr('data-section');
            return ajax({
                url: '/most-read' + (section ? '/' + section : '') + '.json',
                type: 'json',
                crossOrigin: true
            }).then(
                function(resp) {
                    var $items = bonzo(bonzo.create('<ul class="unstyled items"></ul>')),
                        $trails = bonzo(bonzo.create(resp.html));
                    // create the items (from first 5 trails)
                    common.$g('#tabs-popular-1 li:nth-child(-n + 5) a', $trails).each(function(trail) {
                        var $trail = bonzo(trail),
                            $item = bonzo(bonzo.create(itemTmpl));
                        // update template
                        common.$g('.item__link', $item)
                            .attr('href', $trail.attr('href'))
                            .text($trail.text());
                        // add it to the collection
                        $item.appendTo($items);
                    });
                    // add the popular collection after
                    bonzo(bonzo.create(collectionTmpl))
                        .addClass('collection--' + section + '-section')
                        .append($items)
                        .insertBefore(_$collection);

                    _$collection.addClass('collection--with-popular');
                },
                function(req) {
                    common.mediator.emit(
                        'module:error',
                        'Failed to load facia collection popular: ' + req.statusText,
                        'modules/facia-collection-popular.js'
                    );
                }
            );
        };

    };

    return CollectionPopular;

});
