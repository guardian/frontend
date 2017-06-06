// @flow
import config from 'lib/config';
import $ from 'lib/$';
import detect from 'lib/detect';
import { loadScript } from 'lib/load-script';
import { tracking } from './outbrain-tracking';
import { load } from './outbrain-load';

jest.mock('ophan/ng', () => ({ record: () => undefined }));
jest.mock('lib/detect', () => ({
    adblockInUse: Promise.resolve(false),
    getBreakpoint: jest.fn(),
}));
jest.mock('lib/load-script', () => ({ loadScript: jest.fn() }));
jest.mock('./outbrain-tracking', () => ({ tracking: jest.fn() }));

detect.getBreakpoint.mockReturnValue('desktop');

describe('Outbrain Load', () => {
    beforeEach(done => {
        if (document.body) {
            document.body.innerHTML = `
                <div id="dfp-ad--merchandising-high"></div>
                <div id="dfp-ad--merchandising"></div>
                <div class="js-outbrain"><div class="js-outbrain-container"></div></div>
                `;
        }
        done();
    });

    afterEach(() => {
        if (document.body) {
            document.body.innerHTML = '';
        }
    });

    it('should exist', () => {
        expect(load).toBeDefined();
    });

    describe('desktop', () => {
        beforeEach(() => {
            detect.getBreakpoint.mockReturnValueOnce('desktop');
        });

        // compliant news
        it('should create two containers for desktop with correct IDs for slot 1', done => {
            config.page.section = 'uk-news';

            load('compliant').then(() => {
                expect($('.OUTBRAIN').first().data('widgetId')).toEqual(
                    'AR_12'
                );
                expect($('.OUTBRAIN').last().data('widgetId')).toEqual('AR_14');
                expect(tracking).toHaveBeenCalledWith({
                    widgetId: 'AR_12',
                });
                done();
            });
        });

        // compliant non-news
        it('should create two containers for desktop with correct IDs for slot 2', done => {
            config.page.section = 'football';

            load('compliant').then(() => {
                expect($('.OUTBRAIN').first().data('widgetId')).toEqual(
                    'AR_13'
                );
                expect($('.OUTBRAIN').last().data('widgetId')).toEqual('AR_15');
                expect(tracking).toHaveBeenCalledWith({
                    widgetId: 'AR_13',
                });
                done();
            });
        });

        // merch
        it('should create one container for destkop with correct IDs for slot merch', done => {
            config.page.edition = 'AU';

            load('merchandising').then(() => {
                expect($('.OUTBRAIN').first().data('widgetId')).toEqual(
                    'AR_28'
                );
                expect(tracking).toHaveBeenCalledWith({
                    widgetId: 'AR_28',
                });
                done();
            });
        });

        // non-compliant
        it('should create one container for destkop with correct IDs for nonCompliant', done => {
            config.page.edition = 'AU';

            load('nonCompliant', 'blockedByTest').then(() => {
                expect($('.OUTBRAIN').first().data('widgetId')).toEqual(
                    'AR_28'
                );
                expect(tracking).toHaveBeenCalledWith({
                    widgetId: 'AR_28',
                });
                done();
            });
        });
    });

    describe('tablet', () => {
        beforeEach(() => {
            detect.getBreakpoint.mockReturnValueOnce('tablet');
        });

        // compliant news
        it('should create two containers for tablet with correct IDs for slot 1', done => {
            config.page.section = 'uk-news';

            load('compliant').then(() => {
                expect($('.OUTBRAIN').first().data('widgetId')).toEqual('MB_6');
                expect($('.OUTBRAIN').last().data('widgetId')).toEqual('MB_8');
                expect(tracking).toHaveBeenCalledWith({
                    widgetId: 'MB_6',
                });
                done();
            });
        });

        // compliant non-news
        it('should create two containers for tablet with correct IDs for slot 2', done => {
            config.page.section = 'football';

            load('compliant').then(() => {
                expect($('.OUTBRAIN').first().data('widgetId')).toEqual('MB_7');
                expect($('.OUTBRAIN').last().data('widgetId')).toEqual('MB_9');
                expect(tracking).toHaveBeenCalledWith({
                    widgetId: 'MB_7',
                });
                done();
            });
        });

        // merch
        it('should create one container for tablet with correct IDs for slot merch', done => {
            config.page.edition = 'AU';

            load('merchandising').then(() => {
                expect($('.OUTBRAIN').first().data('widgetId')).toEqual(
                    'MB_11'
                );
                expect(tracking).toHaveBeenCalledWith({
                    widgetId: 'MB_11',
                });
                done();
            });
        });

        // non-compliant
        it('should create one container for tablet with correct IDs for nonCompliant', done => {
            load('nonCompliant', 'blockedByTest').then(() => {
                expect($('.OUTBRAIN').first().data('widgetId')).toEqual(
                    'MB_11'
                );
                expect(tracking).toHaveBeenCalledWith({
                    widgetId: 'MB_11',
                });
                done();
            });
        });
    });

    describe('mobile', () => {
        beforeEach(() => {
            detect.getBreakpoint.mockReturnValueOnce('mobile');
        });

        // compliant news
        it('should create one container for mobile with correct ID for slot 1', done => {
            config.page.section = 'uk-news';

            load('compliant').then(() => {
                expect($('.OUTBRAIN').first().data('widgetId')).toEqual('MB_4');
                expect(tracking).toHaveBeenCalledWith({
                    widgetId: 'MB_4',
                });
                done();
            });
        });

        // compliant non-news
        it('should create one container for mobile with correct IDs for slot 1', done => {
            config.page.section = 'football';

            load('compliant').then(() => {
                expect($('.OUTBRAIN').first().data('widgetId')).toEqual('MB_5');
                expect(tracking).toHaveBeenCalledWith({
                    widgetId: 'MB_5',
                });
                done();
            });
        });

        // merch
        it('should create one container for mobile with correct IDs for slot merch', done => {
            config.page.edition = 'AU';

            load('merchandising').then(() => {
                expect($('.OUTBRAIN').first().data('widgetId')).toEqual(
                    'MB_10'
                );
                expect(tracking).toHaveBeenCalledWith({
                    widgetId: 'MB_10',
                });
                done();
            });
        });

        // non-compliant
        it('should create one container for mobile with correct IDs for nonCompliant', done => {
            load('nonCompliant', 'blockedByTest').then(() => {
                expect($('.OUTBRAIN').first().data('widgetId')).toEqual(
                    'MB_10'
                );
                expect(tracking).toHaveBeenCalledWith({
                    widgetId: 'MB_10',
                });
                done();
            });
        });
    });

    it('should require outbrain javascript', done => {
        load('compliant').then(() => {
            expect(loadScript).toHaveBeenCalledWith(
                '//widgets.outbrain.com/outbrain.js'
            );
            done();
        });
    });
});
