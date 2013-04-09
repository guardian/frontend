define(['common', 'bean', 'modules/trailblocktoggle'], function(common, bean, TrailblockToggle) {

    describe("Trailblock Toggle", function() {

        var tt,
            edition,
            trigger = document.getElementById('js-trigger-sport');

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
            // remove listener
            bean.off(trigger, 'click');
            tt = null;
            edition = null;
        });


        it("should correctly render the default open state", function(){
            expect(common.$g('.js-toggle-trailblock').text()).toBe('Hide');
            expect(common.$g('.js-front-trailblock').hasClass('rolled-out')).toBe(true);
        });

        it("should expand and contract a panel", function() {
            /// shut
            bean.fire(trigger, 'click');
            expect(common.$g('.js-front-trailblock').hasClass('rolled-up')).toBe(true);


            // open
            bean.fire(trigger, 'click');
            expect(common.$g('.js-front-trailblock').hasClass('rolled-out')).toBe(true);

        });

    });
});