define(
    [
        'bean',
        'bonzo',
        'fastdom',
        'lib/$',
        'lib/detect',
        'lib/fetch',
        'lib/mediator',
        'lodash/utilities/template',
        'lodash/collections/toArray',
        'lib/proximity-loader',
        'lib/report-error',
        'common/modules/ui/relativedates',
        'facia/modules/ui/football-snaps',
        'lodash/functions/once',
        'lodash/collections/find',
    ],
    function(
        bean,
        bonzo,
        fastdom,
        $,
        detect,
        fetch,
        mediator,
        template,
        toArray,
        proximityLoader,
        reportError,
        relativeDates,
        FootballSnaps,
        once,
        find
    ) {
        var clientProcessedTypes = ['document', 'fragment', 'json.html'],
            snapIframes = [],
            bindIframeMsgReceiverOnce = once(function() {
                bean.on(window, 'message', function(event) {
                    var iframe = find(snapIframes, function(iframe) {
                        return iframe.contentWindow === event.source;
                    }),
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
            // First, init any existing inlined embeds already on the page.
            var inlinedSnaps = toArray($('.facia-snap-embed'));
            inlinedSnaps.forEach(initInlinedSnap);

            // Second, init non-inlined embeds.
            var snaps = toArray($('.js-snappable.js-snap'))
                .filter(function(el) {
                    var isInlinedSnap = $(el).hasClass('facia-snap-embed'),
                        snapType = el.getAttribute('data-snap-type');
                    return (
                        !isInlinedSnap &&
                        snapType &&
                        clientProcessedTypes.indexOf(snapType) > -1
                    );
                })
                .filter(function(el) {
                    return el.getAttribute('data-snap-uri');
                });

            snaps.forEach(initStandardSnap);
        }

        function addCss(el, isResize) {
            setSnapPoint(el, isResize);
            if ($(el).hasClass('facia-snap--football')) {
                FootballSnaps.resizeForFootballSnaps(el);
            }
        }

        function setSnapPoint(el, isResize) {
            var width,
                breakpoints,
                $el = bonzo(el),
                prefix = 'facia-snap-point--';

            breakpoints = [
                { width: 0, name: 'tiny' },
                { width: 180, name: 'mini' },
                { width: 220, name: 'small' },
                { width: 300, name: 'medium' },
                { width: 700, name: 'large' },
                { width: 940, name: 'huge' },
            ];

            fastdom.read(function() {
                width = el.offsetWidth;
            });

            fastdom.write(function() {
                breakpoints
                    .map(function(breakpoint, i, arr) {
                        var isAdd =
                            width >= breakpoint.width &&
                            (arr[i + 1] ? width < arr[i + 1].width : true);
                        breakpoint.action = isAdd
                            ? 'addClass'
                            : isResize ? 'removeClass' : false;
                        return breakpoint;
                    })
                    .filter(function(breakpoint) {
                        return breakpoint.action;
                    })
                    .forEach(function(breakpoint) {
                        $el[breakpoint.action](prefix + breakpoint.name);
                    });
            });
        }

        function injectIframe(el) {
            var spec = bonzo(el).offset(),
                minIframeHeight = Math.ceil((spec.width || 0) / 2),
                maxIframeHeight = 400,
                src = el.getAttribute('data-snap-uri'),
                height = Math.min(
                    Math.max(spec.height || 0, minIframeHeight),
                    maxIframeHeight
                ),
                containerEl = bonzo.create(
                    '<div style="width: 100%; height: ' +
                        height +
                        'px; ' +
                        'overflow: hidden; -webkit-overflow-scrolling:touch"></div>'
                )[0],
                iframe = bonzo.create(
                    '<iframe src="' +
                        src +
                        '" style="width: 100%; height: 100%; border: none;"></iframe>'
                )[0];

            bonzo(containerEl).append(iframe);
            snapIframes.push(iframe);
            bindIframeMsgReceiverOnce();

            fastdom.write(function() {
                bonzo(el).empty().append(containerEl);
            });
        }

        function fetchFragment(el, asJson) {
            fetch(el.getAttribute('data-snap-uri'), {
                mode: 'cors',
            })
                .then(function(resp) {
                    if (resp.ok) {
                        return asJson
                            ? resp.json().then(function(json) {
                                  return json.html;
                              })
                            : resp.text();
                    } else {
                        return Promise.reject(
                            new Error('Fetch error: ' + resp.statusText)
                        );
                    }
                })
                .then(function(resp) {
                    $.create(resp).each(function(html) {
                        fastdom.write(function() {
                            bonzo(el).html(html);
                        });
                    });
                    relativeDates.init(el);
                })
                .catch(function(ex) {
                    reportError(ex, { feature: 'snaps' });
                });
        }

        function initStandardSnap(el) {
            proximityLoader.add(el, 1500, function() {
                fastdom.write(function() {
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
                    mediator.on('window:throttledResize', function() {
                        addCss(el, true);
                    });
                }
            });
        }

        function initInlinedSnap(el) {
            addCss(el);
            if (!detect.isIOS) {
                mediator.on('window:throttledResize', function() {
                    addCss(el, true);
                });
            }
        }

        return {
            init: init,
        };
    }
);
