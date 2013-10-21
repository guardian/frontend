define(['modules/detect', 'bonzo'], function(detect, bonzo) {

    var windowWidth = window.innerWidth,
        windowHeight = window.innerHeight;

    describe("Layout", function() {

        it("should default to 'mobile' layout mode", function(){
            expect(detect.getLayoutMode(null)).toBe('mobile');
        });

        it("should return the correct layout mode for the device resolution", function(){

            expect(detect.getLayoutMode(100)).toBe('mobile');

            expect(detect.getLayoutMode(732)).toBe('tablet');

            expect(detect.getLayoutMode(2000)).toBe('extended');
        });

        it("should return a function to test layout dimension changes", function(){
            var hasCrossedTheMagicLines = detect.hasCrossedBreakpoint();

            expect(typeof hasCrossedTheMagicLines).toBe('function');
        });

    });

    describe("Connection speed", function() {

        it("should default to 'high' speed", function(){
            window.performance = null;
            expect(detect.getConnectionSpeed()).toBe('high');
        });

        it("should calculate the speed of a slow, medium & fast client request", function(){

            expect(detect.getConnectionSpeed({ timing: { requestStart: 1, responseEnd: 8000 } })).toBe('low');

            expect(detect.getConnectionSpeed({ timing: { requestStart: 1, responseEnd: 3000 } })).toBe('medium');

            expect(detect.getConnectionSpeed({ timing: { requestStart: 1, responseEnd: 750 } })).toBe('high');

        });

        it("should return low if CELL connection can be determined", function() {

            expect(detect.getConnectionSpeed(null, { type: 3} )).toBe('low'); // type 3 is CELL_2G

            expect(detect.getConnectionSpeed(null, { type: 4} )).toBe('low'); // type 4 is CELL_3G

            expect(detect.getConnectionSpeed({ timing: { requestStart: 1, responseEnd: 750 } }, { type: 4} )).toBe('low');

            expect(detect.getConnectionSpeed({ timing: { requestStart: 1, responseEnd: 8000 } }, { type: 6} )).toBe('low');

            expect(detect.getConnectionSpeed({ timing: { requestStart: 1, responseEnd: 750 } }, { type: 6} )).toBe('high');

        });

        it("should return high or unknown if the speed can't be determined", function() {

            expect(detect.getConnectionSpeed(null, null)).toBe('high');

            expect(detect.getConnectionSpeed(null, null, true)).toBe('unknown');

        });
    });

    describe("Font support", function() {

        var ttfUserAgents = [
            'Mozilla/5.0 (Linux; U; Android 2.2; en-us; Nexus One Build/FRF91) ...'
        ];

        var woffUserAgents = [
            'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_0 like Mac OS X; en-us) AppleWebKit/53',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 5_0 like Mac OS X) AppleWebKit/ ...'
        ];

        it("should default to WOFF format", function(){
            var ua = "an unknown user agent string";
            expect(detect.getFontFormatSupport(ua)).toBe('woff');
        });

        it("should detect WOFF and TTF support based on the user agent string", function(){

            ttfUserAgents.forEach(function(ua){
                expect(detect.getFontFormatSupport(ua)).toBe('ttf');
            })

            woffUserAgents.forEach(function(ua){
                expect(detect.getFontFormatSupport(ua)).toBe('woff');
            })

        });
    });

    describe("SVG support", function() {

        it("should determine SVG support", function() {
            expect(detect.hasSvgSupport()).toBe(true);
        });

    });

    describe("CSS support", function() {

        it("should determine CSS support for any property", function() {
            expect(detect.hasCSSSupport('position', 'relative', true)).toBe(true);
            expect(detect.hasCSSSupport('position', 'sixtynine')).toBe(false);
        });

    });

    describe("Breakpoint", function() {

        var breakpointName = 'a-breakpoint',
            style;

        beforeEach(function () {
            // add css to page
            style = bonzo(bonzo.create('<style type="text/css"></style>'))
                .html('body:after{ content: "' + breakpointName + '"}')
                .appendTo('head');
        });

        afterEach(function() {
            style.remove();

        });

        it("should be able to get current breakpoint", function() {
            expect(detect.getBreakpoint()).toBe(breakpointName);
        });

    });

});

