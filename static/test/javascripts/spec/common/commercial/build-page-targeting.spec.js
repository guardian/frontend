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
                            authorIds: 'profile/gabrielle-chan'
                        },
                        switches: {
                            audienceScienceGateway: true
                        }
                    };
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
                'common/modules/commercial/tags/criteo': function () {
                    return {
                        getSegments: function () {
                            return {
                                c1: 'value-one',
                                c2: 'value-two'
                            }
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
                expect(pageTargeting.co).toEqual(['gabrielle-chan']);
                expect(pageTargeting.ms).toBe('itn');
                expect(pageTargeting.tn).toEqual(['news']);
            });

            it('should set correct ab param', function (buildPageTargeting) {
                var pageTargeting = buildPageTargeting();

                expect(pageTargeting.ab).toBe('1');
            });

            it('should set correct criteo params', function (buildPageTargeting) {
                var pageTargeting = buildPageTargeting();

                expect(pageTargeting.c1).toBe('value-one');
                expect(pageTargeting.c2).toBe('value-two');
            });

            it('should set correct audience science gateway params', function (buildPageTargeting) {
                var pageTargeting = buildPageTargeting();

                expect(pageTargeting.asg1).toBe('value-one');
                expect(pageTargeting.asg2).toBe('value-two');
            });

        }
    });

});
