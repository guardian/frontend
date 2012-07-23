define(['modules/upgradeImages'], function(images) {
    
    describe("Upgrade Images", function() {
        
        it("should swap a low resolution for a full resolution", function(){
            window.innerWidth = 1024; 
            window.performance = { timing: { requestStart: 1, responseStart: 10 } };
            images.upgrade();
            expect(document.getElementById('upgradeImages').src).toContain('full-resolution.jpg');
        });

    })

})

