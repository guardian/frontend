import bean from 'bean';
import bonzo from 'bonzo';
import fastdom from 'fastdom';
import $ from 'lib/$';
import { isIOS } from 'lib/detect';
import { mediator } from 'lib/mediator';
import { addProximityLoader } from 'lib/proximity-loader';
import { reportError } from 'lib/report-error';
import { init as initRelativeDates } from 'common/modules/ui/relativedates';
import { resizeForFootballSnaps } from 'facia/modules/ui/football-snaps';
import once from 'lodash/once';

const clientProcessedTypes = ['document', 'fragment', 'json.html'];
const snapIframes = [];
const bindIframeMsgReceiverOnce = once(() => {
    bean.on(window, 'message', event => {
        const iframe = snapIframes.find(
            snapIframe => snapIframe.contentWindow === event.source
        );

        let message;
        if (iframe) {
            message = JSON.parse(event.data);

            if (message.type === 'set-height') {
                bonzo(iframe)
                    .parent()
                    .css('height', message.value);
            }
        }
    });
});

const setSnapPoint = (el, isResize) => {
    let width;
    const $el = bonzo(el);
    const prefix = 'facia-snap-point--';
    const breakpoints = [
        {
            width: 0,
            name: 'tiny',
        },
        {
            width: 180,
            name: 'mini',
        },
        {
            width: 220,
            name: 'small',
        },
        {
            width: 300,
            name: 'medium',
        },
        {
            width: 700,
            name: 'large',
        },
        {
            width: 940,
            name: 'huge',
        },
    ];

    fastdom.measure(() => {
        width = el.offsetWidth;
    });

    fastdom.mutate(() => {
        breakpoints
            .map((breakpoint, i, arr) => {
                const isAdd =
                    width >= breakpoint.width &&
                    (arr[i + 1] ? width < arr[i + 1].width : true);

                if (isAdd) {
                    breakpoint.action = 'addClass';
                } else if (isResize) {
                    breakpoint.action = 'removeClass';
                } else {
                    breakpoint.action = false;
                }

                return breakpoint;
            })
            .filter(breakpoint => breakpoint.action)
            .forEach(breakpoint => {
                $el[breakpoint.action](prefix + breakpoint.name);
            });
    });
};

const addCss = (el, isResize = false) => {
    setSnapPoint(el, isResize);
    if ($(el).hasClass('facia-snap--football')) {
        resizeForFootballSnaps(el);
    }
};

const injectIframe = (el) => {
    const spec = bonzo(el).offset();
    const minIframeHeight = Math.ceil((spec.width || 0) / 2);
    const maxIframeHeight = 400;
    const src = el.getAttribute('data-snap-uri') || '';
    const height = Math.min(
        Math.max(spec.height || 0, minIframeHeight),
        maxIframeHeight
    );
    const containerEl = bonzo.create(
        `<div style="width: 100%; height: ${height}px; overflow: hidden; -webkit-overflow-scrolling:touch"></div>`
    )[0];
    const iframe = bonzo.create(
        `<iframe src="${src}" style="width: 100%; height: 100%; border: none;"></iframe>`
    )[0];

    bonzo(containerEl).append(iframe);
    snapIframes.push(iframe);
    bindIframeMsgReceiverOnce();

    fastdom.mutate(() => {
        bonzo(el)
            .empty()
            .append(containerEl);
    });
};

const fetchFragment = (el, asJson = false) => {
    const url = el.getAttribute('data-snap-uri');

    if (!url) {
        return;
    }

    fetch(url, {
        mode: 'cors',
    })
        .then(resp => {
            if (resp.ok) {
                return asJson
                    ? resp.json().then(json => json.html)
                    : resp.text();
            }
            return Promise.reject(new Error(`Fetch error: ${resp.statusText}`));
        })
        .then(resp => {
            $.create(resp).each(html => {
                fastdom.mutate(() => {
                    bonzo(el).html(html);
                });
            });
            initRelativeDates(el);
        })
        .catch(ex => {
            reportError(ex, {
                feature: 'snaps',
            });
        });
};

const initStandardSnap = (el) => {
    addProximityLoader(el, 1500, () => {
        fastdom.mutate(() => {
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

            default:
                break;
        }

        if (!isIOS) {
            mediator.on('window:throttledResize', () => {
                addCss(el, true);
            });
        }
    });
};

const initInlinedSnap = (el) => {
    addCss(el);
    if (!isIOS) {
        mediator.on('window:throttledResize', () => {
            addCss(el, true);
        });
    }
};

const init = () => {
    // First, init any existing inlined embeds already on the page.
    const inlinedSnaps = Array.from(
        document.querySelectorAll('.facia-snap-embed')
    );
    inlinedSnaps.forEach(initInlinedSnap);

    // Second, init non-inlined embeds.
    const snaps = Array.from(document.querySelectorAll('.js-snappable.js-snap'))
        .filter(el => {
            const isInlinedSnap = $(el).hasClass('facia-snap-embed');
            const snapType = el.getAttribute('data-snap-type');

            return (
                !isInlinedSnap &&
                snapType &&
                clientProcessedTypes.indexOf(snapType) > -1
            );
        })
        .filter(el => el.getAttribute('data-snap-uri'));

    snaps.forEach(initStandardSnap);
};

export { init };
