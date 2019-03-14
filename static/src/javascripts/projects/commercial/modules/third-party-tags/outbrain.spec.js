// @flow
import config from 'lib/config';
import { adblockInUse as adblockInUse_ } from 'lib/detect';
import { initCheckMediator, resolveCheck } from 'common/modules/check-mediator';
import { isInVariantSynchronous as isInVariantSynchronous_ } from 'common/modules/experiments/ab';
import { load } from './outbrain-load';
import { initOutbrain } from './outbrain';
import { getSection } from './outbrain-sections';

const adblockInUse: any = adblockInUse_;
const isInVariantSynchronous: any = isInVariantSynchronous_;

jest.mock('ophan/ng', () => ({ record: () => undefined }));

jest.mock('lib/detect', () => {
    let adblockInUseMock = false;

    return {
        getBreakpoint: jest.fn(() => 'desktop'),
        adblockInUse: {
            then: fn => Promise.resolve(fn(adblockInUseMock)),
            mockReturnValue: value => {
                adblockInUseMock = value;
            },
        },
    };
});

jest.mock('common/modules/experiments/ab', () => ({
    isInVariantSynchronous: jest.fn(
        (testId, variantId) => variantId === 'notintest'
    ),
}));

jest.mock('lib/load-script', () => ({ loadScript: jest.fn() }));
jest.mock('./outbrain-load', () => ({ load: jest.fn() }));

