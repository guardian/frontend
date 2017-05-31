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
                    buildPageTargeting = arguments[0].buildPageTargeting;
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
                        keywordIds:         'uk-news/prince-charles-letters,uk/uk,uk/prince-charles',
                        pageId:             'football/series/footballweekly',
                        publication:        'The Observer',
                        seriesId:           'film/series/filmweekly',
                        source:             'ITN',
                        sponsorshipType:    'advertisement-features',
                        tones:              'News',
                        videoDuration:      63,
                        sharedAdTargeting:  {
                            bl:      ['blog'],
                            br:      'p',
                            co:      ['gabrielle-chan'],
                            ct:      'video',
                            edition: 'us',
                            k:       ['prince-charles-letters','uk/uk','prince-charles'],
                            ob:      't',
                            p:       'ng',
                            se:      ['filmweekly'],
                            su:      ['5'],
                            tn:      ['news'],
                            url:     '/football/series/footballweekly'
                        }
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
            expect(pageTargeting.su).toEqual(['5']);
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
            expect(buildPageTargeting().se).toEqual(['filmweekly']);
        });

        it('should set correct k param', function () {
            expect(buildPageTargeting().k).toEqual(['prince-charles-letters', 'uk/uk', 'prince-charles']);
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

        it('should set correct branding param for paid content', function () {
            expect(buildPageTargeting().br).toEqual('p');
        });

        it('should set the ad-free param to t when enabled', function () {
            expect(buildPageTargeting(true).af).toBe('t');
        });

        it('should not contain an ad-free param when disabled', function () {
            expect(buildPageTargeting(false).af).toBeUndefined();
        });

        it('should not contain an ad-free param when not specified', function () {
            expect(buildPageTargeting().af).toBeUndefined();
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
