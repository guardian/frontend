// @flow
import bean from 'bean';
import userPrefs from 'common/modules/user-prefs';
import { local } from 'lib/storage';
import config from 'lib/config';
import {
    getSynchronousTestsToRun,
    isInABTestSynchronous,
} from 'common/modules/experiments/ab';
import { isUserLoggedIn } from 'common/modules/identity/api';
import { show as showCMPModule } from 'common/modules/ui/cmp-ui';
import { submitClickEventTracking } from './component-event-tracking';
import type { CurrentABTest } from './types';

// wrapper over isLoggedIn
export const isLoggedIn = isUserLoggedIn;

// wrapper over isInABTestSynchronous
export const isInTest: ABTest => boolean = test => isInABTestSynchronous(test);

// when running multiple tests simultaneously to test the component, we need to get
// which test the user is in, so that we can check and display the correct logic for that test
export const getTestforMultiTest: (Array<ABTest>) => ABTest = tests =>
    tests.reduce((acc, test) => {
        const checkTest = getSynchronousTestsToRun().find(
            t => t.id === test.id
        );
        if (checkTest) return checkTest;
        return acc;
    }, undefined);

// get the current variant id the user is in
export const getVariant: ABTest => string = test => {
    //  get the current test
    const currentTest = getSynchronousTestsToRun().find(t => t.id === test.id);

    // get variant user is in for the test
    return currentTest ? currentTest.variantToRun.id : '';
};

// check if the user has dismissed the gate by checking the user preferences,
// name is optional, but can be used to differentiate between multiple sign in gate tests
export const hasUserDismissedGate: ({
    name?: string,
    variant: string,
    componentName: string,
}) => boolean = ({ name = '', componentName, variant }) => {
    const prefs = userPrefs.get(componentName) || {};

    return !!prefs[`${name ? `${name}-` : ''}${variant}`];
};

// Dynamically sets the gate custom parameter for Google ad request page targeting
export const setGatePageTargeting = (canShow: boolean): void => {
    if (window.googletag) {
        window.googletag.cmd.push(() => {
            window.googletag
                .pubads()
                .setTargeting('gate', canShow.toString().slice(0, 1)); // must be a short string so we slice "t"/"f"
        });
    }
};

// set in user preferences that the user has dismissed the gate, set the value to the current ISO date string
// name is optional, but can be used to differentiate between multiple sign in gate tests
export const setUserDismissedGate: ({
    name?: string,
    variant: string,
    componentName: string,
}) => void = ({ name = '', variant, componentName }) => {
    const prefs = userPrefs.get(componentName) || {};
    prefs[`${name ? `${name}-` : ''}${variant}`] = new Date().toISOString();
    userPrefs.set(componentName, prefs);
};

// use the dailyArticleCount from the local storage to see how many articles the user has viewed in a day
// in our case if this is the n-numbered article or higher the user has viewed then set the gate
export const isNPageOrHigherPageView = (n: number = 2): boolean => {
    // get daily read article count array from local storage
    const dailyArticleCount = local.get('gu.history.dailyArticleCount') || [];

    // get the count from latest date, if it doesnt exist, set to 0
    const { count = 0 } = dailyArticleCount[0] || {};

    // check if count is greater or equal to 1 less than n since dailyArticleCount is incremented after this component is loaded
    return count >= n - 1;
};

// determine if the useragent is running iOS 9 (known to be buggy for sign in flow)
export const isIOS9 = (): boolean => {
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
export const isInvalidArticleType = (include: Array<string> = []): boolean => {
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
export const isInvalidSection = (include: Array<string> = []): boolean => {
    const invalidSections = [
        'about',
        'info',
        'membership',
        'help',
        'guardian-live-australia',
    ];

    return invalidSections
        .filter(el => !include.includes(el))
        .reduce((isSectionInvalid, section) => {
            if (isSectionInvalid) return true;

            // looks up window.guardian.config object in the browser console
            return config.get(`page.section`) === section;
        }, false);
};

// html event wrapper using bean
export const addEventHandler: ({
    element: HTMLElement,
    event: string,
    selector: string,
    handler: Function,
}) => void = ({ element, event, selector, handler }) => {
    bean.on(element, event, selector, handler);
};

// click event wrapper using addEventHandler method
export const addClickHandler: ({
    element: HTMLElement,
    selector: string,
    component: OphanComponent,
    abTest: CurrentABTest,
    value: string,
    callback?: Function,
}) => void = ({
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
export const showPrivacySettingsCMPModule: () => void = () => {
    if (config.get('switches.cmpUi', true)) {
        showCMPModule(true);
    }
};

// add the background color if the page the user is on is the opinion section
export const addOpinionBgColour: ({
    element: HTMLElement,
    selector: string,
}) => void = ({ element, selector }) => {
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
export const addPillarColour: ({
    element: HTMLElement,
    selector: string,
}) => void = ({ element, selector }) => {
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
export const setTemplate: ({
    child: HTMLElement,
    template: string,
}) => string = ({ child, template }) => `
    <div class="signin-gate__first-paragraph-container">
        ${child.outerHTML}
        <div class="signin-gate__first-paragraph-overlay"></div>
    </div>
    ${template}
`;

export const addOverlayVariantCSS: ({
    element: HTMLElement,
    selector: string,
}) => void = ({ element, selector }) => {
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
export const showGate: ({
    handler: ({
        articleBody: HTMLElement,
        shadowArticleBody: HTMLElement,
    }) => void,
    template: string,
}) => boolean = ({ handler, template }) => {
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
