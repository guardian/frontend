define(['common/common', 'common/modules/analytics/livestats', 'common/utils/cookies'], function(common, liveStats) {

    describe("LiveStats", function() {
       
        var beacon;
        var config;
       
        beforeEach(function() {
            window.sessionStorage.clear();
            document.cookie="GU_ALPHA=true;expires=" + new Date(2054,1,1).toUTCString();
            common.$g('#js-livestats-px').remove();
            common.$g('#js-livestats-ab').remove();
            beacon = { beaconUrl: 'beacon.gu.com' };
            config = { switches: {
                            liveStats : true,
                            liveAbTestStats : false
                        }
                     }
        });
        
        it("should log a new session as type 'session'", function(){
            liveStats.log(beacon, config);
            expect(document.getElementById('js-livestats-px').getAttribute('src')).toContain(
                'beacon.gu.com/px.gif?platform=responsive&type=session'
            );
        });
        
        it("should log a second page view as type 'view'", function(){
            window.sessionStorage.setItem("gu.session", true);
            liveStats.log(beacon, config);
            expect(document.getElementById('js-livestats-px').getAttribute('src')).toContain(
                'beacon.gu.com/px.gif?platform=responsive&type=view'
            );
        });

    });
})
