// @flow
import type { Banner } from 'common/modules/ui/bannerPicker';
import { hasUserAcknowledgedBanner } from 'common/modules/ui/message';
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

// const submitClickEvent = (componentEvent: ComponentEventWithoutAction) =>
//     submitComponentEvent({
//         ...componentEvent,
//         action: 'CLICK',
//     });

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

const canShow: () => Promise<boolean> = async () =>
    Promise.resolve(
        // is in sign in gate ab test
        isInABTestSynchronous(signInGateFirstTest) &&
            // check if user already dismissed gate
            !hasUserAcknowledgedBanner(componentName) &&
            // check number of page views
            isSecondPageOrHigherPageView() &&
            // check for epics and banners, returns empty array if none shown
            !(await getAsyncTestsToRun()).length &&
            // check if user is not logged by checking for cookie
            !isUserLoggedIn() &&
            // check if article type is valid
            !isInvalidArticleType()
    );

const show: () => Promise<boolean> = () => {
    //  get the current test
    const currentTest = getSynchronousTestsToRun().find(
        t => t.id === signInGateFirstTest.id
    );

    // get variant user is in for the test
    const variant = currentTest ? currentTest.variantToRun.id : null;

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
                // copy article body html string representation into memory
                // const currentContent = articleBody.innerHTML;
                // get the first paragraph of the article
                const articleBodyFirstChild = articleBody.firstElementChild;
                if (articleBodyFirstChild) {
                    // set the new article body to be first paragraph with transparent overlay, with the sign in gate component
                    articleBody.innerHTML = `
                    <div class="signin-gate__first-paragraph-container">
                        ${articleBodyFirstChild.outerHTML}
                        <div class="signin-gate__first-paragraph-overlay"></div>
                    </div>
                    ${make()}
                `;
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
