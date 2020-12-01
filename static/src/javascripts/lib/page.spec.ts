import config from 'lib/config';
import { isClockwatch, isLiveClockwatch, isMatch, keywordExists } from './page';

jest.mock('lib/config', () => {
    const defaultConfig = {
        page: {
            tones: '',
            series: '',
            isLive: false,
            isLiveBlog: false,
            webPublicationDate: '2017-07-19T12:41:11.739Z',
        },
    };

    return {
        ...defaultConfig,
        get: (path = '', defaultValue: any) =>
            path
                .replace(/\[(.+?)\]/g, '.$1')
                .split('.')
                .reduce((o, key) => o[key], defaultConfig) || defaultValue,
        hasSeries: jest.fn(() => true),
        hasTone: jest.fn(() => true),
        referencesOfType: jest.fn(() => [
            {
                name: 'test-1',
            },
            {
                name: 'test-2',
            },
        ]),
        webPublicationDateAsUrlPart: jest.fn(() => '2017/07/19'),
    };
});

describe('isMatch', () => {
    afterEach(() => {
        jest.resetModules();
    });

    it('should callback on match reports', () => {
        const yesable = jest.fn();

        config.page.tones = 'Match reports';
        config.referencesOfType = jest.fn(() => [34, 3]);

        isMatch(yesable);

        expect(yesable).toHaveBeenCalledWith({
            date: '2017/07/19',
            teams: [34, 3],
            pageType: 'report',
            isLive: false,
        });
    });

    it('should callback on minute by minute live blogs', () => {
        const yesable = jest.fn();

        config.referencesOfType = jest.fn(() => [33, 1]);
        config.page.isLiveBlog = true;

        isMatch(yesable);

        expect(yesable).toHaveBeenCalledWith({
            date: '2017/07/19',
            teams: [33, 1],
            pageType: 'minbymin',
            isLive: false,
        });
    });

    it('should callback on match previews', () => {
        const yesable = jest.fn();

        config.referencesOfType = jest.fn(() => [1, 2]);
        config.page.isLiveBlog = false;
        config.page.series = 'Match previews';
        config.hasTone.mockReturnValue(false);

        isMatch(yesable);

        expect(yesable).toHaveBeenCalledWith({
            date: '2017/07/19',
            teams: [1, 2],
            pageType: 'preview',
            isLive: false,
        });
    });

    it('should not callback without two teams', () => {
        const yesable = jest.fn();

        config.referencesOfType = jest.fn(() => [1]);
        config.page.isLiveBlog = true;

        isMatch(yesable);

        expect(yesable).not.toHaveBeenCalled();
    });
});

describe('isClockwatch', () => {
    it('should not callback on non-clockwatch series', () => {
        const yesable = jest.fn();
        config.page.series = 'Blogger of the week (Cities)';
        config.hasSeries.mockReturnValue(false);

        isClockwatch(yesable);

        expect(yesable).not.toHaveBeenCalled();
    });

    it('should callback on clockwatch pages', () => {
        const yesable = jest.fn();
        config.page.series = 'Clockwatch';
        config.hasSeries.mockReturnValue(true);

        isClockwatch(yesable);

        expect(yesable).toHaveBeenCalled();
    });
});

describe('isLiveClockwatch', () => {
    it('should not callback on non-live clockwatches', () => {
        const yesable = jest.fn();
        config.page.series = 'Clockwatch';
        config.page.isLive = false;

        isLiveClockwatch(yesable);

        expect(yesable).not.toHaveBeenCalled();
    });

    it('should callback on live clockwatches', () => {
        const yesable = jest.fn();
        config.page.series = 'Clockwatch';
        config.page.isLive = true;

        isLiveClockwatch(yesable);

        expect(yesable).toHaveBeenCalled();
    });
});

describe('keywordExists', () => {
    it('should identify that given keywords are in config', () => {
        config.page.keywords = 'foo,bar';

        expect(keywordExists(['foo'])).toBe(true);
    });

    it('should return false when no given keywords are in config', () => {
        config.page.keywords = undefined;

        expect(keywordExists(['foo'])).toBe(false);
    });
});
