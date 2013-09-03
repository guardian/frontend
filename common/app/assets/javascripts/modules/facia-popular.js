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
                    // add the popular section after the highlights
                    bonzo(bonzo.create(containerTmpl)).insertAfter('.section--highlights');
                    // create the trails
                    var $trails = bonzo(bonzo.create(resp.html));
                    common.$g('#tabs-popular-1 li:nth-child(-n + 5) a', bonzo(bonzo.create(resp.html))).each(function(trail) {
                        var $trail = bonzo(trail),
                            $item = bonzo(bonzo.create(itemTmpl));
                        // update template
                        common.$g('.item__link', $item)
                            .attr('href', $trail.attr('href'))
                            .text($trail.text());
                        // add it to the section
                        $item.appendTo('.section--popular .collection');
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
