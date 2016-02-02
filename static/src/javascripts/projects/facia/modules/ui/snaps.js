define([
    'bean',
    'bonzo',
    'fastdom',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/template',
    'common/utils/to-array',
    'common/utils/proximity-loader',
    'common/modules/ui/relativedates',
    'facia/modules/ui/football-snaps',
    'lodash/functions/once',
    'lodash/collections/find',
    'lodash/functions/debounce'
], function (
    bean,
    bonzo,
    fastdom,
    $,
    ajax,
    detect,
    mediator,
    template,
    toArray,
    proximityLoader,
    relativeDates,
    FootballSnaps,
    once,
    find,
    debounce
) {
    var clientProcessedTypes = ['document', 'fragment', 'json.html'],
        snapIframes = [],
        bindIframeMsgReceiverOnce = once(function () {
            bean.on(window, 'message', function (event) {
                var iframe = find(snapIframes, function (iframe) { return iframe.contentWindow === event.source; }),
                    message;
                if (iframe) {
                    message = JSON.parse(event.data);
                    if (message.type === 'set-height') {
                        bonzo(iframe).parent().css('height', message.value);
                    }
                }
            });
        });

    function init() {
        var snaps = toArray($('.js-snappable.js-snap'))
                .filter(function (el) {
                    var snapType = el.getAttribute('data-snap-type');
                    return snapType && clientProcessedTypes.indexOf(snapType) > -1;
                })
                .filter(function (el) { return el.getAttribute('data-snap-uri'); });

        snaps.forEach(initSnap);
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
            src = el.getAttribute('data-snap-uri'),
            height = Math.min(Math.max(spec.height || 0, minIframeHeight), maxIframeHeight),
            containerEl = bonzo.create('<div style="width: 100%; height: ' + height + 'px; ' +
                                        'overflow: hidden; -webkit-overflow-scrolling:touch"></div>')[0],
            iframe = bonzo.create('<iframe src="' + src + '" style="width: 100%; height: 100%; border: none;"></iframe>')[0];

        bonzo(containerEl).append(iframe);
        snapIframes.push(iframe);
        bindIframeMsgReceiverOnce();

        fastdom.write(function () {
            bonzo(el).empty().append(containerEl);
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

    function initSnap(el) {
        proximityLoader.add(el, 1500, function () {
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

            if (!detect.isIOS) {
                mediator.on('window:resize', debounce(function () {
                    addCss(el, true);
                }, 200));
            }
        });
    }

    return {
        init: init
    };
});
