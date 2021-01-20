import { breakingNews } from 'common/modules/onward/breaking-news';

jest.mock('lib/raven');
jest.mock('@guardian/libs', () => ({
    storage: {
        local: {
            get: jest.fn(key => {
                if (key === 'gu.breaking-news.hidden') {
                    return {
                        alert_1: false,
                        alert_2: false,
                        alert_3: false,
                    };
                }
            }),
            set: jest.fn(),
            isAvailable: jest.fn().mockReturnValue(true),
        },
    }
}));
/**
 * we have to mock config like this because
 * loading breaking-news has side affects
 * that are dependent on config.
 * */

jest.mock('lib/config', () => {
    const defaultConfig = {
        page: {
            pageId: '12345',
            edition: 'UK',
            section: 'football',
        },
    };

    return Object.assign({}, defaultConfig, {
        get: (path = '', defaultValue) =>
            path
                .replace(/\[(.+?)\]/g, '.$1')
                .split('.')
                .reduce((o, key) => o[key], defaultConfig) || defaultValue,
    });
});
jest.mock('lib/fetch-json', () =>
    jest.fn().mockReturnValue(
        Promise.resolve({
            webTitle: 'Breaking News',
            collections: [
                {
                    href: 'global',
                    content: [
                        {
                            headline: 'alert 1',
                            id: 'alert_1',
                            frontPublicationDate: Date.now(),
                        },
                    ],
                },
                {
                    href: 'uk',
                    content: [
                        {
                            headline: 'alert 2',
                            id: 'alert_2',
                            frontPublicationDate: Date.now() - 1000,
                        },
                    ],
                },
                {
                    href: 'sport',
                    content: [
                        {
                            headline: 'alert 3',
                            id: 'alert_3',
                            frontPublicationDate: Date.now() - 2000,
                        },
                    ],
                },
            ],
        })
    )
);
jest.mock('common/modules/ui/relativedates', () => ({
    isWithinSeconds: jest.fn().mockReturnValue(true),
}));
jest.mock('lodash/template', () => jest.fn());
jest.useFakeTimers();

const isAvailableMock = require('@guardian/libs').storage.local.isAvailable;
const getMock = require('@guardian/libs').storage.local.get;
const setMock = require('@guardian/libs').storage.local.set;
const fakeFetchJson = require('lib/fetch-json');
const isWithinSecondsMock = require('common/modules/ui/relativedates')
    .isWithinSeconds;
const fakeTemplate = require('lodash/template');

const BREAKING_NEWS_DELAY = 3000;

beforeEach(() => {
    isAvailableMock.mockClear();
    getMock.mockClear();
    isWithinSecondsMock.mockClear();
    fakeFetchJson.mockClear();
    fakeTemplate.mockReset();
});

