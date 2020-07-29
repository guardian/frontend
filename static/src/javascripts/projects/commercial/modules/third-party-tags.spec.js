// @flow
import {
    oldCmp,
    onConsentChange as onConsentChange_,
} from '@guardian/consent-management-platform';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { shouldUseSourcepointCmp as shouldUseSourcepointCmp_ } from 'commercial/modules/cmp/sourcepoint';
import { init, _ } from './third-party-tags';

const { insertScripts, loadOther } = _;
const shouldUseSourcepointCmp: any = shouldUseSourcepointCmp_;

jest.mock('lib/raven');

jest.mock('@guardian/consent-management-platform', () => ({
    oldCmp: {
        onIabConsentNotification: jest.fn(),
        onGuConsentNotification: jest.fn(),
    },
    onConsentChange: jest.fn(),
}));

jest.mock('commercial/modules/cmp/sourcepoint', () => ({
    shouldUseSourcepointCmp: jest.fn(),
}));

const onConsentChange: any = onConsentChange_;
const onIabConsentNotification = oldCmp.onIabConsentNotification;
const onGuConsentNotification = oldCmp.onGuConsentNotification;

const tcfv2WithConsentMock = (callback): void =>
    callback({
        tcfv2: {
            consents: {
                '1': true,
                '2': false,
                '3': false,
                '4': false,
                '5': false,
                '6': false,
                '7': true,
                '8': true,
            },
            vendorConsents: { '100': true, '200': false, '300': false },
        },
    });
const tcfv2WithoutConsentMock = (callback): void =>
    callback({ tcfv2: { vendorConsents: { '100': false, '200': false, '300': false } } });

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
        let fakeThirdPartyAdvertisingTag: ThirdPartyTag = {
            shouldRun: true,
            url: '//fakeThirdPartyAdvertisingTag.js',
            onLoad: jest.fn(),
            sourcepointId: '100',
        };
        let fakeThirdPartyAdvertisingTag2: ThirdPartyTag = {
            shouldRun: true,
            url: '//fakeThirdPartyAdvertisingTag2.js',
            onLoad: jest.fn(),
            sourcepointId: '300',
        };
        let fakeThirdPartyPerformanceTag: ThirdPartyTag = {
            shouldRun: true,
            url: '//fakeThirdPartyPerformanceTag.js',
            onLoad: jest.fn(),
            sourcepointId: '200',
        };

        beforeEach(() => {
            fakeThirdPartyAdvertisingTag.loaded = undefined;
            fakeThirdPartyAdvertisingTag2.loaded = undefined;
            fakeThirdPartyPerformanceTag.loaded = undefined;
        });


        it('should add scripts to the document when TCF consent has been given', () => {
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
            shouldUseSourcepointCmp.mockImplementation(() => true);
            onConsentChange.mockImplementation(callback =>
                callback({ ccpa: { doNotSell: false } })
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
            shouldUseSourcepointCmp.mockImplementation(() => true);
            onConsentChange.mockImplementation(callback =>
                callback({ ccpa: { doNotSell: true } })
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

        it('should only add consented custom vendors to the document for TCFv2', () => {
            shouldUseSourcepointCmp.mockImplementation(() => true);
            onConsentChange.mockImplementation(tcfv2WithConsentMock);
            insertScripts(
                [fakeThirdPartyAdvertisingTag, fakeThirdPartyAdvertisingTag2],
                []
            );
            expect(document.scripts.length).toBe(2);
        });

        it('should not add already loaded tags ', () => {
            fakeThirdPartyAdvertisingTag.loaded = true;
            shouldUseSourcepointCmp.mockImplementation(() => true);
            onConsentChange.mockImplementation(tcfv2WithConsentMock);
            insertScripts(
                [fakeThirdPartyAdvertisingTag, fakeThirdPartyAdvertisingTag2],
                []
            );
            expect(document.scripts.length).toBe(1);
        });

        it('should not add scripts to the document when TCFv2 consent has not been given', () => {
            shouldUseSourcepointCmp.mockImplementation(() => true);
            onConsentChange.mockImplementation(tcfv2WithoutConsentMock);
            insertScripts(
                [fakeThirdPartyAdvertisingTag, fakeThirdPartyAdvertisingTag2],
                []
            );
            expect(document.scripts.length).toBe(1);
        });
    });
});
