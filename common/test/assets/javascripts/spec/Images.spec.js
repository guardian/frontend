define(['modules/images'], function(Images) {
    
    describe("Upgrade Images", function() {
        
        it("should swap a low resolution for a full resolution", function(){
            
            window.innerWidth = 1024; 
            window.performance = { timing: { requestStart: 1, responseStart: 10 } };
             
            var i = new Images().upgrade();
            expect(document.getElementById('upgradeImages').src).toContain('http://placekitten.com/1/1');
        });

    })

})

