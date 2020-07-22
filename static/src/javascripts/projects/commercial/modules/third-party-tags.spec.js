// @flow
import {
    oldCmp,
    onConsentChange as onConsentChange_,
} from '@guardian/consent-management-platform';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { isInTcfv2Test as isInTcfv2Test_ } from 'commercial/modules/cmp/tcfv2-test';
import { init, _ } from './third-party-tags';

const { insertScripts, loadOther } = _;
const isInTcfv2Test: any = isInTcfv2Test_;

jest.mock('lib/raven');

jest.mock('@guardian/consent-management-platform', () => ({
    oldCmp: {
        onIabConsentNotification: jest.fn(),
        onGuConsentNotification: jest.fn(),
    },
    onConsentChange: jest.fn(),
}));

// Force TCFv1
jest.mock('commercial/modules/cmp/tcfv2-test', () => ({
    isInTcfv2Test: jest.fn(),
}));
const onConsentChange: any = onConsentChange_;
const onIabConsentNotification = oldCmp.onIabConsentNotification;
const onGuConsentNotification = oldCmp.onGuConsentNotification;

const tcfv2WithConsentMock = (callback): void =>
    callback({ tcfv2: { customVendors: { '1': true, '2': false } } });
const tcfv2WithoutConsentMock = (callback): void =>
    callback({ tcfv2: { customVendors: { '1': false, '2': false } } });

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
            sourcepointId: '1',
        };
        const fakeThirdPartyPerformanceTag: ThirdPartyTag = {
            shouldRun: true,
            url: '//fakeThirdPartyPerformanceTag.js',
            onLoad: jest.fn(),
            sourcepointId: '2',
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

        it('should only add consented custom vendors to the document for TCFv2', () => {
            _.reset();
            isInTcfv2Test.mockImplementation(() => true);
            onConsentChange.mockImplementation(tcfv2WithConsentMock);
            insertScripts([fakeThirdPartyAdvertisingTag], []);
            expect(document.scripts.length).toBe(2);
        });

        it('should not add scripts to the document when TCFv2 consent has not been given', () => {
            _.reset();
            isInTcfv2Test.mockImplementation(() => true);
            onConsentChange.mockImplementation(tcfv2WithoutConsentMock);
            insertScripts([fakeThirdPartyAdvertisingTag], []);
            expect(document.scripts.length).toBe(1);
        });
    });
});
