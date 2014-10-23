define([
    'jasq'
], function () {

    function extractParam(img, paramName) {
        var paramValue = new RegExp(paramName + '=([^&]*)').exec(img.src);
        return paramValue && paramValue[1];
    }

    describe('Media Math', {
        moduleName: 'common/modules/commercial/tags/media-math',
        mock: function () {
            return {
                'common/utils/config': function () {
                    return {
                        page: {
                            host: 'http://www.theguardian.com',
                            pageId: 'uk-news/2014/apr/24/crime-rate-england-wales-falls-lowest-level-33-years',
                            section: 'uk-news',
                            keywords: 'Crime,UK news,Police',
                            contentType: 'Article'
                        },
                        switches: {
                            mediaMath: true
                        }
                    };
                }
            }
        },
        specify: function () {

            it('should not load if "mediaMath" switch is off', function (mediaMath, deps) {
                deps['common/utils/config'].switches.mediaMath = false;

                expect(mediaMath.load()).toBeFalsy();
            });

            it('should return the image element', function (mediaMath) {
                var img = mediaMath.load();

                expect(img.nodeName.toLowerCase()).toBe('img');
            });

            it('should have the correct base for the img url', function (mediaMath) {
                var img = mediaMath.load();

                expect(img.src.indexOf('http://pixel.mathtag.com/event/img?mt_id=328671&mt_adid=114751')).toBe(0);
            });

            it('should send the correct "v1" param', function (mediaMath) {
                var img = mediaMath.load();

                expect(extractParam(img, 'v1')).toBe(
                    'http://www.theguardian.com/uk-news/2014/apr/24/crime-rate-england-wales-falls-lowest-level-33-years'
                );
            });

            it('should send the correct "v2" param', function (mediaMath) {
                var img = mediaMath.load();

                expect(extractParam(img, 'v2')).toBe('uk-news');
            });

            it('should send the correct "v3" param', function (mediaMath) {
                var img = mediaMath.load({ referrer: 'http://www.google.com?foo=bar&q=a search\\\\another one' });

                expect(extractParam(img, 'v3')).toBe('a%20search%20another%20one');
            });

            it('should send the correct "v4" param', function (mediaMath) {
                var img = mediaMath.load({referrer: 'http://www.google.com' });

                expect(extractParam(img, 'v4')).toBe('http://www.google.com');
            });

            it('should send the correct "v5" param', function (mediaMath) {
                var img = mediaMath.load();

                expect(extractParam(img, 'v5')).toBe('Crime|UK%20news|Police');
            });

            it('should send the correct "v6" param', function (mediaMath) {
                var img = mediaMath.load();

                expect(extractParam(img, 'v6')).toBe('article');
            });

        }
    });

});
