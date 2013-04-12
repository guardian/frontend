define([ 'common',
         'bean',
         'modules/navigation/control',
         'fixtures'], function(common, bean, Control, fixtures) {


        describe("Controls", function() {

            // Note: the fixture element ids are required by the test only, not the Control module
            var conf = {
                    id: 'controls',
                    fixtures: [
                        '<div id="control-1" data-control-for="target-1" class="control is-off"   >button</div>',
                        '<div id="control-2" data-control-for="target-2" class="control is-active">button</div>',
                        '<div id="target-1"  class="target-1 is-off"></div>',
                        '<div id="target-2"  class="target-2 is-off"></div>',
                    ]
            }

            beforeEach(function() {
                fixtures.render(conf)
            });

            it("Should update the state of a button when clicked (from an initial state of 'off')", function() {
                new Control().init(document);

                bean.fire(document.getElementById('control-1'), 'click');
                expect(document.getElementById('control-1').className).toContain('is-active')
            });

            it("Should update the state of a button when touched (from an initial state of 'off')", function() {
                new Control().init(document);

                bean.fire(document.getElementById('control-1'), 'touchstart');
                expect(document.getElementById('control-1').className).toContain('is-active')
            });

            it("Should update the state of a button when clicked (from an initial state of 'on')", function() {
                new Control().init(document);
                bean.fire(document.getElementById('control-2'), 'click');

                expect(document.getElementById('control-2').className).not.toContain('is-active')
            });

            it("Should update the state of a button when touched (from an initial state of 'on')", function() {
                new Control().init(document);
                bean.fire(document.getElementById('control-2'), 'touchstart');

                expect(document.getElementById('control-2').className).not.toContain('is-active')
            });

            it("Adds a delay to events to avoid double-click events from firing", function() { // An Android

                spyOn(common.mediator, 'emit');

                var clock = sinon.useFakeTimers(123456789, "Date") // set date to some arbitrary epoch time

                new Control().init(document);

                // fire 3 events within 400ms
                bean.fire(document.getElementById('control-1'), 'click');
                clock.tick(200);
                bean.fire(document.getElementById('control-1'), 'click');
                clock.tick(200);
                bean.fire(document.getElementById('control-1'), 'click');

                // TODO - replace with sinon withArgs matcher
                var buttonEvents = common.mediator.emit.calls.filter(function(i) {
                     return i.args[0].indexOf('modules:control:change') >= 0;
                })

                expect(buttonEvents.length).toEqual(2);

            });

            it("Deactives it's state when another button on the page is activated", function() { // An Android

                new Control().init(document);

                // control-1 'click' should deactive control-2 active states
                bean.fire(document.getElementById('control-1'), 'click');

                expect(document.getElementById('control-2').className).not.toContain('is-active');
            });

            it("Should reveal the navigation control when the content has loaded", function() { // An Android

                new Control().init(document);

                // control-1 'click' should remove is-off class from target-1
                bean.fire(document.getElementById('control-1'), 'click');

                expect(document.getElementById('target-1').className).not.toContain('is-off');
            });

        });
    });
