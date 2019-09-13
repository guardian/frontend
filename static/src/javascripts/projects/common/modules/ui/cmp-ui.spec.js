// @flow
import { cmpUi as cmpUi_ } from '@guardian/consent-management-platform';
import { isInVariantSynchronous as isInVariantSynchronous_ } from 'common/modules/experiments/ab';
import { consentManagementPlatformUi, _ } from './cmp-ui';

const cmpUi: any = cmpUi_;
const isInVariantSynchronous: any = isInVariantSynchronous_;

jest.mock('@guardian/consent-management-platform', () => ({
    cmpUi: {
        canShow: jest.fn(),
        setupMessageHandlers: jest.fn(),
    },
    // $FlowFixMe property requireActual is actually not missing Flow.
    cmpConfig: jest.requireActual('@guardian/consent-management-platform')
        .cmpConfig,
}));

jest.mock('common/modules/experiments/ab', () => ({
    isInVariantSynchronous: jest.fn(),
}));

describe('cmp-ui', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('consentManagementPlatformUi', () => {
        describe('canShow', () => {
            it('returns true if cmpUi.canShow true and in commercialIabCompliant test', () => {
                cmpUi.canShow.mockReturnValue(true);
                isInVariantSynchronous.mockReturnValue(true);

                return consentManagementPlatformUi.canShow().then(show => {
                    expect(show).toBe(true);
                });
            });

            it('returns false if cmpUi.canShow false', () => {
                cmpUi.canShow.mockReturnValue(false);
                isInVariantSynchronous.mockReturnValue(true);

                return consentManagementPlatformUi.canShow().then(show => {
                    expect(show).toBe(false);
                });
            });

            it('returns false if not in commercialIabCompliant test', () => {
                cmpUi.canShow.mockReturnValue(true);
                isInVariantSynchronous.mockReturnValue(false);

                return consentManagementPlatformUi.canShow().then(show => {
                    expect(show).toBe(false);
                });
            });
        });

        describe('show', () => {
            const overlaySelector = `.${_.OVERLAY_CLASS}`;
            const iframeSelector = `.${_.IFRAME_CLASS}`;

            beforeEach(() => {
                expect(document.querySelectorAll(overlaySelector).length).toBe(
                    0
                );
            });

            afterEach(() => {
                _.reset();
            });

            it('runs prepareUi when called once', () => {
                consentManagementPlatformUi.show();

                expect(document.querySelectorAll(overlaySelector).length).toBe(
                    1
                );
                expect(document.querySelectorAll(iframeSelector).length).toBe(
                    1
                );
                expect(cmpUi.setupMessageHandlers).toHaveBeenCalledTimes(1);
            });

            it('does not run prepareUi multiple times when called more than once', () => {
                consentManagementPlatformUi.show();
                consentManagementPlatformUi.show();

                expect(document.querySelectorAll(overlaySelector).length).toBe(
                    1
                );
                expect(document.querySelectorAll(iframeSelector).length).toBe(
                    1
                );
                expect(cmpUi.setupMessageHandlers).toHaveBeenCalledTimes(1);
            });

            it('onReadyCmp adds the ready class to the container', () => {
                consentManagementPlatformUi.show();

                const container = document.querySelectorAll(overlaySelector)[0];

                expect(container).toBeTruthy();

                if (container) {
                    expect(
                        container.classList.contains(_.CMP_READY_CLASS)
                    ).toBe(false);

                    _.onReadyCmp();

                    expect(
                        container.classList.contains(_.CMP_READY_CLASS)
                    ).toBe(true);
                }
            });

            it('onCloseCmp removes the ready class from the container and the container from the page', () => {
                consentManagementPlatformUi.show();

                const container = document.querySelectorAll(overlaySelector)[0];

                if (container) {
                    _.onReadyCmp();

                    expect(
                        container.classList.contains(_.CMP_READY_CLASS)
                    ).toBe(true);
                    expect(container.parentNode).toBeTruthy();

                    _.onCloseCmp();

                    expect(
                        container.classList.contains(_.CMP_READY_CLASS)
                    ).toBe(false);
                    expect(container.parentNode).toBeFalsy();
                }
            });
        });
    });
});
