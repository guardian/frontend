// @flow
import bean from 'bean';
import userPrefs from 'common/modules/user-prefs';
import type { Banner } from 'common/modules/ui/bannerPicker';
import ophan from 'ophan/ng';
import config from 'lib/config';
import { local } from 'lib/storage';
import { getCookie } from 'lib/cookies';
import {
    getSynchronousTestsToRun,
    isInABTestSynchronous,
} from 'common/modules/experiments/ab';
import { signInGateSecundus } from 'common/modules/experiments/tests/sign-in-gate-first-test';
import { isUserLoggedIn } from 'common/modules/identity/api';
import { constructQuery } from 'lib/url';

import { make } from './template';

type ABTestVariant = {
    name: string,
    variant: string,
};
type ComponentEventWithoutAction = {
    component: OphanComponent,
    value?: string,
    id?: string,
    abTest?: ABTestVariant,
};

type ComponentEventParams = {
    componentType: string,
    componentId: string,
    abTestName: string,
    abTestVariant: string,
    viewId?: string,
    browserId?: string,
    visitId?: string,
};

const componentName = 'sign-in-gate';

const component = {
    componentType: 'SIGN_IN_GATE',
    id: 'secundus_test',
};

// ophan helper methods
const submitComponentEvent = (componentEvent: OphanComponentEvent) => {
    ophan.record({ componentEvent });
};

const submitViewEvent = (componentEvent: ComponentEventWithoutAction) =>
    submitComponentEvent({
        ...componentEvent,
        action: 'VIEW',
    });

const submitClickEvent = (componentEvent: ComponentEventWithoutAction) =>
    submitComponentEvent({
        ...componentEvent,
        action: 'CLICK',
    });

// check if the user has dismissed the gate by checking the user preferences
const hasUserDismissedGate: (string, string) => boolean = (name, variant) => {
    const prefs = userPrefs.get(componentName) || {};

    return !!prefs[`${name}-${variant}`];
};

// set in user preferences that the user has dismissed the gate, set the value to the current ISO date string
const setUserDismissedGate: (string, string) => void = (name, variant) => {
    const prefs = userPrefs.get(componentName) || {};
    prefs[`${name}-${variant}`] = new Date().toISOString();
    userPrefs.set(componentName, prefs);
};

// use the dailyArticleCount from the local storage to see how many articles the user has viewed in a day
// in our case if this is the second article or higher the user has viewed then set the gate
const isSecondPageOrHigherPageView = (): boolean => {
    // get daily read article count array from local storage
    const dailyArticleCount = local.get('gu.history.dailyArticleCount') || [];

    // get the count from latest date, if it doesnt exist, set to 0
    const { count = 0 } = dailyArticleCount[0] || {};

    // check if count is greater or equal to 1 rather than 2 since dailyArticleCount is incremented after this component is loaded
    return count >= 1;
};

// hide the sign in gate on article types that are not supported
const isInvalidArticleType = (): boolean => {
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
    ];

    return invalidTypes.reduce((isArticleInvalid, type) => {
        if (isArticleInvalid) return true;

        return config.get(`page.${type}`);
    }, false);
};

// hide the sign in gate on certain sections of the site, e.g info, about, help etc.
const isInvalidSection = (): boolean => {
    const invalidSections = ['about', 'info', 'membership', 'help'];

    return invalidSections.reduce((isSectionInvalid, section) => {
        if (isSectionInvalid) return true;

        return config.get(`page.section`) === section;
    }, false);
};

// get the current variant id the user is in
const getVariant: () => string = () => {
    //  get the current test
    const currentTest = getSynchronousTestsToRun().find(
        t => t.id === signInGateSecundus.id
    );

    // get variant user is in for the test
    return currentTest ? currentTest.variantToRun.id : '';
};

// determines if this "banner" can show for this user
const canShow: () => Promise<boolean> = async () => {
    const variant = getVariant();

    return Promise.resolve(
        // is in sign in gate ab test
        isInABTestSynchronous(signInGateSecundus) &&
            // check if user already dismissed gate
            !hasUserDismissedGate(signInGateSecundus.id, variant) &&
            // check number of page views
            isSecondPageOrHigherPageView() &&
            // check if user is not logged by checking for cookie
            !isUserLoggedIn() &&
            // check if article type is valid
            !isInvalidArticleType() &&
            // check if page section is valid (e.g not about or info)
            !isInvalidSection()
    );
};

