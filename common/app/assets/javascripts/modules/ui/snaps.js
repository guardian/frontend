define([
    'common/$',
    'bonzo',
    'common/utils/ajax',
    'common/utils/mediator',
    'common/utils/to-array'
], function(
    $,
    bonzo,
    ajax,
    mediator,
    toArray
) {

    function init(selector) {
        var snaps = toArray($(selector));

        if (!snaps.length) { return; }

        fetchSnaps(snaps);

        mediator.on('window:resize', function() {
            snaps.forEach(function(el) {
                setSnapPoint(el, true);
            });
        });
    }

    function setSnapPoint(el, isResize) {
        var width = el.offsetWidth,
            $el = bonzo(el),
            prefix = 'facia-snap-point--';

        [
            { width: 0,   name: 'tiny' },
            { width: 180, name: 'mini' },
            { width: 220, name: 'small' },
            { width: 300, name: 'medium' },
            { width: 700, name: 'large' }
        ]
        .map(function(breakpoint, i, arr) {
            var isAdd = !arr[i+1] || (width >= breakpoint.width && width < arr[i+1].width);

            breakpoint.action = isAdd ? 'addClass' : isResize ? 'removeClass' : false;
            return breakpoint;
        })
        .filter(function(breakpoint) {return breakpoint.action; })
        .forEach(function(breakpoint) {
            $el[breakpoint.action](prefix + breakpoint.name);
        });
    }

    function setSnapHtml(el, html) {
        bonzo(el).html(html);
    }

    function setSnapEmbedded(el) {
        bonzo(el).addClass('facia-snap-embed');
    }

    function fetchSnaps(snaps) {
        snaps
        .filter(function(el) { return el.getAttribute('data-snap-uri'); })
        .forEach(function(el) {
            ajax({
                url: el.getAttribute('data-snap-uri'),
                crossOrigin: true
            }).then(function(resp) {
                $.create(resp.html).each(function(html) {
                    setSnapEmbedded(el);
                    setSnapPoint(el);
                    setSnapHtml(el, html);
                });
            });
        });
    }

    return {
        init: init
    };
});
