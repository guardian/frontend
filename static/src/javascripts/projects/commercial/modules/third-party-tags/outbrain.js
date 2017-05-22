// @flow
import detect from 'lib/detect';
import { waitForCheck } from 'common/modules/check-mediator';
import { load } from './outbrain-load';

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
    if (outbrainNonCompliant) {
        load('nonCompliant');
    } else {
        load();
    }

    return Promise.resolve();
};

const onIsOutbrainMerchandiseCompliant = outbrainMerchandiseCompliant => {
    if (outbrainMerchandiseCompliant) {
        load('merchandising');
        return Promise.resolve();
    }

    return waitForCheck('isOutbrainNonCompliant').then(
        onIsOutbrainNonCompliant
    );
};

const onIsOutbrainBlockedByAds = outbrainBlockedByAds => {
    if (outbrainBlockedByAds) {
        return Promise.resolve();
    }

    return waitForCheck('isOutbrainMerchandiseCompliant').then(
        onIsOutbrainMerchandiseCompliant
    );
};

const onCanLoadInstantly = loadInstantly => {
    if (loadInstantly) {
        return waitForCheck('isOutbrainNonCompliant').then(
            onIsOutbrainNonCompliant
        );
    }

    return waitForCheck('isOutbrainBlockedByAds').then(
        onIsOutbrainBlockedByAds
    );
};

const onIsOutbrainDisabled = outbrainDisabled => {
    if (outbrainDisabled) {
        return Promise.resolve();
    }

    return canLoadInstantly().then(onCanLoadInstantly);
};

const init = () =>
    waitForCheck('isOutbrainDisabled').then(onIsOutbrainDisabled);

export { init };