// runs if the user is able to view the banner
const show: () => Promise<boolean> = () => {
    // get the users variant
    const variant = getVariant();

    // check if user is in correct test/variant to display
    if (variant) {
        // object helper to determine the ab test
        const abTest = {
            name: signInGateSecundus.id,
            variant,
        };

        // encode the current page as the return URL if the user goes onto the sign in page
        const returnUrl = encodeURIComponent(
            `${config.get('page.host')}/${config.get('page.pageId')}`
        );

        // set the component event params to be included in the query
        const queryParams: ComponentEventParams = {
            componentType: 'signingate',
            componentId: component.id,
            abTestName: signInGateSecundus.id,
            abTestVariant: variant,
        };

        // attach the view id to component event params
        if (
            window.guardian &&
            window.guardian.ophan &&
            window.guardian.ophan.viewId
        )
            queryParams.viewId = window.guardian.ophan.viewId;

        // attach the browser id to component event params
        const bwid = getCookie('bwid');
        if (bwid) queryParams.browserId = bwid;

        // attach the visit id to component event params
        const vsid = getCookie('vsid');
        if (vsid) queryParams.visitId = vsid;

        // get the current guardian website url, used to why sign in link
        const guUrl = config.get(`page.host`);

        // generate the sign in url link using the return url and component event params
        // also converts the params to a query string and uri encodes them so they can be passed through
        // all the way to IDAPI
        const signInUrl = `${config.get(
            `page.idUrl`
        )}/signin?returnUrl=${returnUrl}&componentEventParams=${encodeURIComponent(
            constructQuery(queryParams)
        )}`;

        // in control or variant
        // fire tracking
        submitViewEvent({
            component,
            abTest,
        });

        if (variant === 'variant') {
            // get the whole article body
            const articleBody = document.querySelector('.js-article__body');
            if (articleBody) {
                // clone article body html string representation into memory
                const currentContent = articleBody.cloneNode(true);
                // get the first paragraph of the article
                const articleBodyFirstChild = articleBody.firstElementChild;
                if (articleBodyFirstChild) {
                    // container div to hold our "shadow" article dom while we create it
                    const shadowArticleBody = document.createElement('div');
                    // add the article body classes to the "shadow"
                    shadowArticleBody.className = articleBody.className;

                    // set the new article body to be first paragraph with transparent overlay, with the sign in gate component
                    shadowArticleBody.innerHTML = `
                        <div class="signin-gate__first-paragraph-container">
                            ${articleBodyFirstChild.outerHTML}
                            <div class="signin-gate__first-paragraph-overlay"></div>
                        </div>
                        ${make(signInUrl, guUrl)}
                    `;

                    // check if comment, and add comment/opinion bg colour
                    if (config.get(`page.cardStyle`) === 'comment') {
                        const overlay = shadowArticleBody.querySelector(
                            '.signin-gate__first-paragraph-overlay'
                        );
                        if (overlay) {
                            overlay.classList.add(
                                'signin-gate__first-paragraph-overlay--comment'
                            );
                        }
                    }

                    // check page type/pillar to change text colour of the sign in gate
                    const paragraphText = shadowArticleBody.querySelector(
                        '.signin-gate__benefits--text'
                    );
                    if (paragraphText) {
                        switch (config.get(`page.pillar`)) {
                            case 'News':
                                paragraphText.classList.add(
                                    `signin-gate__benefits--text-news`
                                );
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

                    // add click handler for the dismiss of the gate
                    bean.on(
                        shadowArticleBody,
                        'click',
                        '.js-signin-gate__dismiss',
                        () => {
                            // submit dismiss click event to ophan
                            submitClickEvent({
                                component,
                                abTest,
                                value: 'dismiss',
                            });

                            // replace the shadow article with the original content
                            shadowArticleBody.replaceWith(currentContent);

                            // user pref dismissed gate
                            setUserDismissedGate(
                                signInGateSecundus.id,
                                variant
                            );
                        }
                    );

                    // add click handler for sign in button click
                    bean.on(
                        shadowArticleBody,
                        'click',
                        '.js-signin-gate__button',
                        () => {
                            // submit sign in button click event to ophan
                            submitClickEvent({
                                component,
                                abTest,
                                value: 'signin_button',
                            });
                        }
                    );

                    // add click handler for the why sign in link
                    bean.on(
                        shadowArticleBody,
                        'click',
                        '.js-signin-gate__why',
                        () => {
                            // submit why sign in track event
                            submitClickEvent({
                                component,
                                abTest,
                                value: 'why_sign_in',
                            });
                        }
                    );

                    // replace the real article with the shadow article
                    articleBody.replaceWith(shadowArticleBody);
                }
            }
        }
    }

    // have to return a promise
    return Promise.resolve(true);
};

export const signInGate: Banner = {
    id: componentName,
    show,
    canShow,
};
