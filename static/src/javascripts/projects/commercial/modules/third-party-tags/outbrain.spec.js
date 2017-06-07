// @flow
import config from 'lib/config';
import checkMediator from 'common/modules/check-mediator';
import detect from 'lib/detect';
import { load } from './outbrain-load';
import { tracking } from './outbrain-tracking';
import { init } from './outbrain';
import { getSection } from './outbrain-sections';

jest.mock('ophan/ng', () => ({ record: () => undefined }));
jest.mock('lib/detect', () => ({
    adblockInUse: Promise.resolve(false),
    getBreakpoint: jest.fn(),
}));
jest.mock('lib/load-script', () => ({ loadScript: jest.fn() }));
jest.mock('./outbrain-load', () => ({ load: jest.fn() }));
jest.mock('./outbrain-tracking', () => ({ tracking: jest.fn() }));

describe('Outbrain', () => {
    beforeEach(done => {
        if (document.body) {
            document.body.innerHTML = `
                <div id="dfp-ad--merchandising-high"></div>
                <div id="dfp-ad--merchandising"></div>
                <div class="js-outbrain"><div class="js-outbrain-container"></div></div>
                `;
        }
        // init checkMediator so we can resolve checks in tests
        checkMediator.init();

        config.switches.outbrain = true;
        config.switches.emailInArticleOutbrain = false;
        config.page = {
            section: 'uk-news',
            commentable: true,
        };

        done();
    });

    afterEach(() => {
        checkMediator.test.testClean();
        if (document.body) {
            document.body.innerHTML = '';
        }
    });

    it('should exist', () => {
        expect(init).toBeDefined();
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
            checkMediator.resolveCheck('isOutbrainDisabled', true);
            // isUserInNonCompliantAbTest checks
            checkMediator.resolveCheck('isUserInContributionsAbTest', true);
            checkMediator.resolveCheck('isUserNotInContributionsAbTest', false);
            checkMediator.resolveCheck('isUserInEmailAbTest', false);
            checkMediator.resolveCheck('emailCanRunPreCheck', false);
            checkMediator.resolveCheck('listCanRun', false);
            checkMediator.resolveCheck('emailInArticleOutbrainEnabled', false);
            checkMediator.resolveCheck('isStoryQuestionsOnPage', false);

            init().then(() => {
                expect(load).not.toHaveBeenCalled();
                expect(tracking).toHaveBeenCalled();
                expect(tracking).toHaveBeenCalledWith({
                    state: 'outbrainDisabled',
                });
                done();
            });
        });

        it('should load instantly when ad block is in use', done => {
            detect.adblockInUse = Promise.resolve(true);
            // isOutbrainDisabled check
            checkMediator.resolveCheck('isOutbrainDisabled', false);
            // isUserInNonCompliantAbTest checks
            checkMediator.resolveCheck('isUserInContributionsAbTest', true);
            checkMediator.resolveCheck('isUserInEmailAbTest', false);
            checkMediator.resolveCheck('emailCanRunPreCheck', false);
            checkMediator.resolveCheck('listCanRun', false);
            checkMediator.resolveCheck('emailInArticleOutbrainEnabled', false);
            checkMediator.resolveCheck('isUserNotInContributionsAbTest', false);
            checkMediator.resolveCheck('isStoryQuestionsOnPage', false);

            init().then(() => {
                expect(load).toHaveBeenCalled();
                expect(load).toHaveBeenCalledWith('nonCompliant');
                expect(tracking).toHaveBeenCalled();
                expect(tracking).toHaveBeenCalledWith({
                    state: 'nonCompliant',
                });
                detect.adblockInUse = Promise.resolve(false);
                done();
            });
        });

        it('should load in the low-priority merch component', done => {
            // isOutbrainDisabled check
            checkMediator.resolveCheck('isOutbrainDisabled', false);
            // isOutbrainBlockedByAds and isOutbrainMerchandiseCompliant checks
            checkMediator.resolveCheck('hasHighPriorityAdLoaded', true);
            checkMediator.resolveCheck('hasLowPriorityAdLoaded', false);
            checkMediator.resolveCheck('hasLowPriorityAdNotLoaded', true);

            init().then(() => {
                expect(load).toHaveBeenCalled();
                expect(load).toHaveBeenCalledWith('merchandising');
                expect(tracking).toHaveBeenCalled();
                expect(tracking).toHaveBeenCalledWith({
                    state: 'outbrainMerchandiseCompliant',
                });
                done();
            });
        });

        it('should not load if both merch components are loaded', done => {
            // isOutbrainDisabled check
            checkMediator.resolveCheck('isOutbrainDisabled', false);
            // isOutbrainBlockedByAds checks
            checkMediator.resolveCheck('hasHighPriorityAdLoaded', true);
            checkMediator.resolveCheck('hasLowPriorityAdLoaded', true);

            init().then(() => {
                expect(load).not.toHaveBeenCalled();
                expect(tracking).toHaveBeenCalled();
                expect(tracking).toHaveBeenCalledWith({
                    state: 'outbrainBlockedByAds',
                });
                done();
            });
        });

        it('should load a compliant component', done => {
            // isOutbrainDisabled check
            checkMediator.resolveCheck('isOutbrainDisabled', false);
            // isOutbrainBlockedByAds and isOutbrainMerchandiseCompliant checks
            checkMediator.resolveCheck('hasHighPriorityAdLoaded', false);
            checkMediator.resolveCheck('hasLowPriorityAdLoaded', false);
            checkMediator.resolveCheck('hasLowPriorityAdNotLoaded', true);
            // isUserInNonCompliantAbTest checks
            checkMediator.resolveCheck('isUserInContributionsAbTest', false);
            checkMediator.resolveCheck('isUserNotInContributionsAbTest', false);
            checkMediator.resolveCheck('isUserInEmailAbTest', false);
            checkMediator.resolveCheck('emailCanRunPreCheck', false);
            checkMediator.resolveCheck('listCanRun', false);
            checkMediator.resolveCheck('emailInArticleOutbrainEnabled', false);
            checkMediator.resolveCheck('isStoryQuestionsOnPage', false);

            init().then(() => {
                expect(load).toHaveBeenCalled();
                expect(load).not.toHaveBeenCalledWith('nonCompliant');
                expect(load).not.toHaveBeenCalledWith('merchandising');
                expect(tracking).toHaveBeenCalled();
                expect(tracking).toHaveBeenCalledWith({
                    state: 'compliant',
                });
                done();
            });
        });

        it('should not load a compliant component if story questions are on page', done => {
            // isOutbrainDisabled check
            checkMediator.resolveCheck('isOutbrainDisabled', false);
            // isOutbrainBlockedByAds and isOutbrainMerchandiseCompliant checks
            checkMediator.resolveCheck('hasHighPriorityAdLoaded', false);
            checkMediator.resolveCheck('hasLowPriorityAdLoaded', false);
            checkMediator.resolveCheck('hasLowPriorityAdNotLoaded', true);
            // isUserInNonCompliantAbTest checks
            checkMediator.resolveCheck('isUserInContributionsAbTest', false);
            checkMediator.resolveCheck('isUserNotInContributionsAbTest', false);
            checkMediator.resolveCheck('isUserInEmailAbTest', false);
            checkMediator.resolveCheck('emailCanRunPreCheck', false);
            checkMediator.resolveCheck('listCanRun', false);
            checkMediator.resolveCheck('emailInArticleOutbrainEnabled', false);
            checkMediator.resolveCheck('isStoryQuestionsOnPage', true);

            init().then(() => {
                expect(load).toHaveBeenCalled();
                expect(load).toHaveBeenCalledWith('nonCompliant');
                expect(tracking).toHaveBeenCalled();
                expect(tracking).toHaveBeenCalledWith({
                    state: 'nonCompliant',
                });
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