describe('breaking news', () => {
    const knownAlertIDsStorageKey = 'gu.breaking-news.hidden';

    describe('canShow', () => {
        it('should return true', () => {
            const compiled = jest.fn();

            fakeTemplate.mockReturnValueOnce(compiled);
            return breakingNews.canShow().then(canShow => {
                expect(canShow).toBe(true);
            });
        });

        it('should return false if user cannot dismiss alerts', () => {
            isAvailableMock.mockReturnValueOnce(false);

            return breakingNews.canShow().then(canShow => {
                expect(canShow).toBe(false);
            });
        });

        it('should return false if fetchBreakingNews returns no collection', () => {
            fakeFetchJson.mockReturnValueOnce(
                Promise.resolve({
                    webTitle: 'Breaking News',
                })
            );

            return breakingNews.canShow().then(canShow => {
                expect(canShow).toBe(false);
            });
        });

        it('should return false if fetchBreakingNews returns an empty collection', () => {
            fakeFetchJson.mockReturnValueOnce(
                Promise.resolve({
                    webTitle: 'Breaking News',
                    collections: [],
                })
            );

            return breakingNews.canShow().then(canShow => {
                expect(canShow).toBe(false);
            });
        });

        it('should return false if fetchBreakingNews returns a collection with no content', () => {
            fakeFetchJson.mockReturnValueOnce(
                Promise.resolve({
                    webTitle: 'Breaking News',
                    collections: [{}],
                })
            );

            return breakingNews.canShow().then(canShow => {
                expect(canShow).toBe(false);
            });
        });

        it('should return false if fetchBreakingNews returns a collection with empty content', () => {
            fakeFetchJson.mockReturnValueOnce(
                Promise.resolve({
                    webTitle: 'Breaking News',
                    collections: [
                        {
                            content: [],
                        },
                    ],
                })
            );

            return breakingNews.canShow().then(canShow => {
                expect(canShow).toBe(false);
            });
        });

        it('should return false if fetchBreakingNews returns a collection with no relevant alerts', () => {
            fakeFetchJson.mockReturnValueOnce(
                Promise.resolve({
                    webTitle: 'Breaking News',
                    collections: [
                        {
                            href: 'foo',
                            content: [{}],
                        },
                    ],
                })
            );

            return breakingNews.canShow().then(canShow => {
                expect(canShow).toBe(false);
            });
        });

        it('should return false if fetchBreakingNews returns a collection a relevent alert that has already been dismissed', () => {
            getMock.mockImplementationOnce(key => {
                if (key === knownAlertIDsStorageKey) {
                    return {
                        alert_1: true,
                    };
                }
            });

            fakeFetchJson.mockReturnValueOnce(
                Promise.resolve({
                    webTitle: 'Breaking News',
                    collections: [
                        {
                            href: 'global',
                            content: [
                                {
                                    id: 'alert_1',
                                },
                            ],
                        },
                    ],
                })
            );

            return breakingNews.canShow().then(canShow => {
                expect(canShow).toBe(false);
            });
        });

        it('should return false if fetchBreakingNews returns a collection with relevent alerts that are over 20 mins old', () => {
            isWithinSecondsMock.mockReturnValueOnce(false);

            getMock.mockImplementationOnce(key => {
                if (key === knownAlertIDsStorageKey) {
                    return {
                        alert_1: false,
                    };
                }
            });

            fakeFetchJson.mockReturnValueOnce(
                Promise.resolve({
                    webTitle: 'Breaking News',
                    collections: [
                        {
                            href: 'global',
                            content: [
                                {
                                    id: 'alert_1',
                                    frontPublicationDate: Date.now(),
                                },
                            ],
                        },
                    ],
                })
            );

            return breakingNews.canShow().then(canShow => {
                expect(canShow).toBe(false);
            });
        });

        it('should return false if relevant alert for a different edition', () => {
            fakeFetchJson.mockReturnValueOnce(
                Promise.resolve({
                    webTitle: 'Breaking News',
                    collections: [
                        {
                            href: 'aus',
                            content: [
                                {
                                    headline: 'alert 1',
                                    id: 'alert_1',
                                    frontPublicationDate: Date.now(),
                                },
                            ],
                        },
                    ],
                })
            );

            return breakingNews.canShow().then(canShow => {
                expect(canShow).toBe(false);
            });
        });
    });

    describe('show', () => {
        beforeEach(() => {
            if (document && document.body) {
                document.body.innerHTML =
                    '<div class="js-breaking-news-placeholder breaking-news breaking-news--hidden breaking-news--fade-in" data-link-name="breaking news" data-component="breaking-news"></div>';
            }
            setTimeout.mockClear();
        });

        afterEach(() => {
            if (document && document.body) {
                document.body.innerHTML = '';
            }
        });

        it('should wait 3 seconds before displaying new alert', () => {
            const compiled = jest.fn();

            fakeTemplate.mockReturnValueOnce(compiled);
            getMock.mockImplementationOnce(key => {
                if (key === knownAlertIDsStorageKey) {
                    return {
                        alert_2: false,
                        alert_3: false,
                    };
                }
            });

            return breakingNews.canShow().then(canShow => {
                expect(canShow).toBe(true);

                if (canShow) {
                    breakingNews.show();

                    const callLength = setMock.mock.calls.length;

                    const lastCallArgs = setMock.mock.calls[callLength - 1];

                    if (document) {
                        const fadeInElems = document.querySelectorAll(
                            '.breaking-news--hidden.breaking-news--fade-in'
                        );
                        expect(fadeInElems.length).toBe(1);

                        const spectreElems = document.querySelectorAll(
                            '.breaking-news--spectre'
                        );
                        expect(spectreElems.length).toBe(0);
                    }

                    jest.runAllTimers();

                    expect(setTimeout.mock.calls[0][1]).toBe(
                        BREAKING_NEWS_DELAY
                    );

                    if (document) {
                        const hiddenElems = document.querySelectorAll(
                            '.breaking-news--hidden'
                        );
                        expect(hiddenElems.length).toBe(0);

                        const spectreElems = document.querySelectorAll(
                            '.breaking-news--spectre'
                        );
                        expect(spectreElems.length).toBe(1);

                        // console.log('compiled', compiled.mock.calls[0][0].id)
                        expect(compiled.mock.calls[0][0].id).toBe('alert_1');
                    }

                    expect(lastCallArgs[0]).toEqual(knownAlertIDsStorageKey);

                    expect(lastCallArgs[1]).toEqual({
                        alert_1: false,
                        alert_2: false,
                        alert_3: false,
                    });
                }
            });
        });

        it('should show a known alert immediately', () => {
            const compiled = jest.fn();

            fakeTemplate.mockReturnValueOnce(compiled);
            return breakingNews.canShow().then(canShow => {
                expect(canShow).toBe(true);

                if (canShow) {
                    breakingNews.show();

                    const callLength = setMock.mock.calls.length;
                    const lastCallArgs = setMock.mock.calls[callLength - 1];

                    if (document) {
                        const fadeInElems = document.querySelectorAll(
                            '.breaking-news--hidden.breaking-news--fade-in'
                        );
                        expect(fadeInElems.length).toBe(1);

                        const spectreElems = document.querySelectorAll(
                            '.breaking-news--spectre'
                        );
                        expect(spectreElems.length).toBe(0);
                    }

                    jest.runAllTimers();
                    expect(setTimeout.mock.calls[0][1]).toBe(0);

                    if (document) {
                        const hiddenElems = document.querySelectorAll(
                            '.breaking-news--hidden'
                        );
                        expect(hiddenElems.length).toBe(0);

                        const spectreElems = document.querySelectorAll(
                            '.breaking-news--spectre'
                        );
                        expect(spectreElems.length).toBe(1);

                        expect(compiled.mock.calls[0][0].id).toBe('alert_1');
                    }

                    expect(lastCallArgs[0]).toEqual(knownAlertIDsStorageKey);
                    expect(lastCallArgs[1]).toEqual({
                        alert_1: false,
                        alert_2: false,
                        alert_3: false,
                    });
                }
            });
        });

        it('should show a global alert before an edition alert', () => {
            const pubDate = Date.now();
            const compiled = jest.fn();

            fakeTemplate.mockReturnValueOnce(compiled);
            fakeFetchJson.mockReturnValueOnce(
                Promise.resolve({
                    webTitle: 'Breaking News',
                    collections: [
                        {
                            href: 'uk',
                            content: [
                                {
                                    headline: 'alert 1',
                                    id: 'alert_1',
                                    frontPublicationDate: pubDate,
                                },
                            ],
                        },
                        {
                            href: 'global',
                            content: [
                                {
                                    headline: 'alert 2',
                                    id: 'alert_2',
                                    frontPublicationDate: pubDate,
                                },
                            ],
                        },
                    ],
                })
            );

            getMock.mockImplementationOnce(key => {
                if (key === knownAlertIDsStorageKey) {
                    return {
                        alert_1: false,
                        alert_2: false,
                    };
                }
            });

            return breakingNews.canShow().then(canShow => {
                expect(canShow).toBe(true);

                if (canShow) {
                    breakingNews.show();

                    const callLength = setMock.mock.calls.length;
                    const lastCallArgs = setMock.mock.calls[callLength - 1];

                    if (document) {
                        const fadeInElems = document.querySelectorAll(
                            '.breaking-news--hidden.breaking-news--fade-in'
                        );
                        expect(fadeInElems.length).toBe(1);

                        const spectreElems = document.querySelectorAll(
                            '.breaking-news--spectre'
                        );
                        expect(spectreElems.length).toBe(0);
                    }

                    jest.runAllTimers();
                    expect(setTimeout.mock.calls[0][1]).toBe(0);

                    if (document) {
                        const hiddenElems = document.querySelectorAll(
                            '.breaking-news--hidden'
                        );
                        expect(hiddenElems.length).toBe(0);

                        const spectreElems = document.querySelectorAll(
                            '.breaking-news--spectre'
                        );
                        expect(spectreElems.length).toBe(1);

                        expect(compiled.mock.calls[0][0].id).toBe('alert_2');
                    }

                    expect(lastCallArgs[0]).toEqual(knownAlertIDsStorageKey);
                    expect(lastCallArgs[1]).toEqual({
                        alert_1: false,
                        alert_2: false,
                    });
                }
            });
        });

        it('should show an edition alert before a section alert', () => {
            const pubDate = Date.now();
            const compiled = jest.fn();

            fakeTemplate.mockReturnValueOnce(compiled);
            fakeFetchJson.mockReturnValueOnce(
                Promise.resolve({
                    webTitle: 'Breaking News',
                    collections: [
                        {
                            href: 'sport',
                            content: [
                                {
                                    headline: 'alert 1',
                                    id: 'alert_1',
                                    frontPublicationDate: pubDate,
                                },
                            ],
                        },
                        {
                            href: 'uk',
                            content: [
                                {
                                    headline: 'alert 2',
                                    id: 'alert_2',
                                    frontPublicationDate: pubDate,
                                },
                            ],
                        },
                    ],
                })
            );

            getMock.mockImplementationOnce(key => {
                if (key === knownAlertIDsStorageKey) {
                    return {
                        alert_1: false,
                        alert_2: false,
                    };
                }
            });

            return breakingNews.canShow().then(canShow => {
                expect(canShow).toBe(true);

                if (canShow) {
                    breakingNews.show();

                    const callLength = setMock.mock.calls.length;
                    const lastCallArgs = setMock.mock.calls[callLength - 1];

                    if (document) {
                        const fadeInElems = document.querySelectorAll(
                            '.breaking-news--hidden.breaking-news--fade-in'
                        );
                        expect(fadeInElems.length).toBe(1);

                        const spectreElems = document.querySelectorAll(
                            '.breaking-news--spectre'
                        );
                        expect(spectreElems.length).toBe(0);
                    }

                    jest.runAllTimers();
                    expect(setTimeout.mock.calls[0][1]).toBe(0);

                    if (document) {
                        const hiddenElems = document.querySelectorAll(
                            '.breaking-news--hidden'
                        );
                        expect(hiddenElems.length).toBe(0);

                        const spectreElems = document.querySelectorAll(
                            '.breaking-news--spectre'
                        );
                        expect(spectreElems.length).toBe(1);

                        expect(compiled.mock.calls[0][0].id).toBe('alert_2');
                    }

                    expect(lastCallArgs[0]).toEqual(knownAlertIDsStorageKey);
                    expect(lastCallArgs[1]).toEqual({
                        alert_1: false,
                        alert_2: false,
                    });
                }
            });
        });
    });
});
