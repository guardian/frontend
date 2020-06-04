// @flow
import {
    onIabConsentNotification as onIabConsentNotification_,
    onGuConsentNotification as onGuConsentNotification_,
} from '@guardian/consent-management-platform';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { init, _ } from './third-party-tags';

const onIabConsentNotification: any = onIabConsentNotification_;
const onGuConsentNotification: any = onGuConsentNotification_;

const { insertScripts, loadOther } = _;

jest.mock('lib/raven');
jest.mock('@guardian/consent-management-platform', () => ({
    onIabConsentNotification: jest.fn(),
    onGuConsentNotification: jest.fn(),
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
        const fakeThirdPartyAdvertisingTag: ThirdPartyTag = {
            shouldRun: true,
            url: '//fakeThirdPartyAdvertisingTag.js',
            onLoad: jest.fn(),
        };
        const fakeThirdPartyPerformanceTag: ThirdPartyTag = {
            shouldRun: true,
            url: '//fakeThirdPartyPerformanceTag.js',
            onLoad: jest.fn(),
        };
        it('should add scripts to the document when TCF consent has been given', () => {
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
            onGuConsentNotification.mockImplementation((state, callback) =>
                callback(true)
            );
            insertScripts(
                [fakeThirdPartyAdvertisingTag],
                [fakeThirdPartyPerformanceTag]
            );
            expect(document.scripts.length).toBe(3);
        });
        it('should not add scripts to the document when TCF consent has not been given', () => {
            _.reset();
            onIabConsentNotification.mockImplementation(callback =>
                callback({
                    '1': false,
                    '2': false,
                    '3': false,
                    '4': false,
                    '5': false,
                })
            );
            onGuConsentNotification.mockImplementation((state, callback) =>
                callback(false)
            );
            insertScripts(
                [fakeThirdPartyAdvertisingTag],
                [fakeThirdPartyPerformanceTag]
            );
            expect(document.scripts.length).toBe(1);
        });
        it('should add scripts to the document when CCPA consent has been given', () => {
            _.reset();
            onIabConsentNotification.mockImplementation(callback =>
                callback(false)
            );
            onGuConsentNotification.mockImplementation((state, callback) =>
                callback(true)
            );
            insertScripts(
                [fakeThirdPartyAdvertisingTag],
                [fakeThirdPartyPerformanceTag]
            );
            expect(document.scripts.length).toBe(3);
        });
        it('should not add scripts to the document when CCPA consent has not been given', () => {
            _.reset();
            onIabConsentNotification.mockImplementation(callback =>
                callback(true)
            );
            onGuConsentNotification.mockImplementation((state, callback) =>
                callback(false)
            );
            insertScripts(
                [fakeThirdPartyAdvertisingTag],
                [fakeThirdPartyPerformanceTag]
            );
            expect(document.scripts.length).toBe(1);
        });
    });
});
