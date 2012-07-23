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
        
        it("should calculate the speed of a slow client request", function(){
            window.performance = { timing: { requestStart: 1, responseStart: 8000 } };
            expect(detect.getConnectionSpeed()).toBe('low');
        }); 
        
        it("should calculate the speed of a medium client request", function(){
            window.performance = { timing: { requestStart: 1, responseStart: 3000 } };
            expect(detect.getConnectionSpeed()).toBe('medium');
        }); 

        it("should calculate the speed of a fast client request", function(){
            window.performance = { timing: { requestStart: 1, responseStart: 1000 } };
            expect(detect.getConnectionSpeed()).toBe('high');
        }); 

   })


})
