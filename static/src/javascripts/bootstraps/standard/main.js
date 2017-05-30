// @flow

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
import { upgradePictures, listen } from 'common/modules/ui/images';
import { local as storage } from 'lib/storage';
import fetchJSON from 'lib/fetch-json';
import mediator from 'lib/mediator';
import checkMediator from 'common/modules/check-mediator';
import { addEventListener } from 'lib/events';
import identity from 'common/modules/identity/api';
import { removeCookie, addCookie } from 'lib/cookies';
import { getUrlVars } from 'lib/url';
import { catchErrorsWithContext } from 'lib/robust';
import { markTime } from 'lib/user-timing';
import config from 'lib/config';
import {
    newHeaderNavigationInit,
} from 'common/modules/navigation/newHeaderNavigation';
import { trackPerformance } from 'common/modules/analytics/google';
import debounce from 'lodash/functions/debounce';
import ophan from 'ophan/ng';

const setAdTestCookie = (): void => {
    const queryParams = getUrlVars();

    if (queryParams.adtest === 'clear') {
        removeCookie('adtest');
    } else if (queryParams.adtest) {
        addCookie('adtest', encodeURIComponent(queryParams.adtest), 10);
    }
};

const handleMembershipAccess = (): void => {
    const { membershipUrl, membershipAccess, contentId } = config.page;

    const redirect = (): void => {
        window.location.href = `${membershipUrl}/membership-content?referringContent=${contentId}&membershipAccess=${membershipAccess}`;
    };

    const updateDOM = (resp: Object): void => {
        const requireClass = 'has-membership-access-requirement';
        const requiresPaidTier = membershipAccess.includes('paid-members-only');
        // Check the users access matches the content
        const canViewContent = requiresPaidTier
            ? !!resp.tier && resp.isPaidTier
            : !!resp.tier;

        if (canViewContent) {
            const { body } = document;

            if (body) {
                fastdom.write(() => body.classList.remove(requireClass));
            }
        } else {
            redirect();
        }
    };

    if (identity.isUserLoggedIn()) {
        fetchJSON(`${membershipUrl}/user/me`, {
            mode: 'cors',
            credentials: 'include',
        })
            .then(updateDOM)
            .catch(redirect);
    } else {
        redirect();
    }
};

const addScrollHandler = (): void => {
    let scrollRunning: boolean = false;

    const onScroll = (): void => {
        if (!scrollRunning) {
            scrollRunning = true;
            fastdom.read(() => {
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

const addResizeHandler = (): void => {
    // Adds a global window:throttledResize event to mediator, which debounces events
    // until the user has stopped resizing the window for a reasonable amount of time.
    const onResize = (evt): void => {
        mediator.emitEvent('window:throttledResize', [evt]);
    };

    addEventListener(window, 'resize', debounce(onResize, 200), {
        passive: true,
    });
};

const addErrorHandler = (): void => {
    const oldOnError = window.onerror;
    window.onerror = (message, filename, lineno, colno, error) => {
        // Not all browsers pass the error object
        if (!error || !error.reported) {
            oldOnError.apply(window, arguments);
        }
    };

    // Report unhandled promise rejections
    // https://github.com/cujojs/when/blob/master/docs/debug-api.md#browser-window-events
    window.addEventListener('unhandledRejection', event => {
        const error = event.detail.reason;

        if (error && !error.reported) {
            raven.captureException(error);
        }
    });
};

const bootStandard = (): void => {
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
        fastdom.read, meaning they can all perform DOM reads for free
        (after the first one that needs layout triggers it).
        However, this means it's VITAL that all writes in callbacks are
        delegated to fastdom.
    */
    addErrorHandler();
    addScrollHandler();
    addResizeHandler();

    // Set adtest query if url param declares it
    setAdTestCookie();

    // Images
    upgradePictures();
    listen();

    // set local storage: gu.alreadyVisited
    if (window.guardian.isEnhanced) {
        const key = 'gu.alreadyVisited';
        const alreadyVisited = storage.get(key) || 0;
        storage.set(key, alreadyVisited + 1);
    }

    if (config.switches.blockIas && navigator.serviceWorker) {
        navigator.serviceWorker.ready.then(swreg => {
            const sw = swreg.active;
            const ias = window.location.hash.includes('noias');
            sw.postMessage({ ias });
        });
    }

    // initilaise the email/outbrain check mediator
    checkMediator.init();

    ophan.setEventEmitter(mediator);

    /*  Membership access
        Items with either of the following fields require Membership access
        - membershipAccess=members-only
        - membershipAccess=paid-members-only
        Authenticating requires CORS and withCredentials. If we don't cut the
        mustard then pass through.
    */
    if (config.page.requiresMembershipAccess) {
        handleMembershipAccess();
    }

    identity.init();

    newHeaderNavigationInit();

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
