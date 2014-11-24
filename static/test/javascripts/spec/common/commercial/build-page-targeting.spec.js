define([
    'jasq'
], function () {

    describe('Build Page Targeting', {
        moduleName: 'common/modules/commercial/build-page-targeting',
        mock: function () {
            return {
                'common/utils/config': function () {
                    return {
                        page: {
                            edition:     'US',
                            contentType: 'Network Front',
                            isSurging:   true,
                            source: 'ITN',
                            tones: 'News',
                            authorIds: 'profile/gabrielle-chan',
                            sponsorshipType: 'advertisement-features',
                            seriesId: 'film/series/filmweekly',
                            pageId: 'football/series/footballweekly',
                            keywordIds: 'uk-news/prince-charles-letters,uk/uk,uk/prince-charles',
                            blogIds: 'blog'
                        },
                        switches: {
                            audienceScienceGateway: true
                        }
                    };
                },
                'common/utils/cookies': function () {
                    return {
                        get: function () {
                            return 'ng101'
                        }
                    }
                },
                'common/utils/detect': function () {
                    return {
                        getBreakpoint: function () {
                            return 'mobile'
                        }
                    }
                },
                'common/modules/commercial/user-ad-targeting': function () {
                    return {
                        getUserSegments: function () {
                            return ['seg1', 'seg2']
                        }
                    }
                },
                'common/modules/experiments/ab': function () {
                    return {
                        getParticipations: function () {
                            return {
                                HighCommercialComponent: {
                                    variant: 'control'
                                }
                            }
                        }
                    }
                },
                'common/modules/commercial/tags/audience-science': function () {
                    return {
                        getSegments: function () {
                            return ['E012712', 'E012390', 'E012478'];
                        }
                    }
                },
                'common/modules/commercial/tags/audience-science-gateway': function () {
                    return {
                        getSegments: function () {
                            return {
                                asg1: 'value-one',
                                asg2: 'value-two'
                            }
                        }
                    }
                },
                'common/modules/commercial/tags/criteo': function () {
                    return {
                        getSegments: function () {
                            return {
                                c1: 'value-one',
                                c2: 'value-two'
                            }
                        }
                    }
                }
            }
        },
        specify: function () {

            it('should exist', function (buildPageTargeting) {
                expect(buildPageTargeting).toBeDefined();
            });

            it('should build correct page targeting', function (buildPageTargeting) {
                var pageTargeting = buildPageTargeting();

                expect(pageTargeting.edition).toBe('us');
                expect(pageTargeting.ct).toBe('network-front');
                expect(pageTargeting.pt).toBe('network-front');
                expect(pageTargeting.p).toBe('ng');
                expect(pageTargeting.su).toBe(true);
                expect(pageTargeting.bp).toBe('mobile');
                expect(pageTargeting.at).toBe('ng101');
                expect(pageTargeting.gdncrm).toEqual(['seg1', 'seg2']);
                expect(pageTargeting.co).toEqual(['gabrielle-chan']);
                expect(pageTargeting.bl).toEqual(['blog']);
                expect(pageTargeting.ms).toBe('itn');
                expect(pageTargeting.tn).toEqual(['advertisement-features', 'news']);
            });

            it('should set correct edition param', function (buildPageTargeting) {
                expect(buildPageTargeting().edition).toBe('us');
            });

            it('should set correct se param', function (buildPageTargeting) {
                expect(buildPageTargeting().se).toBe('filmweekly');
            });

            it('should use pageId if no seriesId', function (buildPageTargeting, deps) {
                deps['common/utils/config'].page.seriesId = null;

                expect(buildPageTargeting().se).toBe('footballweekly');
            });

            it('should set correct k param', function (buildPageTargeting) {
                expect(buildPageTargeting().k).toEqual(['prince-charles-letters', 'uk', 'prince-charles']);
            });

            it('should use pageId if no keywordIds', function (buildPageTargeting, deps) {
                deps['common/utils/config'].page.keywordIds = null;

                expect(buildPageTargeting().k).toEqual('footballweekly');
            });

            it('should set correct ab param', function (buildPageTargeting) {
                expect(buildPageTargeting().ab).toBe('1');
            });

            it('should set correct criteo params', function (buildPageTargeting) {
                var pageTargeting = buildPageTargeting();

                expect(pageTargeting.c1).toBe('value-one');
                expect(pageTargeting.c2).toBe('value-two');
            });

            it('should set correct audience science params', function (buildPageTargeting) {
                expect(buildPageTargeting().a).toEqual(['E012712', 'E012390', 'E012478']);
            });

            it('should set correct audience science gateway params', function (buildPageTargeting) {
                var pageTargeting = buildPageTargeting();

                expect(pageTargeting.asg1).toBe('value-one');
                expect(pageTargeting.asg2).toBe('value-two');
            });

            it('should remove empty values', function (buildPageTargeting, deps) {
                deps['common/utils/config'].page = {};
                deps['common/modules/commercial/user-ad-targeting'].getUserSegments = function () {
                    return [];
                };
                deps['common/modules/commercial/tags/audience-science'].getSegments = function () {
                    return [];
                };
                deps['common/modules/commercial/tags/audience-science-gateway'].getSegments = function () {
                    return {};
                };
                deps['common/modules/commercial/tags/criteo'].getSegments = function () {
                    return {};
                };

                expect(buildPageTargeting()).toEqual({
                    url: '/context.html',
                    p: 'ng',
                    bp: 'mobile',
                    at: 'ng101',
                    ab: '1'
                });
            });

        }
    });

});
