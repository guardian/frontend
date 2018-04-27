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
jest.useFakeTimers();

const fakeFetchJson: any = require('lib/fetch-json');
const fakeRelativeDates: any = require('common/modules/ui/relativedates');

describe('breaking news', () => {
    const knownAlertIDsStorageKey = 'gu.breaking-news.hidden';

    beforeEach(() => {
        localStorageStub.isAvailable.mockReturnValue(true);
        fakeRelativeDates.isWithinSeconds.mockImplementationOnce(
            () => false
        );
        localStorageStub.get.mockImplementationOnce(key => {
            if (key === knownAlertIDsStorageKey) {
                return {
                    alert_1: false,
                    alert_2: false,
                    alert_3: false,
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
                }, {
                    href: 'uk',
                    content: [{
                        id: 'alert_2',
                        frontPublicationDate: Date.now() - 1000,
                    }] 
                }, {
                    href: 'sport',
                    content: [{
                        id: 'alert_3',
                        frontPublicationDate: Date.now() - 2000,
                    }] 
                }],
            })
        );
    });

    describe('canShow returns false', () => {
        it('if user cannot dismiss alerts', () => {
            localStorageStub.isAvailable.mockReturnValue(false);
        
            return breakingNews.canShow().then(canShow => {
                expect(canShow).toBe(false);
            });
        });

        it('if fetchBreakingNews returns no collection', () => {
            fakeFetchJson.mockReturnValue(
                Promise.resolve({
                    webTitle: 'Breaking News',
                })
            );

            return breakingNews.canShow().then(canShow => {
                expect(canShow).toBe(false);
            });
        });

        it('if fetchBreakingNews returns an empty collection', () => {
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

        it('if fetchBreakingNews returns a collection with no content', () => {
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

        it('if fetchBreakingNews returns a collection with empty content', () => {
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

        it('if fetchBreakingNews returns a collection with no relevant alerts', () => {
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

        it('if fetchBreakingNews returns a collection with relevent alerts that have already been dismissed', () => {
            localStorageStub.get.mockImplementationOnce(key => {
                if (key === knownAlertIDsStorageKey) {
                    return {
                        alert_1: true,
                        alert_2: true,
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
                    }, {
                        href: 'global',
                        content: [{
                            id: 'alert_2'
                        }]
                    }],
                })
            );

            return breakingNews.canShow().then(canShow => {
                expect(canShow).toBe(false);
            });
        });

        it('if fetchBreakingNews returns a collection with relevent alerts that are over 20 mins old', () => {
            fakeRelativeDates.isWithinSeconds.mockImplementationOnce(
                () => false
            );

            localStorageStub.get.mockImplementationOnce(key => {
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
    });

});

// import $ from 'lib/$';
// import { breakingNewsInit } from 'common/modules/onward/breaking-news';
// import mediator from 'lib/mediator';
// import { local as localStorageStub } from 'lib/storage';

// jest.mock('lib/storage', () => ({
//     local: {
//         get: jest.fn(),
//         set: jest.fn(),
//         isAvailable: jest.fn(),
//     },
// }));
// jest.mock('lib/config', () => ({
//     page: {
//         edition: 'UK',
//     },
// }));
// jest.mock('lib/fetch-json', () => jest.fn());
// jest.mock('fastdom');
// jest.mock('common/modules/ui/relativedates', () => ({
//     isWithinSeconds: jest.fn(() => true),
// }));
// jest.useFakeTimers();

// const fakeFetchJson: any = require('lib/fetch-json');
// const fakeRelativeDates: any = require('common/modules/ui/relativedates');

// describe('Breaking news', () => {
//     const knownAlertIDsStorageKey = 'gu.breaking-news.hidden';
//     const BREAKING_NEWS_DELAY = 3000;
//     const alertThatIs = (type, options) => {
//         const opts = Object.assign(
//             {},
//             {
//                 collection: 'uk',
//                 age: 1,
//             },
//             options
//         );
//         const sAge = opts.age !== 1 ? `${opts.age}min ` : '';

//         return {
//             href: opts.collection,
//             content: [
//                 {
//                     headline: `${sAge + opts.collection} ${type} headline`,
//                     trailText: `${opts.collection} ${type} trailText`,
//                     id: `${opts.collection}_${type}`,
//                     frontPublicationDate: Date.now() - 1000 * 60 * opts.age,
//                 },
//             ],
//         };
//     };
//     const callBreakingNewsWith = collections => {
//         fakeFetchJson.mockReturnValue(
//             Promise.resolve({
//                 webTitle: 'Breaking News',
//                 collections,
//             })
//         );
//         localStorageStub.get.mockImplementationOnce(key => {
//             if (key === knownAlertIDsStorageKey) {
//                 return {
//                     uk_known: false,
//                     uk_dismissed: true,
//                 };
//             }
//         });

//         return breakingNewsInit();
//     };

//     beforeEach(() => {
//         $('body').html(
//             '<div class="js-breaking-news-placeholder breaking-news breaking-news--hidden breaking-news--fade-in" data-link-name="breaking news" data-component="breaking-news"></div>'
//         );
//         setTimeout.mockClear();
//     });

//     afterEach(() => {
//         mediator.removeAllListeners();

//         $('.js-breaking-news-placeholder').remove();
//     });

//     describe('user cannot dismiss alerts', () => {
//         beforeEach(() => {
//             localStorageStub.isAvailable.mockReturnValue(false);
//         });

//         it('should not try and fetch the json', done => {
//             callBreakingNewsWith([])
//                 .then(
//                     () => {
//                         done.fail(
//                             'user cannot use local storage, but we seem to think things are okish'
//                         );
//                     },
//                     res => {
//                         expect(fakeFetchJson).not.toHaveBeenCalled();
//                         expect(res.message).toEqual('cannot dismiss');
//                         expect(
//                             $('.js-breaking-news-placeholder:not(:empty)')
//                                 .length
//                         ).toBe(0);
//                     }
//                 )
//                 .then(done)
//                 .catch(done.fail);
//         });
//     });

//     describe('user can dismiss alerts', () => {
//         beforeEach(() => {
//             localStorageStub.isAvailable.mockReturnValue(true);
//         });

//         it('should try and fetch the json', done => {
//             callBreakingNewsWith([])
//                 .then(() => {
//                     expect(fakeFetchJson).toHaveBeenCalled();
//                 })
//                 .then(done)
//                 .catch(done.fail);
//         });

//         it('should show an unknown alert after 3 seconds and record it', done => {
//             const collections = [
//                 alertThatIs('unknown', { age: 2, collection: 'uk' }),
//             ];

//             callBreakingNewsWith(collections)
//                 .then(alert => {
//                     if (!alert) {
//                         return done.fail(
//                             'Exception reported in breaking news initialisation'
//                         );
//                     }
//                     const callLength = localStorageStub.set.mock.calls.length;
//                     const lastCallArgs =
//                         localStorageStub.set.mock.calls[callLength - 1];

//                     expect(alert.headline).toEqual('2min uk unknown headline');
//                     expect(
//                         $('.breaking-news--hidden.breaking-news--fade-in')
//                             .length
//                     ).toBe(1);
//                     expect($('.breaking-news--spectre').length).toBe(0);

//                     jest.runAllTimers();
//                     expect(setTimeout.mock.calls[0][1]).toBe(
//                         BREAKING_NEWS_DELAY
//                     );

//                     expect($('.breaking-news--spectre').length).toBe(1);
//                     expect($('.breaking-news--hidden').length).toBe(0);
//                     expect(lastCallArgs[0]).toEqual(knownAlertIDsStorageKey);
//                     expect(lastCallArgs[1]).toEqual({
//                         uk_unknown: false,
//                     });
//                 })
//                 .then(done)
//                 .catch(done.fail);
//         });

//         it('should show a known alert immediately', done => {
//             const collections = [alertThatIs('known')];
//             callBreakingNewsWith(collections)
//                 .then(alert => {
//                     if (!alert) {
//                         return done.fail(
//                             'Exception reported in breaking news initialisation'
//                         );
//                     }

//                     jest.runAllTimers();
//                     expect(setTimeout.mock.calls[0][1]).toBe(0);

//                     expect(alert.headline).toEqual('uk known headline');
//                     expect(
//                         $('.breaking-news--hidden.breaking-news--fade-in')
//                             .length
//                     ).toBe(0);
//                     expect($('.breaking-news--spectre').length).toBe(1);
//                     expect($('.breaking-news--hidden').length).toBe(0);
//                 })
//                 .then(done)
//                 .catch(done.fail);
//         });

//         it('should not show a dismissed alert', done => {
//             const collections = [alertThatIs('dismissed')];
//             callBreakingNewsWith(collections)
//                 .then(alert => {
//                     expect(alert).toBeFalsy();
//                     expect(
//                         $('.js-breaking-news-placeholder:not(:empty)').length
//                     ).toBe(0);
//                 })
//                 .then(done)
//                 .catch(done.fail);
//         });

//         it('should show an alert for this edition', done => {
//             const collections = [alertThatIs('unknown', { collection: 'uk' })];
//             callBreakingNewsWith(collections)
//                 .then(alert => {
//                     expect(alert).not.toBeUndefined();
//                 })
//                 .then(done)
//                 .catch(done.fail);
//         });

//         it('should not show an alert for a different edition', done => {
//             const collections = [alertThatIs('unknown', { collection: 'us' })];
//             callBreakingNewsWith(collections)
//                 .then(alert => {
//                     expect(alert).toBeUndefined();
//                 })
//                 .then(done)
//                 .catch(done.fail);
//         });

//         it('should show a global alert before an edition alert', done => {
//             const collections = [
//                 alertThatIs('unknown', { collection: 'uk' }),
//                 alertThatIs('unknown', { collection: 'global' }),
//             ];
//             callBreakingNewsWith(collections)
//                 .then(alert => {
//                     if (!alert) {
//                         return done.fail(
//                             'Exception reported in breaking news initialisation'
//                         );
//                     }

//                     expect(alert.headline).toEqual('global unknown headline');
//                 })
//                 .then(done)
//                 .catch(done.fail);
//         });

//         it('should show an edition alert before a section alert', done => {
//             const collections = [
//                 alertThatIs('unknown', { collection: 'uk' }),
//                 alertThatIs('unknown', { collection: 'football' }),
//             ];
//             callBreakingNewsWith(collections)
//                 .then(alert => {
//                     if (!alert) {
//                         return done.fail();
//                     }

//                     expect(alert.headline).toEqual('uk unknown headline');
//                 })
//                 .then(done)
//                 .catch(done.fail);
//         });

//         it('should not show an alert that is 20 mins old', done => {
//             const collections = [alertThatIs('unknown', { age: 20 })];

//             fakeRelativeDates.isWithinSeconds.mockImplementationOnce(
//                 () => false
//             );
//             callBreakingNewsWith(collections)
//                 .then(alert => {
//                     expect(alert).toBeUndefined();
//                 })
//                 .then(done)
//                 .catch(done.fail);
//         });

//         it('should show an alert less than 20 mins old', done => {
//             const collections = [alertThatIs('unknown', { age: 19 })];
//             callBreakingNewsWith(collections)
//                 .then(alert => {
//                     expect(alert).not.toBeUndefined();
//                 })
//                 .then(done)
//                 .catch(done.fail);
//         });

//         it('should show the newest viable alert', done => {
//             const collections = [
//                 alertThatIs('unknown', { age: 5 }),
//                 alertThatIs('unknown', { age: 2 }),
//             ];
//             callBreakingNewsWith(collections)
//                 .then(alert => {
//                     if (!alert) {
//                         return done.fail(
//                             'Exception reported in breaking news initialisation'
//                         );
//                     }

//                     expect(alert.headline).toEqual('2min uk unknown headline');
//                 })
//                 .then(done)
//                 .catch(done.fail);
//         });

//         it('should prune known alerts', done => {
//             const collections = [alertThatIs('known')];

//             callBreakingNewsWith(collections)
//                 .then(() => {
//                     const callLength = localStorageStub.set.mock.calls.length;
//                     const lastCallArgs =
//                         localStorageStub.set.mock.calls[callLength - 1];

//                     expect(lastCallArgs[0]).toBe(knownAlertIDsStorageKey);
//                     expect(lastCallArgs[1]).toEqual({
//                         uk_known: false,
//                     });
//                 })
//                 .then(done)
//                 .catch(done.fail);
//         });
//     });

//     describe('banner emits ready events', () => {
//         it('should pass false when banner will not show', done => {
//             mediator.on(
//                 'modules:onwards:breaking-news:ready',
//                 breakingShown => {
//                     expect(breakingShown).toBe(false);
//                     done();
//                 }
//             );

//             callBreakingNewsWith([]).catch(done.fail);
//         });

//         it('should pass true when banner will show', done => {
//             const collections = [
//                 alertThatIs('unknown', { age: 2, collection: 'uk' }),
//             ];

//             mediator.on(
//                 'modules:onwards:breaking-news:ready',
//                 breakingShown => {
//                     expect(breakingShown).toBe(true);
//                     done();
//                 }
//             );

//             callBreakingNewsWith(collections).catch(done.fail);
//         });
//     });
// });