describe('Outbrain', () => {
    beforeEach(() => {
        if (document.body) {
            document.body.innerHTML = `
                <div id="dfp-ad--merchandising-high"></div>
                <div id="dfp-ad--merchandising"></div>
                <div class="js-outbrain"><div class="js-outbrain-container"></div></div>
                `;
        }
        // init checkMediator so we can resolve checks in tests
        initCheckMediator();

        config.switches.outbrain = true;
        config.switches.emailInArticleOutbrain = false;
        config.page = {
            section: 'uk-news',
            commentable: true,
        };

        expect.hasAssertions();
    });

    afterEach(() => {
        if (document.body) {
            document.body.innerHTML = '';
        }
    });

    it('should exist', () => {
        expect(initOutbrain).toBeDefined();
    });

    describe('Init', () => {
        beforeEach(() => {
            // extra testing to catch if the AB test is doing anything untoward.
            config.switches.abCommercialOutbrainTesting = true;
            isInVariantSynchronous.mockImplementation(
                (testId, variantId) => variantId !== 'variant'
            );
        });

        afterEach(() => {
            jest.resetAllMocks();
        });

        afterAll(() => {
            jest.resetModules();
        });

        it('should not load if outbrain disabled', () => {
            // isOutbrainDisabled check
            resolveCheck('isOutbrainDisabled', true);
            // make outbrain compliant
            resolveCheck('isUserInContributionsAbTest', false);
            resolveCheck('isStoryQuestionsOnPage', false);

            return initOutbrain().then(() => {
                expect(load).not.toHaveBeenCalled();
            });
        });

        it('should load instantly when ad block is in use', () => {
            adblockInUse.mockReturnValue(true);
            // isOutbrainDisabled check
            resolveCheck('isOutbrainDisabled', false);
            // make outbrain compliant
            resolveCheck('isUserInContributionsAbTest', false);
            resolveCheck('isStoryQuestionsOnPage', false);

            return initOutbrain().then(() => {
                expect(load).toHaveBeenCalled();
                adblockInUse.mockReturnValue(false);
            });
        });

        it('should not load if both merch components are loaded', () => {
            // isOutbrainDisabled check
            resolveCheck('isOutbrainDisabled', false);
            // make outbrain compliant
            resolveCheck('isUserInContributionsAbTest', false);
            resolveCheck('isStoryQuestionsOnPage', false);
            // isOutbrainBlockedByAds checks
            resolveCheck('isOutbrainBlockedByAds', true);
            resolveCheck('isOutbrainMerchandiseCompliant', false);

            return initOutbrain().then(() => {
                expect(load).not.toHaveBeenCalled();
            });
        });

        it('should load in the low-priority merch component', () => {
            // isOutbrainDisabled check
            resolveCheck('isOutbrainDisabled', false);
            // make outbrain compliant
            resolveCheck('isUserInContributionsAbTest', false);
            resolveCheck('isStoryQuestionsOnPage', false);
            // isOutbrainBlockedByAds and isOutbrainMerchandiseCompliant checks
            resolveCheck('isOutbrainBlockedByAds', false);
            resolveCheck('isOutbrainMerchandiseCompliant', true);

            return initOutbrain().then(() => {
                expect(load).toHaveBeenCalledWith('merchandising');
            });
        });

        it('should load a non compliant component if user in contributions AB test', () => {
            // isOutbrainDisabled check
            resolveCheck('isOutbrainDisabled', false);
            // isOutbrainBlockedByAds and isOutbrainMerchandiseCompliant checks
            resolveCheck('isOutbrainBlockedByAds', false);
            resolveCheck('isOutbrainMerchandiseCompliant', false);
            // editorial tests
            resolveCheck('isUserInContributionsAbTest', true);
            resolveCheck('isStoryQuestionsOnPage', false);

            return initOutbrain().then(() => {
                expect(load).toHaveBeenCalledWith('nonCompliant', true);
            });
        });

        it('should load a non compliant component if story questions on page', () => {
            // isOutbrainDisabled check
            resolveCheck('isOutbrainDisabled', false);
            // isOutbrainBlockedByAds and isOutbrainMerchandiseCompliant checks
            resolveCheck('isOutbrainBlockedByAds', false);
            resolveCheck('isOutbrainMerchandiseCompliant', false);
            // editorial tests
            resolveCheck('isUserInContributionsAbTest', false);
            resolveCheck('isStoryQuestionsOnPage', true);

            return initOutbrain().then(() => {
                expect(load).toHaveBeenCalledWith('nonCompliant', false);
            });
        });

        it('should load a compliant component', () => {
            // isOutbrainDisabled check
            resolveCheck('isOutbrainDisabled', false);
            // isOutbrainBlockedByAds and isOutbrainMerchandiseCompliant checks
            resolveCheck('isOutbrainBlockedByAds', false);
            resolveCheck('isOutbrainMerchandiseCompliant', false);
            // editorial tests
            resolveCheck('isUserInContributionsAbTest', false);
            resolveCheck('isStoryQuestionsOnPage', false);

            return initOutbrain().then(() => {
                expect(load).toHaveBeenCalled();
            });
        });
    });

    describe('Init when commercial outbrain test participation is "variant"', () => {
        beforeEach(() => {
            config.switches.abCommercialOutbrainTesting = true;
            isInVariantSynchronous.mockImplementation(
                (testId, variantId) => variantId === 'variant'
            );
        });

        afterEach(() => {
            jest.resetAllMocks();
        });

        afterAll(() => {
            jest.resetModules();
        });

        it('should ALWAYS load even if outbrain is disabled', () => {
            // resolve the required checks
            resolveCheck('isOutbrainDisabled', true);
            resolveCheck('isUserInContributionsAbTest', true);
            resolveCheck('isStoryQuestionsOnPage', true);

            resolveCheck('isOutbrainBlockedByAds', false);
            resolveCheck('isOutbrainMerchandiseCompliant', false);

            return initOutbrain().then(() => {
                expect(load).toHaveBeenCalled();
            });
        });

        it('should load in the low-priority merch component', () => {
            // isOutbrainDisabled check
            resolveCheck('isOutbrainDisabled', false);
            // make outbrain compliant
            resolveCheck('isUserInContributionsAbTest', false);
            resolveCheck('isStoryQuestionsOnPage', false);
            // isOutbrainBlockedByAds and isOutbrainMerchandiseCompliant checks
            resolveCheck('isOutbrainBlockedByAds', false);
            resolveCheck('isOutbrainMerchandiseCompliant', true);

            return initOutbrain().then(() => {
                expect(load).toHaveBeenCalledWith('merchandising');
            });
        });

        it('should load a non compliant component if user in contributions AB test', () => {
            // isOutbrainDisabled check
            resolveCheck('isOutbrainDisabled', false);
            // isOutbrainBlockedByAds and isOutbrainMerchandiseCompliant checks
            resolveCheck('isOutbrainBlockedByAds', false);
            resolveCheck('isOutbrainMerchandiseCompliant', false);
            // editorial tests
            resolveCheck('isUserInContributionsAbTest', true);
            resolveCheck('isStoryQuestionsOnPage', false);

            return initOutbrain().then(() => {
                expect(load).toHaveBeenCalledWith('nonCompliant', true);
            });
        });

        it('should load a non compliant component if story questions on page', () => {
            // isOutbrainDisabled check
            resolveCheck('isOutbrainDisabled', false);
            // isOutbrainBlockedByAds and isOutbrainMerchandiseCompliant checks
            resolveCheck('isOutbrainBlockedByAds', false);
            resolveCheck('isOutbrainMerchandiseCompliant', false);
            // editorial tests
            resolveCheck('isUserInContributionsAbTest', false);
            resolveCheck('isStoryQuestionsOnPage', true);

            return initOutbrain().then(() => {
                expect(load).toHaveBeenCalledWith('nonCompliant', false);
            });
        });
    });

    describe('Sections', () => {
        it('should return "news" for news sections', () => {
            expect(getSection('uk-news')).toEqual('news');
            expect(getSection('us-news')).toEqual('news');
            expect(getSection('au-news')).toEqual('news');
        });

        it('should return "news" for selected sections', () => {
            expect(getSection('politics')).toEqual('news');
            expect(getSection('world')).toEqual('news');
            expect(getSection('business')).toEqual('news');
            expect(getSection('commentisfree')).toEqual('news');
        });

        it('should return "defaults" for all other sections', () => {
            expect(getSection('culture')).toEqual('defaults');
            expect(getSection('football')).toEqual('defaults');
        });
    });
});
