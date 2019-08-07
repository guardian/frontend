// @flow
import { onConsentNotification, consentState, _ } from 'lib/cmp';
import { getAdConsentState as _getAdConsentState } from 'common/modules/commercial/ad-prefs.lib';

const getAdConsentState: any = _getAdConsentState;

jest.mock('common/modules/commercial/ad-prefs.lib', () => ({
    getAdConsentState: jest.fn(),
    thirdPartyTrackingAdConsent: jest.fn(),
}));

describe('cmp', () => {
    beforeEach(() => {
        _.resetCmp();
        getAdConsentState.mockReset();
    });

    describe('consentState', () => {
        it('returns initial functional consent state', () => {
            expect(consentState('functional')).toBe(true);
        });
        it('returns initial performance consent state', () => {
            expect(consentState('performance')).toBe(true);
        });
        it('returns initial advertisement consent state as true if getAdConsentState true', () => {
            getAdConsentState.mockReturnValue(true);
            expect(consentState('advertisement')).toBe(true);
        });
        it('returns initial advertisement consent state as false if getAdConsentState true', () => {
            getAdConsentState.mockReturnValue(false);
            expect(consentState('advertisement')).toBe(false);
        });
    });

    describe('onConsentNotification', () => {
        const purposes = ['functional', 'performance', 'advertisement'];

        describe('if cmpIsReady is TRUE when onConsentNotification called', () => {
            purposes.forEach(purpose => {
                it(`executes ${purpose} callback immediately`, () => {
                    const myCallBack = jest.fn();

                    onConsentNotification(purpose, myCallBack);

                    expect(myCallBack).toHaveBeenCalledTimes(1);
                });
            });

            it('executes functional callback with initial functional state', () => {
                const myCallBack = jest.fn();

                onConsentNotification('functional', myCallBack);

                expect(myCallBack).toBeCalledWith(true);
            });

            it('executes performance callback with initial performance state', () => {
                const myCallBack = jest.fn();

                onConsentNotification('performance', myCallBack);

                expect(myCallBack).toBeCalledWith(true);
            });

            it('executes advertisement callback with initial advertisement state true if getAdConsentState true', () => {
                getAdConsentState.mockReturnValue(true);

                const myCallBack = jest.fn();

                onConsentNotification('advertisement', myCallBack);

                expect(myCallBack).toBeCalledWith(true);
            });

            it('executes advertisement callback with initial advertisement state false if getAdConsentState false', () => {
                getAdConsentState.mockReturnValue(false);

                const myCallBack = jest.fn();

                onConsentNotification('advertisement', myCallBack);

                expect(myCallBack).toBeCalledWith(false);
            });

            it('executes advertisement callback with initial advertisement state null if getAdConsentState null', () => {
                getAdConsentState.mockReturnValue(null);

                const myCallBack = jest.fn();

                onConsentNotification('advertisement', myCallBack);

                expect(myCallBack).toBeCalledWith(null);
            });

            it('executes advertisement callback each time consent nofication triggered', () => {
                getAdConsentState.mockReturnValue(true);

                const myCallBack = jest.fn();

                onConsentNotification('advertisement', myCallBack);

                _.triggerConsentNotification();

                expect(myCallBack).toHaveBeenCalledTimes(2);
                expect(myCallBack.mock.calls).toEqual([
                    [true], // First call
                    [true], // Second call
                ]);
            });
        });
    });
});
