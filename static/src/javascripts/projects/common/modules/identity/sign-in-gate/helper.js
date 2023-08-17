import bean from 'bean';
import userPrefs from 'common/modules/user-prefs';
import { storage } from '@guardian/libs';
import config from 'lib/config';
import {
    getSynchronousTestsToRun,
    isInABTestSynchronous,
} from 'common/modules/experiments/ab';
import { isUserLoggedIn } from 'common/modules/identity/api';
import { cmp } from '@guardian/consent-management-platform';
import { submitClickEventTracking } from './component-event-tracking';

// Helper for setGatePageTargeting function
const setGoogleTargeting = (canShow) => {
    if (window.googletag) {
        window.googletag.cmd.push(() => {
            window.googletag
                .pubads()
                .setTargeting('gate', canShow.toString().slice(0, 1)); // must be a short string so we slice to "t"/"f"/"d"/"s"
        });
    }
};

// We use this key for storing the gate dismissed count against
const localStorageDismissedCountKey = (variant, name) => `gate-dismissed-count-${name}-${variant}`;

const retrieveDismissedCount = (
    variant,
    name,
    componentName
) => {
    try {
        const prefs = userPrefs.get(componentName) || {};
        const dismissed = prefs[localStorageDismissedCountKey(variant, name)];

        if (Number.isFinite(dismissed)) {
            return dismissed;
        }
        return 0;
    } catch (error) {
        return 0;
    }
};

// wrapper over isInABTestSynchronous
export const isInTest = test => isInABTestSynchronous(test);

// when running multiple tests simultaneously to test the component, we need to get
// which test the user is in, so that we can check and display the correct logic for that test
export const getTestforMultiTest = tests =>
    tests.reduce((acc, test) => {
        const checkTest = getSynchronousTestsToRun().find(
            t => t.id === test.id
        );
        if (checkTest) return checkTest;
        return acc;
    }, undefined);

// get the current variant id the user is in
export const getVariant = test => {
    //  get the current test
    const currentTest = getSynchronousTestsToRun().find(t => t.id === test.id);

    // get variant user is in for the test
    return currentTest ? currentTest.variantToRun.id : '';
};

// set in user preferences that the user has dismissed the gate, set the value to the current ISO date string
// name is optional, but can be used to differentiate between multiple sign in gate tests
export const setUserDismissedGate = ({ name = '', variant, componentName }) => {
    const prefs = userPrefs.get(componentName) || {};
    prefs[`${name ? `${name}-` : ''}${variant}`] = new Date().toISOString();
    userPrefs.set(componentName, prefs);
};

// delete from user preferences that the user has previously dismissed the gate
// name is optional, but can be used to differentiate between multiple sign in gate tests
export const unsetUserDismissedGate = ({ componentName }) => {
    userPrefs.remove(componentName);
};

// check if the user has dismissed the gate by checking the user preferences,
// name is optional, but can be used to differentiate between multiple sign in gate tests
export const hasUserDismissedGate = ({ name = '', componentName, variant }) => {
    const prefs = userPrefs.get(componentName) || {};

    return !!prefs[`${name ? `${name}-` : ''}${variant}`];
};

// check if the user has dismissed the gate within a given timeframe
export const hasUserDismissedGateInWindow = ({ window, name = '', componentName, variant }) => {
    const prefs = userPrefs.get(componentName) || {};
    if (!prefs[`${name ? `${name}-` : ''}${variant}`]) {
        return false;
    }

    const dismissalTZ = Date.parse(
        prefs[`${name ? `${name}-` : ''}${variant}`]
    );

    const dismissalWindows = {
        day: 24,
        dev: 0.05, // 3 min for testing
    };
    const hours = (Date.now() - dismissalTZ) / 36e5; //  36e5 is the scientific notation for 60*60*1000, which converts the milliseconds difference into hours.

    if (hours >= dismissalWindows[window]) {
        unsetUserDismissedGate({ componentName }); // clears the dismissal
        return false;
    }

    return true;
};

// Test whether the user has dismissed the gate variant more than `count` times
export const hasUserDismissedGateMoreThanCount = (
    variant,
    name,
    componentName,
    count
) => retrieveDismissedCount(variant, name, componentName) > count;

