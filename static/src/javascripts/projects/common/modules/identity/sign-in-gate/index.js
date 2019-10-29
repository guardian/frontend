// @flow
import type { Banner } from 'common/modules/ui/bannerPicker';
import { hasUserAcknowledgedBanner } from 'common/modules/ui/message';
// import ophan from 'ophan/ng';
import { getSync as geolocationGetSync } from 'lib/geolocation';
import config from 'lib/config';
import { local } from 'lib/storage';
import {
    isInVariantSynchronous,
    getAsyncTestsToRun,
} from 'common/modules/experiments/ab';
import { signInGateFirstTest } from 'common/modules/experiments/tests/sign-in-gate-first-test';
import { make } from './template';

import { isUserLoggedIn } from '../api';

const code = 'sign-in-gate';

// const trackInteraction = (interaction: string): void => {
//     ophan.record({
//         component: code,
//         value: interaction,
//     });
// };

const isSecondPageOrHigherPageView = (): boolean => {
    // get daily read article count array from local storage
    const dailyArticleCount = local.get('gu.history.dailyArticleCount') || [];

    // get the count from latest date, if it doesnt exist, set to 0
    const { count = 0 } = dailyArticleCount[0] || {};

    // check if count is greater or equal to 1 since dailyArticleCount is incremented after this component is loaded
    return count >= 1;
};

const isValidGeoLocation = (): boolean => geolocationGetSync() !== 'US';

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
        // check if user is in correct test/variant
        isInVariantSynchronous(signInGateFirstTest, 'variant') &&
            // check if user already dismissed gate
            !hasUserAcknowledgedBanner(code) &&
            // check number of page views
            isSecondPageOrHigherPageView() &&
            // check if valid geo location (so not US)
            isValidGeoLocation() &&
            // check for epics and banners, returns empty array if none shown
            !(await getAsyncTestsToRun()).length &&
            // check if user is not logged by checking for cookie
            !isUserLoggedIn() &&
            // check if article type is valid
            !isInvalidArticleType()
    );

const show: () => Promise<boolean> = () => {
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
    return Promise.resolve(true);
};

export const signInGate: Banner = {
    id: code,
    show,
    canShow,
};
