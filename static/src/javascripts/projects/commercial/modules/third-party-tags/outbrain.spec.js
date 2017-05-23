// @flow
import config from 'lib/config';
import {
    initCheckMediator,
    resolveCheck,
    _,
} from 'common/modules/check-mediator';
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
        initCheckMediator();

        config.switches.outbrain = true;
        config.switches.emailInArticleOutbrain = false;
        config.page = {
            section: 'uk-news',
            commentable: true,
        };

        done();
    });

    afterEach(() => {
        _.testClean();
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
            resolveCheck('isOutbrainDisabled', true);

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
            resolveCheck('isOutbrainDisabled', false);
            // make outbrain compliant
            resolveCheck('isUserInContributionsAbTest', false);
            resolveCheck('isUserInEmailAbTestAndEmailCanRun', false);
            resolveCheck('isStoryQuestionsOnPage', false);

            init().then(() => {
                expect(load).toHaveBeenCalled();
                expect(load).toHaveBeenCalledWith('compliant');
                detect.adblockInUse = Promise.resolve(false);
                done();
            });
        });

        it('should not load if both merch components are loaded', done => {
            // isOutbrainDisabled check
            resolveCheck('isOutbrainDisabled', false);
            // isOutbrainBlockedByAds checks
            resolveCheck('isOutbrainBlockedByAds', true);

            init().then(() => {
                expect(load).not.toHaveBeenCalled();
                expect(tracking).toHaveBeenCalled();
                expect(tracking).toHaveBeenCalledWith({
                    state: 'outbrainBlockedByAds',
                });
                done();
            });
        });

        it('should load in the low-priority merch component', done => {
            // isOutbrainDisabled check
            resolveCheck('isOutbrainDisabled', false);
            // isOutbrainBlockedByAds and isOutbrainMerchandiseCompliant checks
            resolveCheck('isOutbrainBlockedByAds', false);
            resolveCheck('isOutbrainMerchandiseCompliant', true);

            init().then(() => {
                expect(load).toHaveBeenCalled();
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

            init().then(() => {
                expect(load).toHaveBeenCalled();
                expect(load).toHaveBeenCalledWith(
                    'nonCompliant',
                    'userInContributionsAbTest'
                );
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

            init().then(() => {
                expect(load).toHaveBeenCalled();
                expect(load).toHaveBeenCalledWith(
                    'nonCompliant',
                    'userInEmailAbTestAndEmailCanRun'
                );
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

            init().then(() => {
                expect(load).toHaveBeenCalled();
                expect(load).toHaveBeenCalledWith(
                    'nonCompliant',
                    'storyQuestionsOnPage'
                );
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

            init().then(() => {
                expect(load).toHaveBeenCalled();
                expect(load).toHaveBeenCalledWith('compliant');
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
