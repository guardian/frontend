define(['common', 'ajax', 'bonzo'], function (common, ajax, bonzo) {

    var containerTmpl =
        '<section class="section--popular">' +
            '<h2 class="section__title">Most Read</h2>' +
            '<ul class="unstyled collection"></ul>' +
        '</section>',
        itemTmpl = '<li class="item"><a href="" class="item__link"></a></li>';

    var faciaPopular =  {

        // Initialise
        init:  function (config, context) {
            return ajax({
                url: '/most-read/sport.json?_edition=UK',
                type: 'json',
                crossOrigin: true
            }).then(
                function(resp) {
                    var section = bonzo(bonzo.create(containerTmpl)).insertAfter('.section--highlights');
                    resp.trails.slice(0, 5).forEach(function(itemHref) {
                        var item = bonzo(bonzo.create(itemTmpl));
                        // update template
                        common.$g('.item__link', item)
                            .attr('href', itemHref)
                            .text(itemHref.split('/').pop().replace(/-/g, ' '));
                        item.appendTo('.section--popular .collection');
                    });
                },
                function(req) {
                    common.mediator.emit('module:error', 'Failed to load facia popular: ' + req.statusText, 'modules/facia-popular.js');
                }
            );
        }

    };

    return faciaPopular;

});
