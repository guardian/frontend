define(['common', 'modules/navigation'], function(common, Navigation) {

    describe("Navigation", function() {

        it("should load the sections", function(){
            var navigation = new Navigation().initalise();
            
            expect(common.$('#trail-c')[0].className).toBe('shut');
            expect(common.$('#trail-c .cta')[0].innerText).toBe('Show 3 more');
        });
       
        it("should toggle the section navigation on and off", function(){
        }

        it("should xixxd off", function(){
        }
    });

});
