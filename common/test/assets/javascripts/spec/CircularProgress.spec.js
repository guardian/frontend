define([ 'common',
         'bean',
         'modules/circular-progress',
         'helpers/fixtures'
       ], function(common, bean, CircularProgress, fixtures) {


        describe("Circular progress bar", function() {

            var wrapperEl,
                cp,
                conf = {
                  id: 'circular-progress',
                  fixtures: [
                      '<div class="wrapper" style="width:40px;height:40px;">Waypoint 1</div>'
                  ]
            };

            beforeEach(function() {
                fixtures.render(conf);
                wrapperEl = document.querySelector('#circular-progress .wrapper');

                cp = new CircularProgress({
                    el: wrapperEl
                });
            });

            it("should build an SVG element on init", function() {
                expect(wrapperEl.querySelector('svg')).not.toBeNull();
                expect(wrapperEl.querySelectorAll('path, circle').length).toBe(3);
            });

            it("should build show correct progress at a given percentage", function() {
                cp.render("progress at 35%", 35);
                expect(wrapperEl.querySelector('path').getAttribute('d')).toBe('M 0 0 v -18.5 A 18.5 18.5 1 0 1 14.967478624530886 10.873112876458656');
            });

            it("should output the specified text when rendered", function() {
                cp.render("testing text output", 35);
                expect(wrapperEl.querySelector('.circular-progress__counter').innerHTML).toBe('testing text output');
            });

            it("should accept custom colours", function() {
                var cp = new CircularProgress({
                    el: wrapperEl,
                    activeColour: '#CC0000',
                    baseColour:   '#00CC00'
                });

                cp.render("", 20);
                expect(wrapperEl.querySelector('circle').getAttribute('stroke')).toBe('#00CC00');
                expect(wrapperEl.querySelector('path').getAttribute('stroke')).toBe('#CC0000');
            });

            it("should not have any path drawing when percentage is at 0", function() {
                cp.render("", 0);
                expect(wrapperEl.querySelector('path').getAttribute('d')).toBe('M 0 0');
            });

            it("should add --is-on classname when enable() is called", function() {
                cp.enable();
                expect(wrapperEl.querySelector('.circular-progress').className).toContain('circular-progress--is-on');
                expect(wrapperEl.querySelector('.circular-progress').className).not.toContain('circular-progress--is-off');
            });

            it("should reset all to 0 and add --is-off classname when disable() is called", function() {
                cp.render("progress at 35%", 35);
                cp.disable();

                expect(wrapperEl.querySelector('.circular-progress').className).toContain('circular-progress--is-off');
                expect(wrapperEl.querySelector('.circular-progress').className).not.toContain('circular-progress--is-on');
                expect(wrapperEl.querySelector('.circular-progress__counter').innerHTML).toBe('');
                expect(wrapperEl.querySelector('path').getAttribute('d')).toBe('M 0 0');
            });


        });
    });
