define(['common', 'ajax', 'bonzo'], function (common, ajax, bonzo) {

    var collectionTmpl =
        '<section class="collection collection--popular-full-width">' +
            '<h2 class="collection__title">Popular</h2>' +
        '</section>',
        itemTmpl = '<li class="item"><a href="" class="item__link"></a></li>';

    var popular =  {

        render:  function () {
            return ajax({
                url: '/most-read.json',
                type: 'json',
                crossOrigin: true
            }).then(
                function(resp) {
                    var $items = bonzo(bonzo.create('<ul class="unstyled items"></ul>'));
                    bonzo(bonzo.create(resp.html)).each(function(trail) {
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
                        .append($items)
                        .insertAfter('.collection--small-stories');
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
