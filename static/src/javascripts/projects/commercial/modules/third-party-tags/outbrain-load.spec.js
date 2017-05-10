// @flow
import config from 'lib/config';
import $ from 'lib/$';
import detect from 'lib/detect';
import steadyPage from 'lib/steady-page';
import { loadScript } from 'lib/load-script';
import { tracking } from './outbrain-tracking';
import { load } from './outbrain-load';

jest.mock('ophan/ng', () => ({ record: () => undefined }));
jest.mock('lib/detect', () => ({
    adblockInUse: Promise.resolve(false),
    getBreakpoint: jest.fn(),
}));
jest.mock('lib/steady-page', () => ({ insert: jest.fn() }));
jest.mock('lib/load-script', () => ({ loadScript: jest.fn() }));
jest.mock('./outbrain-tracking', () => ({ tracking: jest.fn() }));

detect.getBreakpoint.mockReturnValue('desktop');

describe('Outbrain Load', () => {
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

    it('should create two containers for desktop with correct IDs for slot 1', done => {
        config.page.section = 'uk-news';

        load().then(() => {
            expect($('.OUTBRAIN').first().data('widgetId')).toEqual('AR_12');
            expect($('.OUTBRAIN').last().data('widgetId')).toEqual('AR_14');
            done();
        });
    });

    it('should create two containers for desktop with correct IDs for slot 2', done => {
        config.page.section = 'football';

        load().then(() => {
            expect($('.OUTBRAIN').first().data('widgetId')).toEqual('AR_13');
            expect($('.OUTBRAIN').last().data('widgetId')).toEqual('AR_15');
            done();
        });
    });

    it('should detect wide breakpoint as desktop', done => {
        detect.getBreakpoint.mockReturnValueOnce('wide');
        config.page.section = 'football';

        load().then(() => {
            expect($('.OUTBRAIN').first().data('widgetId')).toEqual('AR_13');
            expect($('.OUTBRAIN').last().data('widgetId')).toEqual('AR_15');
            done();
        });
    });

    it('should create two containers for tablet with correct IDs for slot 1', done => {
        detect.getBreakpoint.mockReturnValueOnce('tablet');
        config.page.section = 'uk-news';

        load().then(() => {
            expect($('.OUTBRAIN').first().data('widgetId')).toEqual('MB_6');
            expect($('.OUTBRAIN').last().data('widgetId')).toEqual('MB_8');
            done();
        });
    });

    it('should create two containers for tablet with correct IDs for slot 2', done => {
        detect.getBreakpoint.mockReturnValueOnce('tablet');
        config.page.section = 'football';

        load().then(() => {
            expect($('.OUTBRAIN').first().data('widgetId')).toEqual('MB_7');
            expect($('.OUTBRAIN').last().data('widgetId')).toEqual('MB_9');
            done();
        });
    });

    it('should create only one container for mobile with correct IDs for slot 1', done => {
        detect.getBreakpoint.mockReturnValueOnce('mobile');
        config.page.section = 'uk-news';

        load().then(() => {
            expect($('.OUTBRAIN').first().data('widgetId')).toEqual('MB_4');
            done();
        });
    });

    it('should create only one container for mobile with correct IDs for slot 2', done => {
        detect.getBreakpoint.mockReturnValueOnce('mobile');
        config.page.section = 'football';

        load().then(() => {
            expect($('.OUTBRAIN').first().data('widgetId')).toEqual('MB_5');
            done();
        });
    });

    it('should create two containers for destkop with correct IDs for slot merch', done => {
        config.page.edition = 'AU';

        load('merchandising').then(() => {
            expect($('.OUTBRAIN').first().data('widgetId')).toEqual('AR_28');
            done();
        });
    });

    it('should create two containers for tablet with correct IDs for slot merch', done => {
        detect.getBreakpoint.mockReturnValueOnce('tablet');

        load('merchandising').then(() => {
            expect($('.OUTBRAIN').first().data('widgetId')).toEqual('MB_11');
            done();
        });
    });

    it('should create only one container for mobile with correct IDs for slot merch', done => {
        detect.getBreakpoint.mockReturnValueOnce('mobile');

        load('merchandising').then(() => {
            expect($('.OUTBRAIN').first().data('widgetId')).toEqual('MB_10');
            done();
        });
    });

    it('should require outbrain javascript', done => {
        load().then(() => {
            expect(loadScript).toHaveBeenCalledWith(
                '//widgets.outbrain.com/outbrain.js'
            );
            done();
        });
    });

    it('should call tracking method', done => {
        config.page.section = 'football';

        load().then(() => {
            expect(tracking).toHaveBeenCalledWith({
                widgetId: 'AR_13',
            });
            done();
        });
    });
});
