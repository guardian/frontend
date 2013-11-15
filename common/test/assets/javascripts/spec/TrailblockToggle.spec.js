define(['common', 'ajax', 'bean', 'modules/trailblocktoggle'], function(common, ajax, bean, TrailblockToggle) {

    describe("Trailblock Toggle", function() {

        var tt,
            trigger;

        //Have to stub the global guardian object
        window.guardian = {
            userPrefs : {
                set : function() { return true; },
                get : function() { return false; }
            }
        };

        var fixtureTrailblock = '' +
            '<div id="trailblocltoggle-test">' +
                '<a class="js-toggle-trailblock js-trigger-sport" href="javascript://" data-zone-name="uk" data-block-name="sport">Hide</a>' +
                '<div class="trailblock js-front-trailblock shut front-trailblock-sport" data-count="5" data-link-name="front block News">' +
                  '<ul class="unstyled">' +
                    '<li></li>' +
                  '</ul>' +
                '</div>' +
            '</div>';

        ajax.init({page: {
            ajaxUrl: "",
            edition: "UK"
        }});

        beforeEach(function() {
            common.$g('body').append(fixtureTrailblock);
            trigger = document.querySelector('.js-trigger-sport');
            tt = new TrailblockToggle().go({page: { edition: 'uk'}}, document);
        });

        afterEach(function() {
            common.$g('#trailblocltoggle-test').remove();
            // remove listener
            bean.off(trigger, 'click');
            tt = null;
        });

        it("should correctly render the default open state", function(){
            expect(common.$g('.js-trigger-sport').text()).toBe('Hide');
            expect(common.$g('.js-front-trailblock').hasClass('rolled-up')).toBe(false);
        });

        it("should expand and contract a panel", function() {
            /// shut
            bean.fire(trigger, 'click');
            expect(common.$g('.js-front-trailblock').hasClass('rolled-up')).toBe(true);

            // open
            bean.fire(trigger, 'click');
            expect(common.$g('.js-front-trailblock').hasClass('rolled-up')).toBe(false);
        });

    });
});
