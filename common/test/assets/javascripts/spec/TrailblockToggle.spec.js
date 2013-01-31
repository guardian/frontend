define(['common', 'bean', 'modules/trailblocktoggle'], function(common, bean, TrailblockToggle) {

    describe("Trailblock Toggle", function() {

        var tt,
            edition;

        //Have to stub the global guardian object
        window.guardian = {
            userPrefs : {
                set : function() { return true; },
                get : function() { return false; }
            }
        };

        beforeEach(function() {
            tt = new TrailblockToggle();
            edition = 'uk';

            tt.go(edition);
        });

        afterEach(function() {
            common.mediator.removeEvent('modules:trailblockToggle:toggle');
            tt = null;
            edition = null;
        });


        it("should correctly render the default open state", function(){
            expect(common.$g('.js-toggle-trailblock').text()).toBe('Hide');
            expect(common.$g('.js-front-trailblock').hasClass('rolled-out')).toBe(true);
        });

        it("should expand and contract a panel", function() {
    
            trigger = document.getElementById('js-trigger-sport');

            /// shut
            common.mediator.emit('modules:trailblockToggle:toggle', trigger);
            expect(common.$g('.js-front-trailblock').hasClass('rolled-up')).toBe(true);
            
           
            // open 
            common.mediator.emit('modules:trailblockToggle:toggle', trigger);
            expect(common.$g('.js-front-trailblock').hasClass('rolled-out')).toBe(true);
        
        });
       
    });
});