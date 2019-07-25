// @flow
import { init, onConsentNotification, consentState, _ } from 'lib/cmp';
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

    it('does not re-trigger consent notifications if init called multiple times', () => {
        const myCallBack = jest.fn();

        init();

        onConsentNotification('functional', myCallBack);

        expect(myCallBack).toHaveBeenCalledTimes(1);

        init();

        expect(myCallBack).toHaveBeenCalledTimes(1);
    });

    describe('consentState', () => {
        it('returns null state if cmp lib has not been initialised', () => {
            expect(consentState('functional')).toBeNull();
            expect(consentState('performance')).toBeNull();
            expect(consentState('advertisement')).toBeNull();
        });

        it('returns functional consent state', () => {
            init();

            expect(consentState('functional')).toBe(true);
        });

        it('returns performance consent state', () => {
            init();

            expect(consentState('performance')).toBe(true);
        });

        it('returns advertisement consent state with true if getAdConsentState true', () => {
            getAdConsentState.mockReturnValue(true);

            init();

            expect(consentState('advertisement')).toBe(true);
        });

        it('returns advertisement consent state with false if getAdConsentState true', () => {
            getAdConsentState.mockReturnValue(false);

            init();

            expect(consentState('advertisement')).toBe(false);
        });
    });

    describe('onConsentNotification', () => {
        describe('if cmpIsReady is TRUE when onConsentNotification called', () => {
            it('executes functional callback', () => {
                const myCallBack = jest.fn();

                init();

                onConsentNotification('functional', myCallBack);

                expect(myCallBack).toHaveBeenCalledTimes(1);
                expect(myCallBack).toBeCalledWith(true);
            });

            it('executes performance callback', () => {
                const myCallBack = jest.fn();

                init();

                onConsentNotification('performance', myCallBack);

                expect(myCallBack).toHaveBeenCalledTimes(1);
                expect(myCallBack).toBeCalledWith(true);
            });

            it('executes advertisement callback with true if getAdConsentState true', () => {
                getAdConsentState.mockReturnValue(true);

                const myCallBack = jest.fn();

                init();

                onConsentNotification('advertisement', myCallBack);

                expect(myCallBack).toHaveBeenCalledTimes(1);
                expect(myCallBack).toBeCalledWith(true);
            });

            it('executes advertisement callback with true if getAdConsentState false', () => {
                getAdConsentState.mockReturnValue(false);

                const myCallBack = jest.fn();

                init();

                onConsentNotification('advertisement', myCallBack);

                expect(myCallBack).toHaveBeenCalledTimes(1);
                expect(myCallBack).toBeCalledWith(false);
            });

            it('executes advertisement callback each time consent nofication triggered', () => {
                getAdConsentState.mockReturnValue(true);

                const myCallBack = jest.fn();

                init();

                onConsentNotification('advertisement', myCallBack);

                _.triggerConsentNotification();

                expect(myCallBack).toHaveBeenCalledTimes(2);
                expect(myCallBack.mock.calls).toEqual([
                    [true], // First call
                    [true], // Second call
                ]);
            });
        });

        describe('if cmpIsReady is FALSE when onConsentNotification called waits to', () => {
            it('execute functional callback', () => {
                const myCallBack = jest.fn();

                onConsentNotification('functional', myCallBack);

                expect(myCallBack).not.toBeCalled();

                init();

                expect(myCallBack).toHaveBeenCalledTimes(1);
                expect(myCallBack).toBeCalledWith(true);
            });

            it('execute performance callback', () => {
                const myCallBack = jest.fn();

                onConsentNotification('performance', myCallBack);

                expect(myCallBack).not.toBeCalled();

                init();

                expect(myCallBack).toHaveBeenCalledTimes(1);
                expect(myCallBack).toBeCalledWith(true);
            });

            it('execute advertisement callback with true if getAdConsentState true', () => {
                getAdConsentState.mockReturnValue(true);

                const myCallBack = jest.fn();

                onConsentNotification('advertisement', myCallBack);

                expect(myCallBack).not.toBeCalled();

                init();

                expect(myCallBack).toHaveBeenCalledTimes(1);
                expect(myCallBack).toBeCalledWith(true);
            });

            it('execute advertisement callback with true if getAdConsentState false', () => {
                getAdConsentState.mockReturnValue(false);

                const myCallBack = jest.fn();

                onConsentNotification('advertisement', myCallBack);

                expect(myCallBack).not.toBeCalled();

                init();

                expect(myCallBack).toHaveBeenCalledTimes(1);
                expect(myCallBack).toBeCalledWith(false);
            });

            it('execute advertisement callback each time consent nofication triggered', () => {
                getAdConsentState.mockReturnValue(true);

                const myCallBack = jest.fn();

                onConsentNotification('advertisement', myCallBack);

                expect(myCallBack).not.toBeCalled();

                init();

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
