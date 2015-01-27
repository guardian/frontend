define([
    'common/modules/commercial/third-party-tags/audience-science'
], function(
    AudienceScience
) {

    describe('AudienceScience', function() {

        it('should get correct values from localStorage.', function() {

            localStorage.setItem('gu.ads.audsci', JSON.stringify({
                value: ['E012712','E012390','E012478','E012819','E013064','E013074','E013080','E013167','E013267','E013273','E013299','E013410','E013464','E013519']
            }));

            var segments = AudienceScience.getSegments();
            expect(segments.length).toBe(14);
        });

    });

});

