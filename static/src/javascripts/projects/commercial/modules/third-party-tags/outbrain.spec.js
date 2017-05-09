// @flow
import config from 'lib/config';
import $ from 'lib/$';
import checkMediator from 'projects/common/modules/check-mediator';
import outbrain from './outbrain';
import { getSection } from './outbrain-sections';

const sut = outbrain; // System under test

jest.mock('ophan/ng', () => ({ record: () => undefined }));
jest.mock('lib/detect', () => ({
    adblockInUse: Promise.resolve(false),
    getBreakpoint: jest.fn(),
}));
jest.mock('lib/steady-page', () => ({ insert: jest.fn() }));
jest.mock('lib/load-script', () => ({ loadScript: jest.fn() }));

const detect = require('lib/detect');

const steadyPage = require('lib/steady-page');

const loadScript = require('lib/load-script').loadScript;

describe('Outbrain', () => {
    let loadSpy: any;
    let trackingSpy: any;

    beforeEach(done => {
        steadyPage.insert.mockImplementation((container, cb) => {
            cb();
            return Promise.resolve();
        });
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
        expect(sut).toBeDefined();
    });

    describe('Init', () => {
        beforeAll(done => {
            loadSpy = jest.spyOn(sut, 'load');
            trackingSpy = jest.spyOn(sut, 'tracking');
            done();
        });

        afterEach(() => {
            loadSpy.mockReset();
            trackingSpy.mockReset();
        });

        afterAll(() => {
            loadSpy.mockRestore();
            trackingSpy.mockRestore();
            jest.resetAllMocks();
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

            sut.init().then(() => {
                expect(loadSpy).not.toHaveBeenCalled();
                expect(trackingSpy).toHaveBeenCalled();
                expect(trackingSpy).toHaveBeenCalledWith({
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

            sut.init().then(() => {
                expect(loadSpy).toHaveBeenCalled();
                expect(loadSpy).toHaveBeenCalledWith('nonCompliant');
                expect(trackingSpy).toHaveBeenCalled();
                expect(trackingSpy).toHaveBeenCalledWith({
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

            sut.init().then(() => {
                expect(loadSpy).toHaveBeenCalled();
                expect(loadSpy).toHaveBeenCalledWith('merchandising');
                expect(trackingSpy).toHaveBeenCalled();
                expect(trackingSpy).toHaveBeenCalledWith({
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

            sut.init().then(() => {
                expect(loadSpy).not.toHaveBeenCalled();
                expect(trackingSpy).toHaveBeenCalled();
                expect(trackingSpy).toHaveBeenCalledWith({
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

            sut.init().then(() => {
                expect(loadSpy).toHaveBeenCalled();
                expect(loadSpy).not.toHaveBeenCalledWith('nonCompliant');
                expect(loadSpy).not.toHaveBeenCalledWith('merchandising');
                expect(trackingSpy).toHaveBeenCalled();
                expect(trackingSpy).toHaveBeenCalledWith({
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

            sut.init().then(() => {
                expect(loadSpy).toHaveBeenCalled();
                expect(loadSpy).toHaveBeenCalledWith('nonCompliant');
                expect(trackingSpy).toHaveBeenCalled();
                expect(trackingSpy).toHaveBeenCalledWith({
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

    describe('Load', () => {
        beforeAll(() => {
            detect.getBreakpoint.mockReturnValue('desktop');
        });

        it('should create two containers for desktop with correct IDs for slot 1', done => {
            config.page.section = 'uk-news';

            sut.load().then(() => {
                expect($('.OUTBRAIN').first().data('widgetId')).toEqual(
                    'AR_12'
                );
                expect($('.OUTBRAIN').last().data('widgetId')).toEqual('AR_14');
                done();
            });
        });

        it('should create two containers for desktop with correct IDs for slot 2', done => {
            config.page.section = 'football';

            sut.load().then(() => {
                expect($('.OUTBRAIN').first().data('widgetId')).toEqual(
                    'AR_13'
                );
                expect($('.OUTBRAIN').last().data('widgetId')).toEqual('AR_15');
                done();
            });
        });

        it('should detect wide breakpoint as desktop', done => {
            detect.getBreakpoint.mockReturnValueOnce('wide');
            config.page.section = 'football';

            sut.load().then(() => {
                expect($('.OUTBRAIN').first().data('widgetId')).toEqual(
                    'AR_13'
                );
                expect($('.OUTBRAIN').last().data('widgetId')).toEqual('AR_15');
                done();
            });
        });

        it('should create two containers for tablet with correct IDs for slot 1', done => {
            detect.getBreakpoint.mockReturnValueOnce('tablet');
            config.page.section = 'uk-news';

            sut.load().then(() => {
                expect($('.OUTBRAIN').first().data('widgetId')).toEqual('MB_6');
                expect($('.OUTBRAIN').last().data('widgetId')).toEqual('MB_8');
                done();
            });
        });

        it('should create two containers for tablet with correct IDs for slot 2', done => {
            detect.getBreakpoint.mockReturnValueOnce('tablet');
            config.page.section = 'football';

            sut.load().then(() => {
                expect($('.OUTBRAIN').first().data('widgetId')).toEqual('MB_7');
                expect($('.OUTBRAIN').last().data('widgetId')).toEqual('MB_9');
                done();
            });
        });

        it('should create only one container for mobile with correct IDs for slot 1', done => {
            detect.getBreakpoint.mockReturnValueOnce('mobile');
            config.page.section = 'uk-news';

            sut.load().then(() => {
                expect($('.OUTBRAIN').first().data('widgetId')).toEqual('MB_4');
                done();
            });
        });

        it('should create only one container for mobile with correct IDs for slot 2', done => {
            detect.getBreakpoint.mockReturnValueOnce('mobile');
            config.page.section = 'football';

            sut.load().then(() => {
                expect($('.OUTBRAIN').first().data('widgetId')).toEqual('MB_5');
                done();
            });
        });

        it('should create two containers for destkop with correct IDs for slot merch', done => {
            config.page.edition = 'AU';

            sut.load('merchandising').then(() => {
                expect($('.OUTBRAIN').first().data('widgetId')).toEqual(
                    'AR_28'
                );
                done();
            });
        });

        it('should create two containers for tablet with correct IDs for slot merch', done => {
            detect.getBreakpoint.mockReturnValueOnce('tablet');

            sut.load('merchandising').then(() => {
                expect($('.OUTBRAIN').first().data('widgetId')).toEqual(
                    'MB_11'
                );
                done();
            });
        });

        it('should create only one container for mobile with correct IDs for slot merch', done => {
            detect.getBreakpoint.mockReturnValueOnce('mobile');

            sut.load('merchandising').then(() => {
                expect($('.OUTBRAIN').first().data('widgetId')).toEqual(
                    'MB_10'
                );
                done();
            });
        });

        it('should require outbrain javascript', done => {
            sut.load().then(() => {
                expect(loadScript).toHaveBeenCalledWith(
                    '//widgets.outbrain.com/outbrain.js'
                );
                done();
            });
        });

        it('should call tracking method', done => {
            trackingSpy = jest.spyOn(sut, 'tracking');
            config.page.section = 'football';

            sut.load().then(() => {
                expect(trackingSpy).toHaveBeenCalledWith({
                    widgetId: 'AR_13',
                });
                done();
            });
        });
    });
});
