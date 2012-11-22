define(['modules/adverts/audience-science'], function(AudienceScience) {
   
    describe("AudienceScience", function() {

        it("should get correct values from localStorage.", function() {

            localStorage.setItem("gu.ads.audsci", '["E012712","E012390","E012478","E012819","E013064","E013074","E013080","E013167","E013267","E013273","E013299","E013410","E013464","E013519"]');

            var segments = AudienceScience.getSegments()
            expect(segments.length).toBe(14);
        });

        xit("should update values in localStorage when loaded.", function() {

            var config = {
                'audienceScienceUrl': 'http://js.revsci.net/gateway/gw.js?csid=E05516'
            }

            localStorage.removeItem("gu.ads.audsci");
            var segments = AudienceScience.getSegments();

            expect(segments).toBe(undefined);

            AudienceScience.load(config)


            waitsFor(function() {
                return (localStorage.getItem("gu.ads.audsci") !== null);
            }, "segments never arrived in localStorage", 1000);

            runs(function() {
                segments = AudienceScience.getSegments();
                expect(segments.length > 0).toBe(true);
            })

        });

    });

});

