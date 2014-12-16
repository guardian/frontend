define([
    'squire'
], function (
    Squire
) {

    new Squire()
        .store(['common/utils/config', 'common/utils/storage'])
        .require(['common/modules/commercial/tags/audience-science-gateway', 'mocks'], function (audienceScienceGateway, mocks) {

            var getParaWithSpaceStub, $fixturesContainer;

            describe('Audience Science Gateway', function () {

                beforeEach(function () {
                    mocks.store['common/utils/config'].page = {
                        section: 'news'
                    };
                    mocks.store['common/utils/config'].switches = {
                        audienceScienceGateway: true
                    };
                });

                it('should be able to get segments', function () {
                    audienceScienceGateway.init();
                    var stored      = {},
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
                    stored['news'] = storedValue;
                    mocks.store['common/utils/storage'].local.set('gu.ads.audsci-gateway', stored);
                    expect(audienceScienceGateway.getSegments()).toEqual({
                        pq_Y1C40a: 'T',
                        pq_c7Zrhu: 'T'
                    });
                });

                it('should return empty object if no segments', function () {
                    audienceScienceGateway.init();
                    mocks.store['common/utils/storage'].local.set('gu.ads.audsci-gateway', {});
                    expect(audienceScienceGateway.getSegments()).toEqual({});
                });

                it('should return empty object if switch is off', function () {
                    mocks.store['common/utils/config'].page.section = undefined;
                    audienceScienceGateway.init();
                    expect(audienceScienceGateway.getSegments()).toEqual({});
                });

            });

        });

});