// Increment the number of times a user has dismissed this gate variant
export const incrementUserDismissedGateCount = (
    variant,
    name,
    componentName
) => {
    try {
        const prefs = userPrefs.get(componentName) || {};
        prefs[localStorageDismissedCountKey(variant, name)] = retrieveDismissedCount(variant, name, componentName) + 1;
        userPrefs.set(componentName, prefs);
    } catch (error) {
        // localstorage isn't available so show the gate
    }
};

// Dynamically sets the gate custom parameter for Google ad request page targeting
export const setGatePageTargeting = (
    isGateDismissed,
    canShowCheck
) => {
    isUserLoggedIn().then(isLoggedIn => {
        if (isLoggedIn) {
            setGoogleTargeting('signed in');
        } else if (isGateDismissed) {
            setGoogleTargeting('dismissed');
        } else {
            setGoogleTargeting(canShowCheck);
        }
    })
};

// use the dailyArticleCount from the local storage to see how many articles the user has viewed in a day
// in our case if this is the n-numbered article or higher the user has viewed then set the gate
export const isNPageOrHigherPageView = (n = 2) => {
    // get daily read article count array from local storage
    const dailyArticleCount = storage.local.get('gu.history.dailyArticleCount') || [];

    // get the count from latest date, if it doesnt exist, set to 0
    const { count = 0 } = dailyArticleCount[0] || {};

    // check if count is greater or equal to 1 less than n since dailyArticleCount is incremented after this component is loaded
    return count >= n - 1;
};

// determine if the useragent is running iOS 9 (known to be buggy for sign in flow)
export const isIOS9 = () => {
    // get the browser user agent
    const ua = navigator.userAgent;
    // check useragent if the device is an iOS device
    const appleDevice = /(iPhone|iPod|iPad)/i.test(ua);
    // check useragent if the os is version 9
    const os = /(CPU OS 9_)/i.test(ua);

    // if both true, then it's an apple ios 9 device
    return appleDevice && os;
};

// hide the sign in gate on article types that are not supported
// add to the include parameter array if there are specific types that should be included/overridden
export const isInvalidArticleType = (include = []) => {
    // uses guardian config object to check for these page types
    const invalidTypes = [
        'isColumn',
        'isFront',
        'isHosted',
        'isImmersive',
        'isLive',
        'isLiveBlog',
        'isNumberedList',
        'isPaidContent',
        'isPhotoEssay',
        'isSensitive',
        'isSplash',
        'isPodcast',
    ];

    return invalidTypes
        .filter(el => !include.includes(el))
        .reduce((isArticleInvalid, type) => {
            if (isArticleInvalid) return true;

            return config.get(`page.${type}`);
        }, false);
};

// hide the sign in gate on certain sections of the site, e.g info, about, help etc.
// add to the include parameter array if there are specific types that should be included/overridden
export const isInvalidSection = (include = []) => {
    const invalidSections = [
        'about',
        'info',
        'membership',
        'help',
        'guardian-live-australia',
        'gnm-archive',
    ];

    return invalidSections
        .filter(el => !include.includes(el))
        .reduce((isSectionInvalid, section) => {
            if (isSectionInvalid) return true;

            // looks up window.guardian.config object in the browser console
            return config.get(`page.section`) === section;
        }, false);
};

// hide the sign in gate for certain tags on the site
// add to the include parameter array if there are specific tags that should be included/overridden
export const isInvalidTag = (include = []) => {
    const invalidTags = [
        'info/newsletter-sign-up'
    ];

    return invalidTags
        .filter(el => !include.includes(el))
        .some((tag) => String(config.get(`page.keywordIds`) ?? "")
            .split(',')
            .includes(tag));
};

// html event wrapper using bean
export const addEventHandler = ({ element, event, selector, handler }) => {
    bean.on(element, event, selector, handler);
};

// click event wrapper using addEventHandler method
export const addClickHandler = ({
    element,
    selector,
    component,
    abTest,
    value,
    callback = () => {},
}) => {
    addEventHandler({
        element,
        event: 'click',
        selector,
        handler: () => {
            submitClickEventTracking({
                component,
                abTest,
                value,
            });

            return callback();
        },
    });
};

// shows the CMP (consent management platform) module
export const showPrivacySettingsCMPModule = () => {
    if (config.get('switches.consentManagement', true)) {
        cmp.showPrivacyManager();
    }
};

// add extra css on a given selector on an opinion page
export const addCSSOnOpinion = ({ element, selector, css }) => {
    if (config.get(`page.tones`) === 'Comment') {
        const selection = element.querySelector(selector);
        if (selection) {
            selection.classList.add(css);
        }
    }
};

