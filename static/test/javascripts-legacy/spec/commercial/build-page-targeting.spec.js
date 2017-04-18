define([
    'helpers/injector',
    'lib/storage'
], function (
    Injector,
    storage
) {
    describe('Build Page Targeting', function () {

        var buildPageTargeting,
            config,
            cookies,
            detect,
            identity,
            userAdTargeting,
            ab,
            krux,
            injector = new Injector();

        beforeEach(function (done) {

            injector.mock('lodash/functions/once', function once(func) {
                return func;
            });

            injector.require([
                    'commercial/modules/build-page-targeting',
                    'lib/config',
                    'lib/cookies',
                    'lib/detect',
                    'common/modules/identity/api',
                    'commercial/modules/user-ad-targeting',
                    'common/modules/experiments/utils',
                    'commercial/modules/third-party-tags/krux'],
                function () {
                    buildPageTargeting = arguments[0];
                    config = arguments[1];
                    cookies = arguments[2];
                    detect = arguments[3];
                    identity = arguments[4];
                    userAdTargeting = arguments[5];
                    ab = arguments[6];
                    krux = arguments[7];

                    config.page = {
                        authorIds:          'profile/gabrielle-chan',
                        blogIds:            'a/blog',
                        contentType:        'Video',
                        edition:            'US',
                        isSurging:          true,
                        keywordIds:         'uk-news/prince-charles-letters,uk/uk,uk/prince-charles',
                        pageId:             'football/series/footballweekly',
                        publication:        'The Observer',
                        seriesId:           'film/series/filmweekly',
                        source:             'ITN',
                        sponsorshipType:    'advertisement-features',
                        tones:              'News',
                        videoDuration:      63
                    };

                    config.ophan = {
                        pageViewId: 'presetOphanPageViewId'
                    };

                    cookies.getCookie = function () {
                        return 'ng101';
                    };
                    detect.getBreakpoint = function () {
                        return 'mobile';
                    };
                    identity.isUserLoggedIn = function () {
                        return true;
                    };
                    userAdTargeting.getUserSegments = function () {
                        return ['seg1', 'seg2'];
                    };
                    ab.getParticipations = function () {
                        return {
                            MtMaster: {
                                variant: 'variantName'
                            }
                        };
                    };
                    krux.getSegments = function () {
                        return ['E012712', 'E012390', 'E012478'];
                    };
                    storage.local.set('gu.alreadyVisited', 0);
                    done();
                });
        });

        afterEach(function () {
            document.referrer = '';
        });

        it('should exist', function () {
            expect(buildPageTargeting).toBeDefined();
        });

        it('should build correct page targeting', function () {
            var pageTargeting = buildPageTargeting();

            expect(pageTargeting.edition).toBe('us');
            expect(pageTargeting.ct).toBe('video');
            expect(pageTargeting.p).toBe('ng');
            expect(pageTargeting.su).toBe(true);
            expect(pageTargeting.bp).toBe('mobile');
            expect(pageTargeting.at).toBe('ng101');
            expect(pageTargeting.si).toEqual('t');
            expect(pageTargeting.gdncrm).toEqual(['seg1', 'seg2']);
            expect(pageTargeting.co).toEqual(['gabrielle-chan']);
            expect(pageTargeting.bl).toEqual(['blog']);
            expect(pageTargeting.ms).toBe('itn');
            expect(pageTargeting.tn).toEqual(['news']);
            expect(pageTargeting.vl).toEqual('90');
            expect(pageTargeting.pv).toEqual('presetOphanPageViewId');
        });

        it('should set correct edition param', function () {
            expect(buildPageTargeting().edition).toBe('us');
        });

        it('should set correct se param', function () {
            expect(buildPageTargeting().se).toBe('filmweekly');
        });

        it('should use pageId if no seriesId', function () {
            config.page.seriesId = null;

            expect(buildPageTargeting().se).toBe('footballweekly');
        });

        it('should set correct k param', function () {
            expect(buildPageTargeting().k).toEqual(['prince-charles-letters', 'uk/uk', 'prince-charles']);
        });

        it('should use pageId if no keywordIds', function () {
            config.page.keywordIds = null;

            expect(buildPageTargeting().k).toEqual('footballweekly');
        });

        it('should set correct ab param', function () {
            expect(buildPageTargeting().ab).toEqual(['MtMaster-variantName']);
        });

        it('should set correct krux params', function () {
            expect(buildPageTargeting().x).toEqual(['E012712', 'E012390', 'E012478']);
        });

        it('should set Observer flag for Observer content', function () {
            expect(buildPageTargeting().ob).toEqual('t');
        });

        it('should not set Observer flag for Guardian content', function () {
            config.page.publication = 'The Guardian';
            expect(buildPageTargeting().ob).toEqual(undefined);
        });

        it('should set correct branding param for sponsored content', function () {
            config.page.sponsorshipType = 'sponsored';
            expect(buildPageTargeting().br).toEqual('s');
        });

        it('should set correct branding param for paid content', function () {
            config.page.sponsorshipType = 'paid-content';
            expect(buildPageTargeting().br).toEqual('p');
        });

        it('should set correct branding param for foundation-funded content', function () {
            config.page.sponsorshipType = 'foundation';
            expect(buildPageTargeting().br).toEqual('f');
        });

        it('should not set branding param for unbranded content', function () {
            config.page.sponsorshipType = undefined;
            expect(buildPageTargeting().br).toEqual(undefined);
        });

        it('should remove empty values', function () {
            config.page = {};
            config.ophan.pageViewId = '123456';
            userAdTargeting.getUserSegments = function () {
                return [];
            };
            krux.getSegments = function () {
                return [];
            };

            expect(buildPageTargeting()).toEqual({
                url: '/context.html',
                p: 'ng',
                bp: 'mobile',
                at: 'ng101',
                si: 't',
                ab: ['MtMaster-variantName'],
                pv: '123456',
                fr: '0'
            });
        });

        describe('Already visited frequency', function () {
            it('can pass a value of five or less', function () {
                storage.local.set('gu.alreadyVisited', 5);
                expect(buildPageTargeting().fr).toEqual('5');
            });

            it('between five and thirty, includes it in a bucket in the form "x-y"', function () {
                storage.local.set('gu.alreadyVisited', 18);
                expect(buildPageTargeting().fr).toEqual('16-19');
            });

            it('over thirty, includes it in the bucket "30plus"', function () {
                storage.local.set('gu.alreadyVisited', 300);
                expect(buildPageTargeting().fr).toEqual('30plus');
            });

            it('passes a value of 0 if the value is not stored', function () {
                storage.local.remove('gu.alreadyVisited');
                expect(buildPageTargeting().fr).toEqual('0');
            });
        });

        describe('Referrer', function () {
            afterEach(function () {
                detect.getReferrer = function () {
                    return '';
                };
            });

            it('should set ref to Facebook', function () {
                detect.getReferrer = function () {
                    return 'https://www.facebook.com/feel-the-force';
                };
                expect(buildPageTargeting().ref).toEqual('facebook');
            });

            it('should set ref to Twitter', function () {
                detect.getReferrer = function () {
                    return 'https://www.t.co/you-must-unlearn-what-you-have-learned';
                };
                expect(buildPageTargeting().ref).toEqual('twitter');
            });

            it('should set ref to Googleplus', function () {
                detect.getReferrer = function () {
                    return 'https://plus.url.google.com/always-pass-on-what-you-have-learned';
                };
                expect(buildPageTargeting().ref).toEqual('googleplus');
            });

            it('should set ref to reddit', function () {
                detect.getReferrer = function () {
                    return 'https://www.reddit.com/its-not-my-fault';
                };
                expect(buildPageTargeting().ref).toEqual('reddit');
            });

            it('should set ref to google', function () {
                detect.getReferrer = function () {
                    return 'https://www.google.com/i-find-your-lack-of-faith-distrubing';
                };
                expect(buildPageTargeting().ref).toEqual('google');
            });

            it('should set ref empty string if referrer does not match', function () {
                detect.getReferrer = function () {
                    return 'https://theguardian.com';
                };

                expect(buildPageTargeting().ref).toEqual(undefined);
            });
        });
    });
});
