// @flow
import breakingNews from 'common/modules/onward/breaking-news';
import { local as localStorageStub } from 'lib/storage';

jest.mock('lib/storage', () => ({
    local: {
        get: jest.fn(),
        set: jest.fn(),
        isAvailable: jest.fn(),
    },
}));
jest.mock('lib/config', () => ({
    page: {
        pageId: '12345',
        edition: 'UK',
        section: 'football',
    },
}));
jest.mock('lib/fetch-json', () => jest.fn());
jest.mock('common/modules/ui/relativedates', () => ({
    isWithinSeconds: jest.fn(() => true),
}));
jest.mock('lodash/utilities/template', () => jest.fn());
jest.useFakeTimers();

const fakeFetchJson: any = require('lib/fetch-json');
const fakeRelativeDates: any = require('common/modules/ui/relativedates');
const fakeTemplate: any = require('lodash/utilities/template');

const BREAKING_NEWS_DELAY = 3000;

describe('breaking news', () => {
    const knownAlertIDsStorageKey = 'gu.breaking-news.hidden';

    beforeEach(() => {
        localStorageStub.get.mockImplementation(key => {
            if (key === knownAlertIDsStorageKey) {
                return {
                    alert_1: false,
                    alert_2: false,
                    alert_3: false,
                };
            }
        });
        localStorageStub.isAvailable.mockReturnValue(true);
        fakeRelativeDates.isWithinSeconds.mockReturnValue(true);
        fakeFetchJson.mockReturnValue(
            Promise.resolve({
                webTitle: 'Breaking News',
                collections: [{
                    href: 'global',
                    content: [{
                        headline: 'alert 1',
                        id: 'alert_1',
                        frontPublicationDate: Date.now(),
                    }]
                }, {
                    href: 'uk',
                    content: [{
                        headline: 'alert 2',
                        id: 'alert_2',
                        frontPublicationDate: Date.now() - 1000,
                    }] 
                }, {
                    href: 'sport',
                    content: [{
                        headline: 'alert 3',
                        id: 'alert_3',
                        frontPublicationDate: Date.now() - 2000,
                    }] 
                }],
            })
        );
    });

    afterEach(() => {
        localStorageStub.get.mockReset();
        localStorageStub.isAvailable.mockReset();
        fakeRelativeDates.isWithinSeconds.mockReset();
        fakeFetchJson.mockReset();
        fakeTemplate.mockReset();
    });

    describe('canShow', () => {
        it('should return true', () => {
            return breakingNews.canShow().then(canShow => {
                expect(canShow).toBe(true);
            });
        });

        it('should return false if user cannot dismiss alerts', () => {
            localStorageStub.isAvailable.mockReturnValue(false);
        
            return breakingNews.canShow().then(canShow => {
                expect(canShow).toBe(false);
            });
        });

        it('should return false if fetchBreakingNews returns no collection', () => {
            fakeFetchJson.mockReturnValue(
                Promise.resolve({
                    webTitle: 'Breaking News',
                })
            );

            return breakingNews.canShow().then(canShow => {
                expect(canShow).toBe(false);
            });
        });

        it('should return false if fetchBreakingNews returns an empty collection', () => {
            fakeFetchJson.mockReturnValue(
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
            fakeFetchJson.mockReturnValue(
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
            fakeFetchJson.mockReturnValue(
                Promise.resolve({
                    webTitle: 'Breaking News',
                    collections: [{
                        content: []
                    }],
                })
            );

            return breakingNews.canShow().then(canShow => {
                expect(canShow).toBe(false);
            });
        });

        it('should return false if fetchBreakingNews returns a collection with no relevant alerts', () => {
            fakeFetchJson.mockReturnValue(
                Promise.resolve({
                    webTitle: 'Breaking News',
                    collections: [{
                        href: 'foo',
                        content: [{}]
                    }],
                })
            );

            return breakingNews.canShow().then(canShow => {
                expect(canShow).toBe(false);
            });
        });

        it('should return false if fetchBreakingNews returns a collection a relevent alert that has already been dismissed', () => {
            localStorageStub.get.mockImplementation(key => {
                if (key === knownAlertIDsStorageKey) {
                    return {
                        alert_1: true,
                    };
                }
            });

            fakeFetchJson.mockReturnValue(
                Promise.resolve({
                    webTitle: 'Breaking News',
                    collections: [{
                        href: 'global',
                        content: [{
                            id: 'alert_1'
                        }]
                    }],
                })
            );

            return breakingNews.canShow().then(canShow => {
                expect(canShow).toBe(false);
            });
        });

        it('should return false if fetchBreakingNews returns a collection with relevent alerts that are over 20 mins old', () => {
            fakeRelativeDates.isWithinSeconds.mockReturnValue(false);

            localStorageStub.get.mockImplementation(key => {
                if (key === knownAlertIDsStorageKey) {
                    return {
                        alert_1: false,
                    };
                }
            });

            fakeFetchJson.mockReturnValue(
                Promise.resolve({
                    webTitle: 'Breaking News',
                    collections: [{
                        href: 'global',
                        content: [{
                            id: 'alert_1',
                            frontPublicationDate: Date.now(),
                        }]
                    },],
                })
            );

            return breakingNews.canShow().then(canShow => {
                expect(canShow).toBe(false);
            });
        });

        it('should return false if relevant alert for a different edition', () => {
            fakeFetchJson.mockReturnValue(
                Promise.resolve({
                    webTitle: 'Breaking News',
                    collections: [{
                        href: 'aus',
                        content: [{
                            headline: 'alert 1',
                            id: 'alert_1',
                            frontPublicationDate: Date.now(),
                        }]
                    }],
                })
            );

            return breakingNews.canShow().then(canShow => {
                expect(canShow).toBe(false);
            });
        });

        it('should show an edition alert before a section alert', () => {
        });
    });

    describe('show', () => {
        beforeEach(() => {
            if (document && document.body) {
                document.body.innerHTML = '<div class="js-breaking-news-placeholder breaking-news breaking-news--hidden breaking-news--fade-in" data-link-name="breaking news" data-component="breaking-news"></div>';
            }
            setTimeout.mockClear();
        });

        afterEach(() => {
            if (document && document.body) {
                document.body.innerHTML = '';
            }
        });

        it('should wait 3 seconds before displaying new alert', () => {
            localStorageStub.get.mockImplementation(key => {
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

                    const callLength = localStorageStub.set.mock.calls.length;
                    const lastCallArgs =
                        localStorageStub.set.mock.calls[callLength - 1];

                    if (document) {
                        const fadeInElems = document.querySelectorAll('.breaking-news--hidden.breaking-news--fade-in');
                        expect(fadeInElems.length).toBe(1);

                        const spectreElems = document.querySelectorAll('.breaking-news--spectre');
                        expect(spectreElems.length).toBe(0);
                    }
                    
                    jest.runAllTimers();
                    expect(setTimeout.mock.calls[0][1]).toBe(
                        BREAKING_NEWS_DELAY
                    );

                    if (document) {
                        const hiddenElems = document.querySelectorAll('.breaking-news--hidden');
                        expect(hiddenElems.length).toBe(0);

                        const spectreElems = document.querySelectorAll('.breaking-news--spectre');
                        expect(spectreElems.length).toBe(1);

                        const alertHeadline = document.querySelector('.breaking-news__item-headline');
                        if (alertHeadline) {
                            expect(alertHeadline.innerText).toBe('alert 1');
                        }
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
            return breakingNews.canShow().then(canShow => {
                expect(canShow).toBe(true);
                
                if (canShow) {
                    breakingNews.show();

                    const callLength = localStorageStub.set.mock.calls.length;
                    const lastCallArgs =
                        localStorageStub.set.mock.calls[callLength - 1];

                    if (document) {
                        const fadeInElems = document.querySelectorAll('.breaking-news--hidden.breaking-news--fade-in');
                        expect(fadeInElems.length).toBe(1);

                        const spectreElems = document.querySelectorAll('.breaking-news--spectre');
                        expect(spectreElems.length).toBe(0);
                    }
                    
                    jest.runAllTimers();
                    expect(setTimeout.mock.calls[0][1]).toBe(
                        0
                    );

                    if (document) {
                        const hiddenElems = document.querySelectorAll('.breaking-news--hidden');
                        expect(hiddenElems.length).toBe(0);

                        const spectreElems = document.querySelectorAll('.breaking-news--spectre');
                        expect(spectreElems.length).toBe(1);

                        expect(fakeTemplate.mock.calls[0][1].id).toBe('alert_1');
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
            fakeFetchJson.mockReturnValue(
                Promise.resolve({
                    webTitle: 'Breaking News',
                    collections: [{
                        href: 'uk',
                        content: [{
                            headline: 'alert 1',
                            id: 'alert_1',
                            frontPublicationDate: pubDate,
                        }]
                    }, {
                        href: 'global',
                        content: [{
                            headline: 'alert 2',
                            id: 'alert_2',
                            frontPublicationDate: pubDate,
                        }] 
                    }],
                })
            );

            localStorageStub.get.mockImplementation(key => {
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

                    const callLength = localStorageStub.set.mock.calls.length;
                    const lastCallArgs =
                        localStorageStub.set.mock.calls[callLength - 1];

                    if (document) {
                        const fadeInElems = document.querySelectorAll('.breaking-news--hidden.breaking-news--fade-in');
                        expect(fadeInElems.length).toBe(1);

                        const spectreElems = document.querySelectorAll('.breaking-news--spectre');
                        expect(spectreElems.length).toBe(0);
                    }
                    
                    jest.runAllTimers();
                    expect(setTimeout.mock.calls[0][1]).toBe(
                        0
                    );

                    if (document) {
                        const hiddenElems = document.querySelectorAll('.breaking-news--hidden');
                        expect(hiddenElems.length).toBe(0);

                        const spectreElems = document.querySelectorAll('.breaking-news--spectre');
                        expect(spectreElems.length).toBe(1);

                        expect(fakeTemplate.mock.calls[0][1].id).toBe('alert_2');
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
            fakeFetchJson.mockReturnValue(
                Promise.resolve({
                    webTitle: 'Breaking News',
                    collections: [{
                        href: 'sport',
                        content: [{
                            headline: 'alert 1',
                            id: 'alert_1',
                            frontPublicationDate: pubDate,
                        }]
                    }, {
                        href: 'uk',
                        content: [{
                            headline: 'alert 2',
                            id: 'alert_2',
                            frontPublicationDate: pubDate,
                        }] 
                    }],
                })
            );

            localStorageStub.get.mockImplementation(key => {
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

                    const callLength = localStorageStub.set.mock.calls.length;
                    const lastCallArgs =
                        localStorageStub.set.mock.calls[callLength - 1];

                    if (document) {
                        const fadeInElems = document.querySelectorAll('.breaking-news--hidden.breaking-news--fade-in');
                        expect(fadeInElems.length).toBe(1);

                        const spectreElems = document.querySelectorAll('.breaking-news--spectre');
                        expect(spectreElems.length).toBe(0);
                    }
                    
                    jest.runAllTimers();
                    expect(setTimeout.mock.calls[0][1]).toBe(
                        0
                    );

                    if (document) {
                        const hiddenElems = document.querySelectorAll('.breaking-news--hidden');
                        expect(hiddenElems.length).toBe(0);

                        const spectreElems = document.querySelectorAll('.breaking-news--spectre');
                        expect(spectreElems.length).toBe(1);

                        expect(fakeTemplate.mock.calls[0][1].id).toBe('alert_2');
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