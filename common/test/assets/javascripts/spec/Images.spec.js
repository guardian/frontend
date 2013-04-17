define(['modules/images', 'fixtures'], function(Images, fixtures) {
    
    describe("Upgrade Images", function() {
        
        var conf = {
                    id: 'images',
                    fixtures: [
                        '<div id="upgrade"><img data-upgrade="true" data-fullsrc="http://placekitten.com/1/1" src="http://placekitten.com/2/2" data-thumb-width="5" data-full-width="100" id="upgradeImages" class="visible" /></div>',
                        '<div id="force-upgrade"><img data-upgrade="true" data-fullsrc="http://placekitten.com/3/3" src="http://placekitten.com/2/2" data-force-upgrade="1" data-thumb-width="5" data-full-width="100" id="upgradeImagesForce" class="visible" /></div>',
                        '<div id="upgrade-svg"><img data-svgsrc="http://x.y.z/b.svg" id="upgradeSvgImages" class="visible" src="http://x.y.z/c.svg"/></div>'
                    ]
                   }

        beforeEach(function() {
            document.body.className = '';
            fixtures.render(conf);
        })

        it("swap a low resolution image for a full resolution", function(){
            
            window.innerWidth = 2000; 
            window.performance = { timing: { requestStart: 1, responseEnd: 10 } };

            var i = new Images().upgrade(document.getElementById('upgrade'));
            
            var img = document.getElementById('upgradeImages');
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
            
            new Images().upgrade(document.getElementById('upgrade-svg'));
            expect(document.getElementsByTagName('body')[0].className).toContain('svg');
        });

    })
});

