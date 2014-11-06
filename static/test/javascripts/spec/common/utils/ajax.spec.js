define([
    'jasq'
], function () {

    var reqwestSpy;

    describe('AJAX', {
        moduleName: 'common/utils/ajax',
        mock: function () {
            return {
                'reqwest': function () {
                    return reqwestSpy = sinon.spy();
                },
                'common/utils/config': function () {
                    return {
                        page: {
                            ajaxUrl: 'http://api.nextgen.guardianapps.co.uk'
                        }
                    };
                }
            }
        },
        specify: function () {

            it('should be defined', function (ajax) {
                expect(ajax).toBeDefined();
            });

            it('should proxy calls to reqwest', function (ajax) {
                ajax({ url: '/endpoint.json', param: 'value' });

                expect(reqwestSpy).toHaveBeenCalledWith({
                    url:         'http://api.nextgen.guardianapps.co.uk/endpoint.json',
                    crossOrigin: true,
                    param:       'value'
                });
            });

            it('should not touch a url that is already absolute', function (ajax) {
                ajax({ url: 'http://apis.guardian.co.uk/endpoint.json' });

                expect(reqwestSpy).toHaveBeenCalledWith({ url: 'http://apis.guardian.co.uk/endpoint.json' });
            });

            it('should not touch a url that is already absolute (https)', function (ajax) {
                ajax({ url: 'https://apis.guardian.co.uk/endpoint.json' });

                expect(reqwestSpy).toHaveBeenCalledWith({ url: 'https://apis.guardian.co.uk/endpoint.json' });
            });

            it('should be able to update host', function (ajax) {
                ajax.setHost('http://apis.guardian.co.uk');
                ajax({ url: '/endpoint.json' });

                expect(reqwestSpy).toHaveBeenCalledWith({
                    url:         'http://apis.guardian.co.uk/endpoint.json',
                    crossOrigin: true
                });
            });

        }
    });

});
