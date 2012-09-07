define(['modules/detect'], function(detect) {
   
    describe("Layout", function() {
        
        it("should default to 'base' layout mode", function(){
            window.innerWidth = null;
            expect(detect.getLayoutMode()).toBe('base');
        });
    
        it("should return the correct layout mode for the device resolution", function(){
            window.innerWidth = 100; 
            expect(detect.getLayoutMode()).toBe('base');

            window.innerWidth = 500; 
            expect(detect.getLayoutMode()).toBe('median');
            
            window.innerWidth = 2000;
            expect(detect.getLayoutMode()).toBe('extended');
        });

    });

   describe("Connection speed", function() {
   
        it("should default to 'high' speed", function(){
            window.performance = null; 
            expect(detect.getConnectionSpeed()).toBe('high');
        });
        
        it("should calculate the speed of a slow, medium & fast client request", function(){
            
            window.performance = { timing: { requestStart: 1, responseStart: 8000 } };
            expect(detect.getConnectionSpeed()).toBe('low');
            
            window.performance = { timing: { requestStart: 1, responseStart: 3000 } };
            expect(detect.getConnectionSpeed()).toBe('medium');
            
            window.performance = { timing: { requestStart: 1, responseStart: 1000 } };
            expect(detect.getConnectionSpeed()).toBe('high');
        
        }); 
   });

   describe("Font support", function() {
   
        var ttfUserAgents = [
            'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_0 like Mac OS X; en-us) AppleWebKit/53',
            'Mozilla/5.0 (Linux; U; Android 2.2; en-us; Nexus One Build/FRF91) ...',
            'iOS iPhone OS 3_1_2'
        ];  
     
        var woffUserAgents = [
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
});

