// @flow
import bean from 'bean';
import userPrefs from 'common/modules/user-prefs';
import type { Banner } from 'common/modules/ui/bannerPicker';
import ophan from 'ophan/ng';
import config from 'lib/config';
import { local } from 'lib/storage';
import {
    getSynchronousTestsToRun,
    isInABTestSynchronous,
    getAsyncTestsToRun,
} from 'common/modules/experiments/ab';
import { signInGateFirstTest } from 'common/modules/experiments/tests/sign-in-gate-first-test';
import { isUserLoggedIn } from 'common/modules/identity/api';

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

const componentName = 'sign-in-gate';

const component: OphanComponent = {
    componentType: 'SIGN_IN_GATE',
    id: 'inital_test',
};

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

const hasUserDismissedGate: (string, string) => boolean = (name, variant) => {
    const prefs = userPrefs.get(componentName) || {};

    return !!prefs[`${name}-${variant}`];
};

const setUserDismissedGate: (string, string) => void = (name, variant) => {
    const prefs = userPrefs.get(componentName) || {};
    prefs[`${name}-${variant}`] = Date.now();
    userPrefs.set(componentName, prefs);
};

const isSecondPageOrHigherPageView = (): boolean => {
    // get daily read article count array from local storage
    const dailyArticleCount = local.get('gu.history.dailyArticleCount') || [];

    // get the count from latest date, if it doesnt exist, set to 0
    const { count = 0 } = dailyArticleCount[0] || {};

    // check if count is greater or equal to 1 rather than 2 since dailyArticleCount is incremented after this component is loaded
    return count >= 1;
};

const isInvalidArticleType = (): boolean => {
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

const getVariant: () => string = () => {
    //  get the current test
    const currentTest = getSynchronousTestsToRun().find(
        t => t.id === signInGateFirstTest.id
    );

    // get variant user is in for the test
    return currentTest ? currentTest.variantToRun.id : '';
};

const canShow: () => Promise<boolean> = async () => {
    const variant = getVariant();

    return Promise.resolve(
        // is in sign in gate ab test
        isInABTestSynchronous(signInGateFirstTest) &&
            // check if user already dismissed gate
            !hasUserDismissedGate(signInGateFirstTest.id, variant) &&
            // check number of page views
            isSecondPageOrHigherPageView() &&
            // check for epics and banners, returns empty array if none shown
            !(await getAsyncTestsToRun()).length &&
            // check if user is not logged by checking for cookie
            !isUserLoggedIn() &&
            // check if article type is valid
            !isInvalidArticleType()
    );
};

const show: () => Promise<boolean> = () => {
    const variant = getVariant();

    // check if user is in correct test/variant to display
    if (variant) {
        // in control or variant
        // fire tracking
        submitViewEvent({
            component,
            abTest: {
                name: signInGateFirstTest.id,
                variant,
            },
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
                        ${make()}
                    `;

                    // add click handler for the dismiss of the gate
                    bean.on(
                        shadowArticleBody,
                        'click',
                        '.js-signin-gate__dismiss',
                        () => {
                            // submit dismiss click event to ophan
                            submitClickEvent({
                                component,
                                abTest: {
                                    name: signInGateFirstTest.id,
                                    variant,
                                },
                                value: 'dismiss',
                            });

                            // replace the shadow article with the original content
                            shadowArticleBody.replaceWith(currentContent);

                            // user pref dismissed gate
                            setUserDismissedGate(
                                signInGateFirstTest.id,
                                variant
                            );
                        }
                    );

                    bean.on(
                        shadowArticleBody,
                        'click',
                        '.js-signin-gate__button',
                        () => {
                            // submit sign in button click event to ophan
                            submitClickEvent({
                                component,
                                abTest: {
                                    name: signInGateFirstTest.id,
                                    variant,
                                },
                                value: 'signin_button',
                            });
                        }
                    );

                    // replace the real article with the shadow article
                    articleBody.replaceWith(shadowArticleBody);
                }
            }
        }
    }
    return Promise.resolve(true);
};

export const signInGate: Banner = {
    id: componentName,
    show,
    canShow,
};
