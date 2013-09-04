define([ 'common',
         'bean',
         'modules/toggles',
         'helpers/fixtures'], function(common, bean, Toggles, fixtures) {

        describe("Controls", function() {

            var delay = 405, // This is 5ms greater than the actual rateLimit delay, to allow a bit of leeway
                conf = {
                    id: 'controls',
                    fixtures: [ // NB: element ids are required by the test, not by the actual Toggles module
                        '<div id="controls-a">' +
                            '<div id="control-1" data-toggle="target-1" class="control">button</div>' +
                            '<div id="control-2" data-toggle="target-2" class="control is-active">button</div>' +
                            '<div id="target-1"  class="target-1 is-off">content</div>' +
                            '<div id="target-2"  class="target-2">content</div>' +
                        '</div>',

                        '<div id="controls-b">' +
                            '<div id="control-1b" data-toggle="target-1" class="control">button</div>' +
                            '<div id="control-2b" data-toggle="target-2" class="control is-active">button</div>' +
                            '<div id="target-1b"  class="target-1 is-off">content</div>' +
                            '<div id="target-2b"  class="target-2">content</div>' +
                        '</div>'
                    ]
            }

            beforeEach(function() {
                fixtures.render(conf)
            });

            it("Should update the state of a button when clicked (from an initial state of 'off')", function() {
                new Toggles().init(document.querySelector('#controls-a'));

                bean.fire(document.getElementById('control-1'), 'click');
                expect(document.getElementById('control-1').className).toContain('is-active')
            });

            it("Should update the state of a button when touched (from an initial state of 'off')", function() {
                new Toggles().init(document.querySelector('#controls-a'));

                bean.fire(document.getElementById('control-2'), 'touchstart');
                expect(document.getElementById('control-2').className).not.toContain('is-active')
            });

            it("Should update the state of a button when clicked (from an initial state of 'on')", function() {
                new Toggles().init(document.querySelector('#controls-a'));

                bean.fire(document.getElementById('control-1'), 'click');
                expect(document.getElementById('control-1').className).toContain('is-active')
            });

            it("Should update the state of a button when touched (from an initial state of 'on')", function() {
                new Toggles().init(document.querySelector('#controls-a'));

                bean.fire(document.getElementById('control-1'), 'touchstart');
                expect(document.getElementById('control-1').className).toContain('is-active')
            });

            it("Should toggle the state of a button and when clicked repeatedly", function() {
                new Toggles().init(document.querySelector('#controls-a'));

                bean.fire(document.getElementById('control-1'), 'click');
                expect(document.getElementById('control-1').className).toContain('is-active')

                bean.fire(document.getElementById('control-1'), 'click');
                expect(document.getElementById('control-1').className).not.toContain('is-active')

                bean.fire(document.getElementById('control-1'), 'click');
                expect(document.getElementById('control-1').className).toContain('is-active')
            });

            it("Deactives it's state when another button on the page is activated", function() {
                new Toggles().init(document.querySelector('#controls-a'));

                bean.fire(document.getElementById('control-1'), 'click');
                expect(document.getElementById('control-2').className).not.toContain('is-active');
            });

            it("Does not interfere with other control sets", function() {
                new Toggles().init(document.querySelector('#controls-a'));
                new Toggles().init(document.querySelector('#controls-b'));

                bean.fire(document.getElementById('control-1'), 'click');
                expect(document.getElementById('control-1').className).toContain('is-active')
                expect(document.getElementById('control-1b').className).not.toContain('is-active')
            });

            it("Should reveal its related content", function() {
                new Toggles().init(document.querySelector('#controls-a'));

                bean.fire(document.getElementById('control-1'), 'click');
                expect(document.getElementById('target-1').className).not.toContain('is-off');
            });

            it("Should hide any un-related content", function() {
                new Toggles().init(document.querySelector('#controls-a'));

                bean.fire(document.getElementById('control-1'), 'click');
                expect(document.getElementById('target-2').className).toContain('is-off');
            });

            it("Should toggle the state of its related content when clicked repeatedly", function() {
                new Toggles().init(document.querySelector('#controls-a'));

                bean.fire(document.getElementById('control-1'), 'click');
                expect(document.getElementById('target-1').className).not.toContain('is-off')

                bean.fire(document.getElementById('control-1'), 'click');
                expect(document.getElementById('target-1').className).toContain('is-off')

                bean.fire(document.getElementById('control-1'), 'click');
                expect(document.getElementById('target-1').className).not.toContain('is-off')
            });

        });
    });
