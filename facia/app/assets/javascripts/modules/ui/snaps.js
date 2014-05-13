define([
    'common/$',
    'bonzo',
    'common/utils/ajax',
    'common/utils/mediator',
    'common/utils/template',
    'common/utils/to-array'
], function(
    $,
    bonzo,
    ajax,
    mediator,
    template,
    toArray
) {

    function init() {
        var snaps = toArray($('.facia-snap'))
                .filter(function(el) { return el.getAttribute('data-snap-uri'); })
                .filter(function(el) { return el.getAttribute('data-snap-type'); });

        snaps.forEach(fetchSnap);

        if (snaps.length) {
            mediator.on('window:resize', function() {
                snaps.forEach(function(el) { setSnapPoint(el, true); });
            });
        }
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
            var isAdd = width >= breakpoint.width && (arr[i+1] ? width < arr[i+1].width : true);

            breakpoint.action = isAdd ? 'addClass' : isResize ? 'removeClass' : false;
            return breakpoint;
        })
        .filter(function(breakpoint) { return breakpoint.action; })
        .forEach(function(breakpoint) {
            $el[breakpoint.action](prefix + breakpoint.name);
        });
    }

    function injectIframe(el) {
        // Wrapping iframe to fix iOS height-setting bug
        bonzo(el).html(template(
            '<div style="height:{{height}}px; overflow:none;">' +
                '<iframe src="{{src}}" style="height:{{height}}px; width: 100%; border: none;"></iframe>' +
            '</div>',
            {src: el.getAttribute('data-snap-uri'), height: 200}
        ));
    }

    function fetchFragment(el, asJson) {
        ajax({
            url: el.getAttribute('data-snap-uri'),
            type: asJson ? 'json' : 'html',
            crossOrigin: true
        }).then(function(resp) {
            $.create(asJson ? resp.html : resp).each(function(html) {
                bonzo(el).html(html);
            });
        });
    }

    function fetchSnap(el) {
        bonzo(el).addClass('facia-snap-embed');
        setSnapPoint(el);

        switch (el.getAttribute('data-snap-type')) {
            case 'document':
                injectIframe(el);
                break;

            case 'fragment':
                fetchFragment(el);
                break;

            case 'json.html':
                fetchFragment(el, true);
                break;
        }
    }

    return {
        init: init
    };
});
