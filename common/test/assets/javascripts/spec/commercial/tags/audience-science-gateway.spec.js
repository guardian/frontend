define([
    'common/utils/storage',
    'common/modules/commercial/tags/audience-science-gateway'
], function(
    storage,
    audienceScienceGateway
) {

    describe('Audience Science Gateway', function () {

        it('should be able to get segments', function () {
            var section = 'news';
            audienceScienceGateway._init({
                page: { section: section },
                switches: { audienceScienceGateway: true }
            });
            var stored = {},
                storedValue = {
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
            stored[section] = storedValue;
            storage.local.set('gu.ads.audsci-gateway', stored);
            expect(audienceScienceGateway.getSegments()).toEqual({
                pq_Y1C40a: 'T',
                pq_c7Zrhu: 'T'
            });
        });

        it('should return empty object if no segments', function () {
            audienceScienceGateway._init({
                page: { section: 'news' },
                switches: { audienceScienceGateway: true }
            });
            storage.local.set('gu.ads.audsci-gateway', {});
            expect(audienceScienceGateway.getSegments()).toEqual({});
        });

        it('should return empty object if switch is off', function () {
            audienceScienceGateway._init({
                switches: { audienceScienceGateway: false }
            });
            expect(audienceScienceGateway.getSegments()).toEqual({});
        });

    });

});
