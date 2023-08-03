/*
   This file is intended to be downloaded and run ASAP on all pages by all
   readers.

   While it's ok to run code from here that requires specific host capabilities, it
   should manage failing gracefully by itself.

   Assume *nothing* about the host...

   This also means you should think *very hard* before adding modules to it,
   in particular 3rd party modules.

   For this file, performance and breadth of support should take priority over *anything* …
*/

import fastdom from 'fastdom';
import raven from 'lib/raven';
import userPrefs from 'common/modules/user-prefs';
import { storage } from '@guardian/libs';
import { fetchJson } from 'lib/fetch-json';
import { mediator } from 'lib/mediator';
import { addEventListener } from 'lib/events';
import { addCookie } from 'lib/cookies';
import { catchErrorsWithContext } from 'lib/robust';
import { markTime } from 'lib/user-timing';
import { isBreakpoint } from 'lib/detect';
import config from 'lib/config';
import { init as initDynamicImport } from 'lib/dynamic-import-init';
import { newHeaderInit } from 'common/modules/navigation/new-header';
import { headerTopNavInit } from 'common/modules/navigation/header-top-nav';
import { fixSecondaryColumn } from 'common/modules/fix-secondary-column';
import { trackPerformance } from 'common/modules/analytics/google';
import debounce from 'lodash/debounce';
import ophan from 'ophan/ng';
import { initAtoms } from './atoms';
import { initEmbedResize } from "./emailEmbeds";
import { setAdFreeCookie, AdFreeCookieReasons } from 'lib/manage-ad-free-cookie';

const showHiringMessage = () => {
    try {
        if (!config.get('page.isDev') && config.get('switches.weAreHiring')) {
            window.console.log(
                '\n' +
                    '%cHello.\n' +
                    '\n' +
                    '%cWe are hiring – ever thought about joining us? \n' +
                    '%chttps://workforus.theguardian.com/careers/product-engineering%c \n' +
                    '\n',
                'font-family: Georgia, serif; font-size: 32px; color: #052962',
                'font-family: Georgia, serif; font-size: 16px; color: #767676',
                'font-family: Helvetica Neue, sans-serif; font-size: 11px; text-decoration: underline; line-height: 1.2rem; color: #767676',
                ''
            );
        }
    } catch (e) {
        /* do nothing */
    }
};

const addScrollHandler = () => {
    let scrollRunning = false;

    const onScroll = () => {
        if (!scrollRunning) {
            scrollRunning = true;
            fastdom.measure(() => {
                mediator.emitEvent('window:throttledScroll');
                scrollRunning = false;
            });
        }
    };

    // #? is still still needed?
    addEventListener(
        window,
        'scroll',
        userPrefs.get('use-idle-callback') && 'requestIdleCallback' in window
            ? () => {
                  window.requestIdleCallback(onScroll);
              }
            : onScroll,
        { passive: true }
    );
};

const addResizeHandler = () => {
    // Adds a global window:throttledResize event to mediator, which debounces events
    // until the user has stopped resizing the window for a reasonable amount of time.
    const onResize = (evt) => {
        mediator.emitEvent('window:throttledResize', [evt]);
    };

    addEventListener(window, 'resize', debounce(onResize, 200), {
        passive: true,
    });
};

const addErrorHandler = () => {
    const oldOnError = window.onerror;
    window.onerror = (message, filename, lineno, colno, error) => {
        // Not all browsers pass the error object
        if (!error || !error.reported) {
            oldOnError.apply(window, arguments);
        }
    };

    // Report unhandled promise rejections
    window.addEventListener('unhandledrejection', event => {
        const error = event.reason;

        if (error && !error.reported) {
            raven.captureException(error);
        }
    });
};

const bootStandard = () => {

    markTime('standard start');

    catchErrorsWithContext([
        [
            'ga-user-timing-standard-start',
            () => {
                trackPerformance(
                    'Javascript Load',
                    'standardStart',
                    'Standard start parse time'
                );
            },
        ],
    ]);

    /*
        Add global pooled event listeners
        CAUTION: those are *passive*, which means calls to event.preventDefault
        will be ignored

        Adds a global window:throttledScroll event to mediator, which throttles
        scroll events until there's a spare animationFrame.
        Callbacks of all listeners to window:throttledScroll are run in a
        fastdom.measure, meaning they can all perform DOM reads for free
        (after the first one that needs layout triggers it).
        However, this means it's VITAL that all writes in callbacks are
        delegated to fastdom.
    */
    addErrorHandler();
    addScrollHandler();
    addResizeHandler();

    // polyfill dynamic import
    initDynamicImport();

    // set a short-lived cookie to trigger server-side ad-freeness
    // if the user is genuinely ad-free, this one will be overwritten
    // in user-features
    if (window.location.hash.match(/[#&]noadsaf(&.*)?$/)) {
        // Sets a short-lived cookie to trigger server-side ad-freeness
        setAdFreeCookie(AdFreeCookieReasons.ForceAdFree, 1);
    }

    // set local storage: gu.alreadyVisited
    if (window.guardian.isEnhanced) {
        const key = 'gu.alreadyVisited';
        const alreadyVisited = parseInt(storage.local.getRaw(key), 10) || 0;
        storage.local.setRaw(key, alreadyVisited + 1);
    }

    ophan.setEventEmitter(mediator);

    if(window.guardian.config.switches.headerTopNav
        && document.querySelector('.header-top-nav')
        ) {
        headerTopNavInit();
    } else {
        newHeaderInit();
    }

    const isAtLeastLeftCol = isBreakpoint({ min: 'leftCol' });

    // we only need to fix the secondary column from leftCol breakpoint up
    if (config.get('page.hasShowcaseMainElement') && isAtLeastLeftCol) {
        fixSecondaryColumn();
    }

    initAtoms();

    initEmbedResize();

    showHiringMessage();

    markTime('standard end');

    catchErrorsWithContext([
        [
            'ga-user-timing-standard-end',
            () => {
                trackPerformance(
                    'Javascript Load',
                    'standardEnd',
                    'Standard end parse time'
                );
            },
        ],
    ]);
};

export { bootStandard };
