define([
    'common/modules/analytics/commercial/tags/common/media-math'
], function(
    mediaMath
){

    function createConfig(switchValue, page) {
        return {
            switches: {
                mediaMath: switchValue
            },
            page: page
        };
    };
    function extractParam(img, paramName) {
        var paramValue = new RegExp(paramName + '=([^&]*)').exec(img.src);
        return paramValue && paramValue[1];
    }

    describe('Media Math', function() {

        it('should not load if "mediaMath" switch is off', function() {
            expect(mediaMath.load(createConfig(false))).toBeFalsy();
        });

        it('should return the image element', function() {
            var img = mediaMath.load(createConfig(true));
            expect(img.nodeName.toLowerCase()).toBe('img');
        });

        it('should have the correct base for the img url', function() {
            var img = mediaMath.load(createConfig(true));
            expect(img.src.indexOf('http://pixel.mathtag.com/event/img?mt_id=328671&mt_adid=114751')).toBe(0);
        });

        it('should send the correct "v1" param', function() {
            var host = 'http://www.theguardian.com',
                pageId = 'uk-news/2014/apr/24/crime-rate-england-wales-falls-lowest-level-33-years',
                img = mediaMath.load(createConfig(true, { host: 'http://www.theguardian.com', pageId: pageId }));
            expect(extractParam(img, 'v1')).toBe(host + '/' + pageId);
        });

        it('should send the correct "v2" param', function() {
            var section = 'uk-news',
                img = mediaMath.load(createConfig(true, { section: section }));
            expect(extractParam(img, 'v2')).toBe(section);
        });

        it('should send the correct "v3" param', function() {
            var img = mediaMath.load(createConfig(true), { documentReferrer: "http://www.google.com?foo=bar&q=a search\\\\another one" });
            expect(extractParam(img, 'v3')).toBe('a%20search%20another%20one');
        });

        it('should send the correct "v4" param', function() {
            var referrer = 'http://www.google.com',
                img = mediaMath.load(createConfig(true), { documentReferrer: referrer });
            expect(extractParam(img, 'v4')).toBe(referrer);
        });

        it('should send the correct "v5" param', function() {
            var img = mediaMath.load(createConfig(true, { keywords: 'Crime,UK news,Police'}));
            expect(extractParam(img, 'v5')).toBe('Crime|UK%20news|Police');
        });

        it('should send the correct "v6" param', function() {
            var img = mediaMath.load(createConfig(true, { contentType: 'Article'}));
            expect(extractParam(img, 'v6')).toBe('article');
        });

    });

});
