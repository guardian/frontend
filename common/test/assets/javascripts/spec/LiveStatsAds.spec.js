define(['common', 'modules/analytics/livestats-ads', 'utils/cookies'], function(common, LiveStatsAds) {

    describe("LiveStatsAds", function() {
       
        var ls;
       
        beforeEach(function() {
            common.$g('#js-livestats-ads').remove();
            ls = new LiveStatsAds({ beaconUrl: 'beacon.gu.com' });
        });

        it("should accept a parameter and serialize it in the request", function(){
            ls.log({ foo:'bar' });
            expect(document.getElementById('js-livestats-ads').getAttribute('src')).toContain(
                'beacon.gu.com/ad.gif?foo=bar'
            );
        });


        it("should accept multiple parameters and serialize them in the request", function(){
            ls.log({ foo:'bar', lorem:'ipsum' });
            expect(document.getElementById('js-livestats-ads').getAttribute('src')).toContain(
                'beacon.gu.com/ad.gif?foo=bar&lorem=ipsum'
            );
        });



    });
})
