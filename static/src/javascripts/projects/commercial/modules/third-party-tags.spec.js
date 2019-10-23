// @flow
import { onIabConsentNotification as onIabConsentNotification_ } from '@guardian/consent-management-platform';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { init, _ } from './third-party-tags';

const onIabConsentNotification: any = onIabConsentNotification_;

const { insertScripts, loadOther } = _;

jest.mock('lib/raven');
jest.mock('@guardian/consent-management-platform', () => ({
    onIabConsentNotification: jest.fn(),
}));

beforeEach(() => {
    const firstScript = document.createElement('script');
    if (document.body && firstScript) {
        document.body.appendChild(firstScript);
    }
    expect.hasAssertions();
});

afterEach(() => {
    if (document.body) {
        document.body.innerHTML = '';
    }
});

jest.mock('ophan/ng', () => null);

jest.mock('commercial/modules/third-party-tags/outbrain', () => ({
    initOutbrain: jest.fn(),
}));

jest.mock('commercial/modules/third-party-tags/plista', () => ({
    plista: jest.fn(),
}));

jest.mock('common/modules/commercial/commercial-features', () => ({
    commercialFeatures: {
        thirdPartyTags: true,
    },
}));

jest.mock('commercial/modules/third-party-tags/imr-worldwide', () => ({
    imrWorldwide: {
        shouldRun: true,
        url: '//fakeThirdPartyTag.js',
        onLoad: jest.fn(),
    },
}));

describe('third party tags', () => {
    it('should exist', () => {
        expect(init).toBeDefined();
        expect(loadOther).toBeDefined();
        expect(insertScripts).toBeDefined();
    });

    it('should not run if disabled in commercial features', done => {
        commercialFeatures.thirdPartyTags = false;
        init()
            .then((enabled: boolean) => {
                expect(enabled).toBe(false);
                done();
            })
            .catch(() => {
                done.fail('third-party tags failed');
            });
    });

    it('should run if commercial enabled', done => {
        commercialFeatures.thirdPartyTags = true;
        commercialFeatures.adFree = false;
        init()
            .then((enabled: boolean) => {
                expect(enabled).toBe(true);
                done();
            })
            .catch(() => {
                done.fail('init failed');
            });
    });

    describe('insertScripts', () => {
        const fakeThirdPartyTag: ThirdPartyTag = {
            shouldRun: true,
            url: '//fakeThirdPartyTag.js',
            onLoad: jest.fn(),
        };
        it('should add a script to the document', () => {
            _.reset();
            onIabConsentNotification.mockImplementation(callback =>
                callback({
                    '1': true,
                    '2': true,
                    '3': true,
                    '4': true,
                    '5': true,
                })
            );
            insertScripts([fakeThirdPartyTag]);
            expect(document.scripts.length).toBe(2);
        });
    });
});
