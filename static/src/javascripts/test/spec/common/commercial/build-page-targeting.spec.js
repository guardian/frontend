import Injector from 'helpers/injector';

describe('Build Page Targeting', function () {

    var buildPageTargeting, config, cookies, detect, userAdTargeting, ab, krux, audienceScienceGateway,
        injector = new Injector();

    beforeEach(function (done) {
        injector.test([
                'common/modules/commercial/build-page-targeting',
                'common/utils/config',
                'common/utils/cookies',
                'common/utils/detect',
                'common/modules/commercial/user-ad-targeting',
                'common/modules/experiments/ab',
                'common/modules/commercial/third-party-tags/krux',
                'common/modules/commercial/third-party-tags/audience-science-pql'],
            function () {
                buildPageTargeting = arguments[0];
                config = arguments[1];
                cookies = arguments[2];
                detect = arguments[3];
                userAdTargeting = arguments[4];
                ab = arguments[5];
                krux = arguments[6];
                audienceScienceGateway = arguments[7];

                config.page = {
                    edition:     'US',
                    contentType: 'Video',
                    isSurging:   true,
                    source: 'ITN',
                    tones: 'News',
                    authorIds: 'profile/gabrielle-chan',
                    sponsorshipType: 'advertisement-features',
                    seriesId: 'film/series/filmweekly',
                    pageId: 'football/series/footballweekly',
                    keywordIds: 'uk-news/prince-charles-letters,uk/uk,uk/prince-charles',
                    blogIds: 'a/blog',
                    videoDuration: 63
                };
                config.switches = {
                    audienceScienceGateway: true
                };

                config.ophan.pageViewId = 'presetOphanPageViewId';

                cookies.get = function () {
                    return 'ng101';
                };
                detect.getBreakpoint = function () {
                    return 'mobile';
                };
                userAdTargeting.getUserSegments = function () {
                    return ['seg1', 'seg2'];
                };
                ab.getParticipations = function () {
                    return {
                        MtMaster: {
                            variant: 'variant'
                        }
                    };
                };
                krux.getSegments = function () {
                    return ['E012712', 'E012390', 'E012478'];
                };
                audienceScienceGateway.getSegments = function () {
                    return {
                        asg1: 'value-one',
                        asg2: 'value-two'
                    };
                };
                done();
            });
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
        expect(pageTargeting.gdncrm).toEqual(['seg1', 'seg2']);
        expect(pageTargeting.co).toEqual(['gabrielle-chan']);
        expect(pageTargeting.bl).toEqual(['blog']);
        expect(pageTargeting.ms).toBe('itn');
        expect(pageTargeting.tn).toEqual(['advertisement-features', 'news']);
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
        expect(buildPageTargeting().k).toEqual(['prince-charles-letters', 'uk', 'prince-charles']);
    });

    it('should use pageId if no keywordIds', function () {
        config.page.keywordIds = null;

        expect(buildPageTargeting().k).toEqual('footballweekly');
    });

    it('should set correct ab param', function () {
        expect(buildPageTargeting().ab).toEqual(['MtMaster-v']);
    });

    it('should set correct krux params', function () {
        expect(buildPageTargeting().x).toEqual(['E012712', 'E012390', 'E012478']);
    });

    it('should set correct audience science gateway params', function () {
        var pageTargeting = buildPageTargeting();

        expect(pageTargeting.asg1).toBe('value-one');
        expect(pageTargeting.asg2).toBe('value-two');
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
        audienceScienceGateway.getSegments = function () {
            return {};
        };

        var opts = {
            window: {
                location: {
                    pathname: '/a/page.html'
                }
            }
        };

        expect(buildPageTargeting(opts)).toEqual({
            url: '/a/page.html',
            p: 'ng',
            bp: 'mobile',
            at: 'ng101',
            ab: ['MtMaster-v'],
            pv: '123456'
        });
    });
});

