define(['modules/images'], function(Images) {
    
    describe("Upgrade Images", function() {
       
        beforeEach(function() {
            document.body.className = '';
        })

        it("swap a low resolution image for a full resolution", function(){
            
            window.innerWidth = 2000; 
            window.performance = { timing: { requestStart: 1, responseStart: 10 } };
             
            var i = new Images().upgrade(document.getElementById('upgrade'));
            
            var img = document.getElementById('upgradeImages')
            expect(img.src).toContain('http://placekitten.com/1/1');
            expect(img.className).toContain('image-high');
            
        });
        
        it("force upgrade on small layouts when data-force-upgrade attribute is present", function() {
            
            window.innerWidth = 100; // small viewport
            window.performance = { timing: { requestStart: 1, responseStart: 10 } };
            
            var i = new Images().upgrade(document.getElementById('force-upgrade'));
            expect(document.getElementById('upgradeImagesForce').src).toContain('http://placekitten.com/3/3');
        })
        
        it("swap a low resolution image for an SVG", function(){

            window.innerWidth = 1024;
            window.performance = { timing: { requestStart: 1, responseStart: 10 } };
            
            new Images().upgrade();
            expect(document.getElementsByTagName('body')[0].className).toContain('svg');
        });

    })
});

