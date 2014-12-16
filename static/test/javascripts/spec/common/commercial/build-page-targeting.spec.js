define([
    'squire'
], function (
    Squire
) {

    new Squire()
        .store([
            'common/utils/config',
            'common/utils/cookies',
            'common/utils/detect',
            'common/modules/commercial/user-ad-targeting',
            'common/modules/experiments/ab',
            'common/modules/commercial/tags/audience-science',
            'common/modules/commercial/tags/audience-science-gateway',
            'common/modules/commercial/tags/criteo'
        ])
        .require(['common/modules/commercial/build-page-targeting', 'mocks'], function (buildPageTargeting, mocks) {

            describe('Build Page Targeting', function () {

                beforeEach(function () {

                    mocks.store['common/utils/config'].page = {
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
                        blogIds: 'blog',
                        videoDuration: 63
                    };
                    mocks.store['common/utils/config'].switches = {
                        audienceScienceGateway: true
                    };
                    mocks.store['common/utils/cookies'].get = function () {
                        return 'ng101'
                    };
                    mocks.store['common/utils/detect'].getBreakpoint = function () {
                        return 'mobile'
                    };
                    mocks.store['common/modules/commercial/user-ad-targeting'].getUserSegments = function () {
                        return ['seg1', 'seg2']
                    };
                    mocks.store['common/modules/experiments/ab'].getParticipations = function () {
                        return {
                            HighCommercialComponent: {
                                variant: 'control'
                            }
                        }
                    };
                    mocks.store['common/modules/commercial/tags/audience-science'].getSegments = function () {
                        return ['E012712', 'E012390', 'E012478'];
                    };
                    mocks.store['common/modules/commercial/tags/audience-science-gateway'].getSegments = function () {
                        return {
                            asg1: 'value-one',
                            asg2: 'value-two'
                        }
                    };
                    mocks.store['common/modules/commercial/tags/criteo'].getSegments = function () {
                        return {
                            c1: 'value-one',
                            c2: 'value-two'
                        }
                    };
                })

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
                });

                it('should set correct edition param', function () {
                    expect(buildPageTargeting().edition).toBe('us');
                });

                it('should set correct se param', function () {
                    expect(buildPageTargeting().se).toBe('filmweekly');
                });

                it('should use pageId if no seriesId', function () {
                    mocks.store['common/utils/config'].page.seriesId = null;

                    expect(buildPageTargeting().se).toBe('footballweekly');
                });

                it('should set correct k param', function () {
                    expect(buildPageTargeting().k).toEqual(['prince-charles-letters', 'uk', 'prince-charles']);
                });

                it('should use pageId if no keywordIds', function () {
                    mocks.store['common/utils/config'].page.keywordIds = null;

                    expect(buildPageTargeting().k).toEqual('footballweekly');
                });

                it('should set correct ab param', function () {
                    expect(buildPageTargeting().ab).toBe('1');
                });

                it('should set correct criteo params', function () {
                    var pageTargeting = buildPageTargeting();

                    expect(pageTargeting.c1).toBe('value-one');
                    expect(pageTargeting.c2).toBe('value-two');
                });

                it('should set correct audience science params', function () {
                    expect(buildPageTargeting().a).toEqual(['E012712', 'E012390', 'E012478']);
                });

                it('should set correct audience science gateway params', function () {
                    var pageTargeting = buildPageTargeting();

                    expect(pageTargeting.asg1).toBe('value-one');
                    expect(pageTargeting.asg2).toBe('value-two');
                });

                it('should remove empty values', function () {
                    mocks.store['common/utils/config'].page = {};
                    mocks.store['common/modules/commercial/user-ad-targeting'].getUserSegments = function () {
                        return [];
                    };
                    mocks.store['common/modules/commercial/tags/audience-science'].getSegments = function () {
                        return [];
                    };
                    mocks.store['common/modules/commercial/tags/audience-science-gateway'].getSegments = function () {
                        return {};
                    };
                    mocks.store['common/modules/commercial/tags/criteo'].getSegments = function () {
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
                        ab: '1'
                    });
                });

            });

        });

});
