define(['common', 'modules/analytics/livestats'], function(common, LiveStats) {

    describe("LiveStats", function() {
       
        var ls;
       
        beforeEach(function() {
            window.sessionStorage.clear();
            common.$g('#js-livestats').remove(); 
            ls = new LiveStats({ beaconUrl: 'beacon.gu.com' });
        });
        
        it("should log a new session as type 'session'", function(){
            ls.log();
            expect(document.getElementById('js-livestats').getAttribute('src')).toContain(
                'beacon.gu.com/px.gif?type=session&platform=responsive'
            );
        });
        
        it("should log a second page view as type 'view'", function(){
            window.sessionStorage.setItem("gu.session", true);
            ls.log();
            expect(document.getElementById('js-livestats').getAttribute('src')).toContain(
                'beacon.gu.com/px.gif?type=view&platform=responsive'
            );
        });

    });
})
