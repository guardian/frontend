// @flow
import detect from 'lib/detect';
import checkMediator from 'common/modules/check-mediator';
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

const onIsOutbrainNonCompliant = outbrainNonCompliant => {
    if (outbrainNonCompliant) load('nonCompliant');
    else load();
    tracking({
        state: outbrainNonCompliant ? 'nonCompliant' : 'compliant',
    });
    return Promise.resolve();
};

const onIsOutbrainMerchandiseCompliant = outbrainMerchandiseCompliant => {
    if (outbrainMerchandiseCompliant) {
        load('merchandising');
        tracking({
            state: 'outbrainMerchandiseCompliant',
        });
        return Promise.resolve();
    }
    return checkMediator
        .waitForCheck('isOutbrainNonCompliant')
        .then(onIsOutbrainNonCompliant);
};

const onIsOutbrainBlockedByAds = outbrainBlockedByAds => {
    if (outbrainBlockedByAds) {
        tracking({
            state: 'outbrainBlockedByAds',
        });
        return Promise.resolve();
    }
    return checkMediator
        .waitForCheck('isOutbrainMerchandiseCompliant')
        .then(onIsOutbrainMerchandiseCompliant);
};

const onCanLoadInstantly = loadInstantly => {
    if (loadInstantly) {
        return checkMediator
            .waitForCheck('isOutbrainNonCompliant')
            .then(onIsOutbrainNonCompliant);
    }
    return checkMediator
        .waitForCheck('isOutbrainBlockedByAds')
        .then(onIsOutbrainBlockedByAds);
};

const onIsOutbrainDisabled = outbrainDisabled => {
    if (outbrainDisabled) {
        tracking({
            state: 'outbrainDisabled',
        });
        return Promise.resolve();
    }
    return canLoadInstantly().then(onCanLoadInstantly);
};

const init = () =>
    checkMediator.waitForCheck('isOutbrainDisabled').then(onIsOutbrainDisabled);

export { init };
