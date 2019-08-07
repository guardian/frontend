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
        const purposes = ['functional', 'performance', 'advertisement'];

        describe('if cmpIsReady is TRUE when onConsentNotification called', () => {
            purposes.forEach(purpose => {
                it(`executes ${purpose} callback immediately`, () => {
                    const myCallBack = jest.fn();

                    init();

                    onConsentNotification(purpose, myCallBack);

                    expect(myCallBack).toHaveBeenCalledTimes(1);
                });
            });

            it('executes functional callback with initial functional state', () => {
                const myCallBack = jest.fn();

                init();

                onConsentNotification('functional', myCallBack);

                expect(myCallBack).toBeCalledWith(true);
            });

            it('executes performance callback with initial performance state', () => {
                const myCallBack = jest.fn();

                init();

                onConsentNotification('performance', myCallBack);

                expect(myCallBack).toBeCalledWith(true);
            });

            it('executes advertisement callback with initial advertisement state true if getAdConsentState true', () => {
                getAdConsentState.mockReturnValue(true);

                const myCallBack = jest.fn();

                init();

                onConsentNotification('advertisement', myCallBack);

                expect(myCallBack).toBeCalledWith(true);
            });

            it('executes advertisement callback with initial advertisement state false if getAdConsentState false', () => {
                getAdConsentState.mockReturnValue(false);

                const myCallBack = jest.fn();

                init();

                onConsentNotification('advertisement', myCallBack);

                expect(myCallBack).toBeCalledWith(false);
            });

            it('executes advertisement callback with initial advertisement state null if getAdConsentState null', () => {
                getAdConsentState.mockReturnValue(null);

                const myCallBack = jest.fn();

                init();

                onConsentNotification('advertisement', myCallBack);

                expect(myCallBack).toBeCalledWith(null);
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

        describe('if cmpIsReady is FALSE when onConsentNotification', () => {
            purposes.forEach(purpose => {
                it(`waits to execute ${purpose} callback until cmpIsReady`, () => {
                    const myCallBack = jest.fn();

                    onConsentNotification(purpose, myCallBack);

                    expect(myCallBack).not.toHaveBeenCalled();

                    init();

                    expect(myCallBack).toHaveBeenCalledTimes(1);
                });
            });

            it('executes functional callback with initial functional state', () => {
                const myCallBack = jest.fn();

                onConsentNotification('functional', myCallBack);

                init();

                expect(myCallBack).toBeCalledWith(true);
            });

            it('executes performance callback with initial performance state', () => {
                const myCallBack = jest.fn();

                onConsentNotification('performance', myCallBack);

                init();

                expect(myCallBack).toBeCalledWith(true);
            });

            it('executes advertisement callback with initial advertisement state true if getAdConsentState true', () => {
                getAdConsentState.mockReturnValue(true);

                const myCallBack = jest.fn();

                onConsentNotification('advertisement', myCallBack);

                init();

                expect(myCallBack).toBeCalledWith(true);
            });

            it('executes advertisement callback with initial advertisement state false if getAdConsentState false', () => {
                getAdConsentState.mockReturnValue(false);

                const myCallBack = jest.fn();

                onConsentNotification('advertisement', myCallBack);

                init();

                expect(myCallBack).toBeCalledWith(false);
            });

            it('executes advertisement callback with initial advertisement state null if getAdConsentState null', () => {
                getAdConsentState.mockReturnValue(null);

                const myCallBack = jest.fn();

                onConsentNotification('advertisement', myCallBack);

                init();

                expect(myCallBack).toBeCalledWith(null);
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
