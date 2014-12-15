define([
    'squire'
], function (
    Squire
) {

    var reqwestSpy = sinon.spy(function () {
        return {
            then: function () { }
        };
    });

    new Squire()
        .mock({
            reqwest:  reqwestSpy,
            'common/utils/config': {
                page: {
                    ajaxUrl: 'http://api.nextgen.guardianapps.co.uk'
                }
            }
        })
        .require(['common/utils/ajax'], function (ajax) {

            describe('AJAX', function () {

                it('should be defined', function () {
                    expect(ajax).toBeDefined();
                });

                it('should proxy calls to reqwest', function () {
                    console.log(reqwestSpy);
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

});