// add the background color if the page the user is on is the opinion section
export const addOpinionBgColour = ({ element, selector }) => {
    if (config.get(`page.tones`) === 'Comment') {
        const overlay = element.querySelector(selector);
        if (overlay) {
            overlay.classList.add(
                'signin-gate__first-paragraph-overlay--comment'
            );
        }
    }
};

// change the colour of the text depending the pillar that the user is on
export const addPillarColour = ({ element, selector }) => {
    // check page type/pillar to change text colour of the sign in gate
    const paragraphText = element.querySelector(selector);
    if (paragraphText) {
        switch (config.get(`page.pillar`)) {
            case 'News':
                paragraphText.classList.add(`signin-gate__benefits--text-news`);
                break;
            case 'Opinion':
                paragraphText.classList.add(
                    `signin-gate__benefits--text-comment`
                );
                break;
            case 'Sport':
                paragraphText.classList.add(
                    `signin-gate__benefits--text-sport`
                );
                break;
            case 'Arts':
                paragraphText.classList.add(
                    `signin-gate__benefits--text-culture`
                );
                break;
            case 'Lifestyle':
                paragraphText.classList.add(
                    `signin-gate__benefits--text-lifestyle`
                );
                break;
            default:
                break;
        }
    }
};

// get the html of the whole gate, by getting the html template of the variant, and adding that
// to the child which is hidden by the fade in
export const setTemplate = ({ child, template }) => `
    <div class="signin-gate__first-paragraph-container">
        ${child.outerHTML}
        <div class="signin-gate__first-paragraph-overlay"></div>
    </div>
    ${template}
`;

// add opinion bg colour to gate fade
export const addOverlayVariantCSS = ({ element, selector }) => {
    const overlay = element.querySelector(selector);
    if (overlay) {
        if (config.get(`page.tones`) === 'Comment') {
            overlay.classList.add('overlay--comment--var');
        } else {
            overlay.classList.add('overlay--var');
        }
    }
};

// helper method which first shows the gate based on the template supplied, adds any
// handlers, e.g. click events etc. defined in the handler parameter function
export const showGate = ({ handler, template }) => {
    // get the whole article body, .js-article__body for non-DCR and .article-body-commercial-selector for DCR
    const articleBody =
        document.querySelector('.js-article__body') ||
        document.querySelector('.article-body-commercial-selector');

    // check if article body exists, since if it doesn't we don't want to show the gate
    if (articleBody) {
        // we look at the length of the children to determine which paragraphs should be shown in the "fade in"
        if (articleBody.children.length) {
            // container div to hold our "shadow" article dom while we create it
            const shadowArticleBody = document.createElement('div');
            // add the article body classes to the "shadow"
            shadowArticleBody.className = articleBody.className;

            // create an element to contain which children should have the overlay
            const shadowOverlay = document.createElement('div');
            // add the first child to the overlay, we use deep cloneNode so that child we add to the overlay is not a reference to the one in the hidden article
            shadowOverlay.appendChild(articleBody.children[0].cloneNode(true));

            // if the height of the child is too small, we add a 2nd child to the overlay so it looks better
            if (
                articleBody.children[0].clientHeight < 125 &&
                articleBody.children.length > 1
            ) {
                // find the indexes of the articles "p" tag, to include in the sign in gate fade
                const pIndexes = Array.from(articleBody.children)
                    .map((elem, idx) => (elem.tagName === 'P' ? idx : ''))
                    .filter(i => i !== '');

                // found some "p" tags, add the first "p" to the fade
                if (pIndexes.length > 1) {
                    shadowOverlay.appendChild(
                        articleBody.children[pIndexes[1]].cloneNode(true)
                    );
                }
            }

            // set the new article body to be first paragraph with transparent overlay, with the sign in gate component
            shadowArticleBody.innerHTML = setTemplate({
                child: shadowOverlay,
                template,
            });

            // defined by the caller, this function should handle any click events required, including the "dismiss" or "not now" link/button
            handler({
                articleBody,
                shadowArticleBody,
            });

            // Hide the article Body. Append the shadow one.
            articleBody.style.display = 'none';
            if (articleBody.parentNode) {
                articleBody.parentNode.appendChild(shadowArticleBody);
            }

            return true;
        }
    }

    return false;
};
