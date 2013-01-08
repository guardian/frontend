define([ 'common',
         'bean',
         'modules/navigation/controls',
         'fixtures'], function(common, bean, Control, fixtures) {


        describe("Controls", function() {

            var conf = {
                    id: 'controls',
                    fixtures: ['<div class="is-off" id="button-1">button</div>',
                               '<div class="is-active" id="button-2">button</div>',
                               '<div class="is-active" id="button-3">button</div>',
                              ]
            }

            beforeEach(function() {
                fixtures.render(conf)
            });

            it("Should update the state of a button when clicked (from an initial state of 'off')", function() {

                spyOn(common.mediator, 'emit');

                new Control({id: 'button-1'}).init();
                bean.fire(document.getElementById('button-1'), 'touchstart');

                expect(common.mediator.emit.mostRecentCall.args[0]).toBe('modules:control:change:button-1:true');
                expect(document.getElementById('button-1').className).toContain('is-active')
            });

            it("Should update the state of a button when clicked (from an state of 'on')", function() {

                spyOn(common.mediator, 'emit');

                new Control({id: 'button-2'}).init();
                bean.fire(document.getElementById('button-2'), 'touchstart');

                expect(common.mediator.emit.mostRecentCall.args[0]).toBe('modules:control:change:button-2:false');
                expect(document.getElementById('button-2').className).not.toContain('is-active')

                var buttonEvents = common.mediator.emit.calls.filter(function(i) {
                    return i.args[0].indexOf('modules:control:change:button-2') >= 0;
                })

                expect(buttonEvents.length).toEqual(1);

            });

            it("Adds a delay to events to avoid double-click events from firing", function() { // An Android

                spyOn(common.mediator, 'emit');

                var clock = sinon.useFakeTimers(123456789, "Date") // set date to some arbitrary epoch time

                new Control({id: 'button-1', delay: 400}).init();

                // fire 3 events within 400ms
                bean.fire(document.getElementById('button-1'), 'click');
                clock.tick(200);
                bean.fire(document.getElementById('button-1'), 'click');
                clock.tick(200);
                bean.fire(document.getElementById('button-1'), 'click');

                // TODO - replace with sinon withArgs matcher
                var buttonEvents = common.mediator.emit.calls.filter(function(i) {
                     return i.args[0].indexOf('modules:control:change:button-1') >= 0;
                })

                expect(buttonEvents.length).toEqual(2);

            });

            it("Deactives it's state when another button on the page is activated", function() { // An Android

                spyOn(common.mediator, 'emit').andCallThrough();

                new Control({id: 'button-1', delay: 0}).init();
                new Control({id: 'button-2', delay: 0}).init();
                new Control({id: 'button-3', delay: 0}).init();

                // button-2 'click' should deactive button-1 & button-3 active states
                bean.fire(document.getElementById('button-1'), 'click');
                bean.fire(document.getElementById('button-2'), 'click');

                expect(document.getElementById('button-1').className).not.toContain('is-active');
                expect(document.getElementById('button-2').className).toContain('is-active');
                expect(document.getElementById('button-3').className).not.toContain('is-active');
            });

            it("Should reveal the navigation control when the content has loaded", function() { // An Android

                var c = new Control({id: 'button-1', delay: 0})
                c.init();

                common.mediator.on('foo', function() {
                    c.show();
                });

                common.mediator.emit('foo');
                expect(document.getElementById('button-1').className).not.toContain('is-off');

            });

        });
    });
