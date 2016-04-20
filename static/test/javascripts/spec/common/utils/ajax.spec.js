define([
    'helpers/injector'
], function (
    Injector
) {
    describe('AJAX', function () {

        var reqwestSpy = sinon.spy(function () {
                return {
                    then: function () {}
                };
            }),
            injector = new Injector(),
            ajax;

        beforeEach(function (done) {
            injector.mock({
                reqwest:  reqwestSpy,
                'common/utils/config': {
                    page: {
                        ajaxUrl: 'http://api.nextgen.guardianapps.co.uk'
                    }
                }
            });
            injector.require(['common/utils/ajax'], function () {
                ajax = arguments[0];
                done();
            });

        });

        it('should be defined', function () {
            expect(ajax).toBeDefined();
        });

        it('should proxy calls to reqwest', function () {
            ajax({url: '/endpoint.json', param: 'value'});

            expect(reqwestSpy).toHaveBeenCalledWith({
                url: 'http://api.nextgen.guardianapps.co.uk/endpoint.json',
                crossOrigin: true,
                param: 'value'
            });
        });

        it('should not touch a url that is already absolute', function () {
            ajax({url: 'http://apis.guardian.co.uk/endpoint.json'});

            expect(reqwestSpy).toHaveBeenCalledWith({url: 'http://apis.guardian.co.uk/endpoint.json'});
        });

        it('should not touch a url that is already absolute (https)', function () {
            ajax({url: 'https://apis.guardian.co.uk/endpoint.json'});

            expect(reqwestSpy).toHaveBeenCalledWith({url: 'https://apis.guardian.co.uk/endpoint.json'});
        });

        it('should not touch a protocol-less url', function () {
            ajax({url: '//apis.guardian.co.uk/endpoint.json'});

            expect(reqwestSpy).toHaveBeenCalledWith({url: '//apis.guardian.co.uk/endpoint.json'});
        });

        it('should be able to update host', function () {
            ajax.setHost('http://apis.guardian.co.uk');
            ajax({url: '/endpoint.json'});

            expect(reqwestSpy).toHaveBeenCalledWith({
                url: 'http://apis.guardian.co.uk/endpoint.json',
                crossOrigin: true
            });
        });

    });
});
