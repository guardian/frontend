define([
    'bonzo',
    'fastdom',
    'lodash/functions/debounce',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/template',
    'common/utils/to-array',
    'common/modules/ui/relativedates',
    'facia/modules/ui/football-snaps'
], function (
    bonzo,
    fastdom,
    debounce,
    $,
    ajax,
    detect,
    mediator,
    template,
    toArray,
    relativeDates,
    FootballSnaps
) {
    var clientProcessedTypes = ['document', 'fragment', 'json.html'];

    function init() {
        var snaps = toArray($('.js-snappable.js-snap'))
                .filter(function (el) {
                    var snapType = el.getAttribute('data-snap-type');
                    return snapType && clientProcessedTypes.indexOf(snapType) > -1;
                })
                .filter(function (el) { return el.getAttribute('data-snap-uri'); });

        snaps.forEach(fetchSnap);

        if (snaps.length && !detect.isIOS) {
            mediator.on('window:resize', debounce(function () {
                snaps.forEach(function (el) { addCss(el, true); });
            }, 200));
        }
    }

    function addCss(el, isResize) {
        setSnapPoint(el, isResize);
        if ($(el).hasClass('facia-snap--football')) {
            FootballSnaps.resizeIfPresent(el);
        }
    }

    function setSnapPoint(el, isResize) {
        var width, breakpoints,
            $el = bonzo(el),
            prefix = 'facia-snap-point--';

        breakpoints = [
            { width: 0,   name: 'tiny' },
            { width: 180, name: 'mini' },
            { width: 220, name: 'small' },
            { width: 300, name: 'medium' },
            { width: 700, name: 'large' },
            { width: 940, name: 'huge' }
        ];

        fastdom.read(function () {
            width = el.offsetWidth;
        });

        fastdom.write(function () {
            breakpoints.map(function (breakpoint, i, arr) {
                var isAdd = width >= breakpoint.width && (arr[i + 1] ? width < arr[i + 1].width : true);
                breakpoint.action = isAdd ? 'addClass' : isResize ? 'removeClass' : false;
                return breakpoint;
            })
            .filter(function (breakpoint) { return breakpoint.action; })
            .forEach(function (breakpoint) {
                $el[breakpoint.action](prefix + breakpoint.name);
            });
        });
    }

    function injectIframe(el) {
        var spec = bonzo(el).offset(),
            minIframeHeight = Math.ceil((spec.width || 0) / 2),
            maxIframeHeight = 400,
            source = template( // Wrapping iframe to fix iOS height-setting bug
                '<div style="height:{{height}}px; overflow:hidden; width: 100%;">' +
                    '<iframe src="{{src}}" style="height:{{height}}px; width: 100%; border: none;"></iframe>' +
                '</div>',
                {src: el.getAttribute('data-snap-uri'), height: Math.min(Math.max(spec.height || 0, minIframeHeight), maxIframeHeight)}
            );

        fastdom.write(function () {
            bonzo(el).html(source);
        });
    }

    function fetchFragment(el, asJson) {
        ajax({
            url: el.getAttribute('data-snap-uri'),
            type: asJson ? 'json' : 'html',
            crossOrigin: true
        }).then(function (resp) {
            $.create(asJson ? resp.html : resp).each(function (html) {
                fastdom.write(function () {
                    bonzo(el).html(html);
                });
            });
            relativeDates.init(el);
        });
    }

    function fetchSnap(el) {
        fastdom.write(function () {
            bonzo(el).addClass('facia-snap-embed');
        });
        addCss(el);

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
