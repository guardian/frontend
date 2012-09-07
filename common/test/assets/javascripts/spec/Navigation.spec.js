define(['common', 'modules/navigation/controls'], function(common, NavigationControls) {

    describe("Navigation", function() {

        it("should detect keyframe animation support", function() {
            
            var controls = new NavigationControls();
            controls.initialise();
            expect(common.$g('body').hasClass('webkit-keyframes')).toBeTruthy();

        });

        it("re-position the navigation from the foot of the page to the dynamic section panel", function(){
            
            var controls = new NavigationControls();
            controls.initialise();
            expect(common.$g('#offcanvas-sections #sections').length).toBe(1);
        
        });

    });

});
