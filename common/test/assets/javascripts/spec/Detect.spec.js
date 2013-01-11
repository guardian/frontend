define(['modules/detect'], function(detect) {
   
    describe("Layout", function() {
        
        it("should default to 'base' layout mode", function(){
            expect(detect.getLayoutMode(null)).toBe('base');
        });
    
        it("should return the correct layout mode for the device resolution", function(){
            expect(detect.getLayoutMode(100)).toBe('base');

            expect(detect.getLayoutMode(500)).toBe('median');
            
            expect(detect.getLayoutMode(2000)).toBe('extended');
        });

    });

   describe("Connection speed", function() {
   
        it("should default to 'high' speed", function(){
            window.performance = null; 
            expect(detect.getConnectionSpeed()).toBe('high');
        });
        
        it("should calculate the speed of a slow, medium & fast client request", function(){

            expect(detect.getConnectionSpeed({ timing: { requestStart: 1, responseStart: 8000 } })).toBe('low');
            
            expect(detect.getConnectionSpeed({ timing: { requestStart: 1, responseStart: 3000 } })).toBe('medium');
            
            expect(detect.getConnectionSpeed({ timing: { requestStart: 1, responseStart: 1000 } })).toBe('high');
        
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

});

