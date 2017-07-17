// @flow
import config from 'lib/config';
import { initCheckMediator, resolveCheck } from 'common/modules/check-mediator';
import detect from 'lib/detect';
import { load } from './outbrain-load';
import { initOutbrain } from './outbrain';
import { getSection } from './outbrain-sections';

jest.mock('ophan/ng', () => ({ record: () => undefined }));
jest.mock('lib/detect', () => ({
    adblockInUse: Promise.resolve(false),
    getBreakpoint: jest.fn(),
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
        afterEach(() => {
            jest.resetAllMocks();
        });

        afterAll(() => {
            jest.resetModules();
        });

        it('should not load if outbrain disabled', done => {
            // isOutbrainDisabled check
            resolveCheck('isOutbrainDisabled', true);

            initOutbrain().then(() => {
                expect(load).not.toHaveBeenCalled();
                done();
            });
        });

        it('should load instantly when ad block is in use', done => {
            detect.adblockInUse = Promise.resolve(true);
            // isOutbrainDisabled check
            resolveCheck('isOutbrainDisabled', false);
            // make outbrain compliant
            resolveCheck('isUserInContributionsAbTest', false);
            resolveCheck('isUserInEmailAbTestAndEmailCanRun', false);
            resolveCheck('isStoryQuestionsOnPage', false);

            initOutbrain().then(() => {
                expect(load).toHaveBeenCalled();
                detect.adblockInUse = Promise.resolve(false);
                done();
            });
        });

        it('should not load if both merch components are loaded', done => {
            // isOutbrainDisabled check
            resolveCheck('isOutbrainDisabled', false);
            // isOutbrainBlockedByAds checks
            resolveCheck('isOutbrainBlockedByAds', true);

            initOutbrain().then(() => {
                expect(load).not.toHaveBeenCalled();
                done();
            });
        });

        it('should load in the low-priority merch component', done => {
            // isOutbrainDisabled check
            resolveCheck('isOutbrainDisabled', false);
            // isOutbrainBlockedByAds and isOutbrainMerchandiseCompliant checks
            resolveCheck('isOutbrainBlockedByAds', false);
            resolveCheck('isOutbrainMerchandiseCompliant', true);

            initOutbrain().then(() => {
                expect(load).toHaveBeenCalledWith('merchandising');
                done();
            });
        });

        it('should load a non compliant component if user in contributions AB test', done => {
            // isOutbrainDisabled check
            resolveCheck('isOutbrainDisabled', false);
            // isOutbrainBlockedByAds and isOutbrainMerchandiseCompliant checks
            resolveCheck('isOutbrainBlockedByAds', false);
            resolveCheck('isOutbrainMerchandiseCompliant', false);
            resolveCheck('isUserInContributionsAbTest', true);

            initOutbrain().then(() => {
                expect(load).toHaveBeenCalledWith('nonCompliant');
                done();
            });
        });

        it('should load a non compliant component if user in Email AB test and Email can run', done => {
            // isOutbrainDisabled check
            resolveCheck('isOutbrainDisabled', false);
            // isOutbrainBlockedByAds and isOutbrainMerchandiseCompliant checks
            resolveCheck('isOutbrainBlockedByAds', false);
            resolveCheck('isOutbrainMerchandiseCompliant', false);
            resolveCheck('isUserInContributionsAbTest', false);
            resolveCheck('isUserInEmailAbTestAndEmailCanRun', true);

            initOutbrain().then(() => {
                expect(load).toHaveBeenCalledWith('nonCompliant');
                done();
            });
        });

        it('should load a non compliant component if story questions on page', done => {
            // isOutbrainDisabled check
            resolveCheck('isOutbrainDisabled', false);
            // isOutbrainBlockedByAds and isOutbrainMerchandiseCompliant checks
            resolveCheck('isOutbrainBlockedByAds', false);
            resolveCheck('isOutbrainMerchandiseCompliant', false);
            resolveCheck('isUserInContributionsAbTest', false);
            resolveCheck('isUserInEmailAbTestAndEmailCanRun', false);
            resolveCheck('isStoryQuestionsOnPage', true);

            initOutbrain().then(() => {
                expect(load).toHaveBeenCalledWith('nonCompliant');
                done();
            });
        });

        it('should load a compliant component', done => {
            // isOutbrainDisabled check
            resolveCheck('isOutbrainDisabled', false);
            // isOutbrainBlockedByAds and isOutbrainMerchandiseCompliant checks
            resolveCheck('isOutbrainBlockedByAds', false);
            resolveCheck('isOutbrainMerchandiseCompliant', false);
            resolveCheck('isUserInContributionsAbTest', false);
            resolveCheck('isUserInEmailAbTestAndEmailCanRun', false);
            resolveCheck('isStoryQuestionsOnPage', false);

            initOutbrain().then(() => {
                expect(load).toHaveBeenCalled();
                done();
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
