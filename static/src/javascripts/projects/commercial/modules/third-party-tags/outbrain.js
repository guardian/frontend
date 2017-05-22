// @flow
import detect from 'lib/detect';
import { waitForCheck } from 'common/modules/check-mediator';
import { load } from './outbrain-load';
import { tracking } from './outbrain-tracking';

/*
 Loading Outbrain is dependent on successful return of high relevance component
 from DFP. AdBlock is blocking DFP calls so we are not getting any response and thus
 not loading Outbrain. As Outbrain is being partially loaded behind the adblock we can
 make the call instantly when we detect adBlock in use.
*/
const canLoadInstantly = () =>
    detect.adblockInUse.then(
        adblockInUse =>
            !document.getElementById('dfp-ad--merchandising-high') ||
            adblockInUse
    );

const onIsStoryQuestionsOnPage = isStoryQuestionsOnPage => {
    if (isStoryQuestionsOnPage) {
        load('nonCompliant', 'storyQuestionsOnPage');
    } else {
        load('compliant');
    }

    return Promise.resolve();
};

const onIsUserInEmailAbTestAndEmailCanRun = userInEmailAbTestAndEmailCanRun => {
    if (userInEmailAbTestAndEmailCanRun) {
        load('nonCompliant', 'userInEmailAbTestAndEmailCanRun');
        return Promise.resolve();
    }

    return waitForCheck('isStoryQuestionsOnPage').then(
        onIsStoryQuestionsOnPage
    );
};

const onIsUserInContributionsAbTest = userInContributionsAbTest => {
    if (userInContributionsAbTest) {
        load('nonCompliant', 'userInContributionsAbTest');
        return Promise.resolve();
    }

    return waitForCheck('isUserInEmailAbTestAndEmailCanRun').then(
        onIsUserInEmailAbTestAndEmailCanRun
    );
};

const onIsOutbrainMerchandiseCompliant = outbrainMerchandiseCompliant => {
    if (outbrainMerchandiseCompliant) {
        load('merchandising');
        return Promise.resolve();
    }

    return waitForCheck('isUserInContributionsAbTest').then(
        onIsUserInContributionsAbTest
    );
};

const onIsOutbrainBlockedByAds = outbrainBlockedByAds => {
    if (outbrainBlockedByAds) {
        tracking({
            widgetId: null,
            state: 'outbrainBlockedByAds',
        });
        return Promise.resolve();
    }

    return waitForCheck('isOutbrainMerchandiseCompliant').then(
        onIsOutbrainMerchandiseCompliant
    );
};

const onCanLoadInstantly = loadInstantly => {
    if (loadInstantly) {
        return waitForCheck('isUserInContributionsAbTest').then(
            onIsUserInContributionsAbTest
        );
    }

    return waitForCheck('isOutbrainBlockedByAds').then(
        onIsOutbrainBlockedByAds
    );
};

const onIsOutbrainDisabled = outbrainDisabled => {
    if (outbrainDisabled) {
        tracking({
            widgetId: null,
            state: 'outbrainDisabled',
        });
        return Promise.resolve();
    }

    return canLoadInstantly().then(onCanLoadInstantly);
};

const init = () =>
    waitForCheck('isOutbrainDisabled').then(onIsOutbrainDisabled);

export { init };
