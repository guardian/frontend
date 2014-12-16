define([
    'squire'
], function (
    Squire
) {

    new Squire()
        .store('common/utils/config')
        .require(['common/modules/commercial/tags/media-math', 'mocks'], function (mediaMath, mocks) {

            function extractParam(img, paramName) {
                var paramValue = new RegExp(paramName + '=([^&]*)').exec(img.src);
                return paramValue && paramValue[1];
            }

            describe('Media Math', function () {

                beforeEach(function () {
                    mocks.store['common/utils/config'].page = {
                        host: 'http://www.theguardian.com',
                        pageId: 'uk-news/2014/apr/24/crime-rate-england-wales-falls-lowest-level-33-years',
                        section: 'uk-news',
                        keywords: 'Crime,UK news,Police',
                        contentType: 'Article'
                    };
                    mocks.store['common/utils/config'].switches = {
                        mediaMath: true
                    };
                });

                it('should not load if "mediaMath" switch is off', function () {
                    mocks.store['common/utils/config'].switches.mediaMath = false;

                    expect(mediaMath.load()).toBeFalsy();
                });

                it('should return the image element', function () {
                    var img = mediaMath.load();

                    expect(img.nodeName.toLowerCase()).toBe('img');
                });

                it('should have the correct base for the img url', function () {
                    var img = mediaMath.load();

                    expect(img.src.indexOf('http://pixel.mathtag.com/event/img?mt_id=328671&mt_adid=114751')).toBe(0);
                });

                it('should send the correct "v1" param', function () {
                    var img = mediaMath.load();

                    expect(extractParam(img, 'v1')).toBe(
                        'http://www.theguardian.com/uk-news/2014/apr/24/crime-rate-england-wales-falls-lowest-level-33-years'
                    );
                });

                it('should send the correct "v2" param', function () {
                    var img = mediaMath.load();

                    expect(extractParam(img, 'v2')).toBe('uk-news');
                });

                it('should send the correct "v3" param', function () {
                    var img = mediaMath.load({ referrer: 'http://www.google.com?foo=bar&q=a search\\\\another one' });

                    expect(extractParam(img, 'v3')).toBe('a%20search%20another%20one');
                });

                it('should send the correct "v4" param', function () {
                    var img = mediaMath.load({referrer: 'http://www.google.com' });

                    expect(extractParam(img, 'v4')).toBe('http://www.google.com');
                });

                it('should send the correct "v5" param', function () {
                    var img = mediaMath.load();

                    expect(extractParam(img, 'v5')).toBe('Crime|UK%20news|Police');
                });

                it('should send the correct "v6" param', function () {
                    var img = mediaMath.load();

                    expect(extractParam(img, 'v6')).toBe('article');
                });

            });

        });

});
