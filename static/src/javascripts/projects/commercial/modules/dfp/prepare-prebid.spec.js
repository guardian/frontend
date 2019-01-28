// @flow

import { prebid } from 'commercial/modules/prebid/prebid';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { init } from './prepare-prebid';

jest.mock('common/modules/commercial/commercial-features', () => ({
    commercialFeatures: {},
}));

jest.mock('commercial/modules/prebid/prebid');

jest.mock('commercial/modules/dfp/Advert', () =>
    jest.fn().mockImplementation(() => ({ advert: jest.fn() }))
);

jest.mock('common/modules/commercial/build-page-targeting', () => ({
    buildPageTargeting: jest.fn(),
}));

jest.mock('commercial/modules/prebid/bid-config', () => ({
    isInVariant: jest.fn(),
}));

describe('init', () => {
    let mockInitialise;

    beforeEach(() => {
        mockInitialise = jest.fn();
        (prebid: any).initialise = mockInitialise.bind(prebid);
    });

    it('should initialise Prebid when external demand is Prebid and advertising is on and ad-free is off', () => {
        dfpEnv.externalDemand = 'prebid';
        commercialFeatures.dfpAdvertising = true;
        commercialFeatures.adFree = false;
        init(jest.fn(), jest.fn());
        expect(mockInitialise).toBeCalled();
    });

    it('should not initialise Prebid when no external demand', () => {
        dfpEnv.externalDemand = 'none';
        init(jest.fn(), jest.fn());
        expect(mockInitialise).not.toBeCalled();
    });

    it('should not initialise Prebid when advertising is switched off', () => {
        commercialFeatures.dfpAdvertising = false;
        init(jest.fn(), jest.fn());
        expect(mockInitialise).not.toBeCalled();
    });

    it('should not initialise Prebid when ad-free is on', () => {
        commercialFeatures.adFree = true;
        init(jest.fn(), jest.fn());
        expect(mockInitialise).not.toBeCalled();
    });
});
