define(['common', 'modules/swipenav', 'fixtures'], function(common, Swipe, fixtures) {

    describe("Swipe", function() {
            
        var conf = { 
                id: 'swipe',
                fixtures: [
                            '<div id="swipe-container"></div>'
                          ]
                }

        beforeEach(function() {
            fixtures.render(conf)
        });
        
        it("should be defined", function () {
            // expect(new Swipe()).toBeDefined() // FIXME
        })
    
    })

})
