define([
    'helpers/injector'
], function (
    Injector
) {
    describe('Audience Science Gateway', function () {

        var injector = new Injector(),
            audienceScienceGateway, config;

        beforeEach(function (done) {
            injector.require([
                'commercial/modules/third-party-tags/audience-science-pql',
                'common/utils/config'], function () {

                    audienceScienceGateway = arguments[0];
                    config = arguments[1];

                    config.page = {
                        section: 'news'
                    };
                    config.switches = {
                        audienceScienceGateway: true
                    };

                    done();
                }
            );
        });

        it('should be able to get segments', function () {
            audienceScienceGateway.reset();
            window.asiPlacements = {
                Y1C40a: {
                    'default': {
                        key: 'sct-76-qHDJGkNzOZB198Rq0V98'
                    },
                    data: {
                        'STPG-li383': {
                            key: 'sct-76-qHDJGkNzOZB198Rq0V98'
                        }
                    },
                    blob: 'CjRjMmMyOTQ1OC0yZDhmLTRlMGMtYTY1Ni04NjcxZTJmOWRmMzctMTQwODYyODU1MjA2Ny0y'
                },
                c7Zrhu: {
                    'default': {
                        key: 'k_1zMBS3xPySFDHSOzVC3M3um3A'
                    },
                    data: {
                        'STPG-li436': {
                            key: 'k_1zMBS3xPySFDHSOzVC3M3um3A'
                        }
                    },
                    blob: 'CjQ3YmM2YjgzZC02ZTk4LTQ3MjEtYTVmZC05ZGJiYzcwZmQyOWItMTQwODYzMjE4NTI4MS0w'
                }
            };
            expect(audienceScienceGateway.getSegments()).toEqual(['pq_Y1C40a', 'pq_c7Zrhu']);
        });

        it('should return empty object if no segments', function () {
            audienceScienceGateway.reset();
            window.asiPlacements = {};
            expect(audienceScienceGateway.getSegments()).toEqual([]);
        });

        it('should return empty object if switch is off', function () {
            config.page.section = undefined;
            audienceScienceGateway.reset();
            expect(audienceScienceGateway.getSegments()).toEqual([]);
        });

    });
});
