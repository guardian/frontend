// @flow
import {
    cmpUi as cmpUi_,
    cmpConfig,
} from '@guardian/consent-management-platform';
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

jest.mock('lib/report-error', () => jest.fn());

describe('cmp-ui', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('consentManagementPlatformUi', () => {
        describe('canShow', () => {
            it('returns true if cmpUi.canShow true and in CommercialCmpUiIab test variant', () => {
                cmpUi.canShow.mockReturnValue(true);
                isInVariantSynchronous.mockImplementation(
                    (test, variant) =>
                        test.id === 'CommercialCmpUiIab' &&
                        variant === 'variant'
                );

                return consentManagementPlatformUi.canShow().then(show => {
                    expect(show).toBe(true);
                });
            });

            it('returns false if not in commercialCmpUiIab test', () => {
                cmpUi.canShow.mockReturnValue(true);
                isInVariantSynchronous.mockReturnValue(false);

                return consentManagementPlatformUi.canShow().then(show => {
                    expect(show).toBe(false);
                });
            });

            it('returns false if cmpUi.canShow false', () => {
                cmpUi.canShow.mockReturnValue(false);
                isInVariantSynchronous.mockReturnValue(true);

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

            describe('adds correct src to iframe', () => {
                const tests = [
                    {
                        id: 'CommercialCmpUiIab',
                        variant: 'variant',
                        url: `${
                            cmpConfig.CMP_URL
                        }?abTestVariant=CmpUiIab-variant`,
                    },
                ];

                tests.forEach(test => {
                    const { id, variant, url } = test;
                    it(`when in ${id} test and ${variant} group`, () => {
                        isInVariantSynchronous.mockImplementation(
                            (abTest, abVariant) =>
                                abTest.id === id && abVariant === variant
                        );

                        consentManagementPlatformUi.show();

                        const iframe = document.querySelector(iframeSelector);

                        expect(iframe).not.toBeNull();

                        if (iframe) {
                            expect(iframe.getAttribute('src')).toBe(url);
                        }
                    });
                });

                it('fallsback to default url when not in ab test', () => {
                    isInVariantSynchronous.mockReturnValue(false);

                    consentManagementPlatformUi.show();

                    const iframe = document.querySelector(iframeSelector);

                    expect(iframe).not.toBeNull();

                    if (iframe) {
                        expect(iframe.getAttribute('src')).toBe(
                            cmpConfig.CMP_URL
                        );
                    }
                });
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

                    return _.onReadyCmp().then(() => {
                        expect(
                            container.classList.contains(_.CMP_READY_CLASS)
                        ).toBe(true);
                    });
                }
            });

            it('onReadyCmp adds the animate class to the container', () => {
                consentManagementPlatformUi.show();

                const container = document.querySelectorAll(overlaySelector)[0];

                expect(container).toBeTruthy();

                if (container) {
                    expect(
                        container.classList.contains(_.CMP_ANIMATE_CLASS)
                    ).toBe(false);

                    return _.onReadyCmp().then(() => {
                        expect(
                            container.classList.contains(_.CMP_ANIMATE_CLASS)
                        ).toBe(true);
                    });
                }
            });

            it('onCloseCmp removes the ready class from the container and the container from the page', () => {
                consentManagementPlatformUi.show();

                const container = document.querySelectorAll(overlaySelector)[0];

                if (container) {
                    return _.onReadyCmp()
                        .then(() => {
                            expect(
                                container.classList.contains(_.CMP_READY_CLASS)
                            ).toBe(true);

                            expect(container.parentNode).toBeTruthy();

                            return _.onCloseCmp();
                        })
                        .then(() => {
                            expect(
                                container.classList.contains(_.CMP_READY_CLASS)
                            ).toBe(false);

                            expect(container.parentNode).toBeFalsy();
                        });
                }
            });
        });
    });
});
