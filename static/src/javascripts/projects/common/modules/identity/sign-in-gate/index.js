// @flow
import type { Banner } from 'common/modules/ui/bannerPicker';
import { Message, hasUserAcknowledgedBanner } from 'common/modules/ui/message';
import ophan from 'ophan/ng';
import config from 'lib/config';
import userPrefs from 'common/modules/user-prefs';
import { isInVariantSynchronous } from 'common/modules/experiments/ab';
import { signInGateFirstTest } from 'common/modules/experiments/tests/sign-in-gate-first-test';
import { getAsyncTestsToRun } from '../../experiments/ab';
import { isUserLoggedIn } from '../api';

const code = 'sign-in-gate';

const isSecondPageOrHigherPageView = (): boolean => {
    const views = 2;
    return views >= 2;
};

const isValidArticleType = (): boolean => {
    const incompatibleTypes = [
        'isColumn',
        'isContent',
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

    const currentArticleTypes = incompatibleTypes.map(type =>
        config.get(`page.${type}`)
    );

    const isInvalidArticleType = currentArticleTypes.some(true);

    return !isInvalidArticleType;
};

const canShow: () => Promise<boolean> = async () =>
    Promise.resolve(
        // check if user is in correct test/variant
        isInVariantSynchronous(signInGateFirstTest, 'variant') &&
            // check if user already dismissed gate
            !hasUserAcknowledgedBanner(code) &&
            // check number of page views
            isSecondPageOrHigherPageView() &&
            // check for epics and banners, returns empty array if none shown
            !(await getAsyncTestsToRun()).length &&
            // check if user is not logged by checking for cookie
            !isUserLoggedIn() &&
            // check if article type is valid
            isValidArticleType()
    );

const show: () => Promise<boolean> = () => {
    const show = Promise.resolve(true);
    return show;
};

export const signInGate: Banner = {
    id: code,
    show,
    canShow,
};
