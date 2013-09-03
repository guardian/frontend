define(['common', 'ajax', 'bonzo'], function (common, ajax, bonzo) {

    var sectionTmpl =
        '<section class="section--popular">' +
            '<h2 class="section__title">Most Read</h2>' +
        '</section>',
        itemTmpl = '<li class="item"><a href="" class="item__link"></a></li>';

    var faciaPopular =  {

        // Initialise
        init:  function (config, context) {
            var hasSection = config.page && config.page.section && config.page.section !== 'global';
            return ajax({
                url: '/most-read' + (hasSection ? '/' + config.page.section : '') + '.json',
                type: 'json',
                crossOrigin: true
            }).then(
                function(resp) {
                    var $collection = bonzo(bonzo.create('<ul class="unstyled collection"></ul>')),
                        $trails = bonzo(bonzo.create(resp.html));
                    // create the items (from first 5 trails)
                    common.$g('#tabs-popular-1 li:nth-child(-n + 5) a', bonzo(bonzo.create(resp.html))).each(function(trail) {
                        var $trail = bonzo(trail),
                            $item = bonzo(bonzo.create(itemTmpl));
                        // update template
                        common.$g('.item__link', $item)
                            .attr('href', $trail.attr('href'))
                            .text($trail.text());
                        // add it to the collection
                        $item.appendTo($collection);
                    });
                    // add the popular section after the highlights
                    bonzo(bonzo.create(sectionTmpl))
                        .append($collection)
                        .insertAfter('.section--highlights');
                },
                function(req) {
                    common.mediator.emit('module:error', 'Failed to load facia popular: ' + req.statusText, 'modules/facia-popular.js');
                }
            );
        }

    };

    return faciaPopular;

});
