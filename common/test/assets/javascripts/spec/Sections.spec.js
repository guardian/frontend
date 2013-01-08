define([ 'common',
         'bean',
         'modules/navigation/sections',
         'fixtures'], function(common, bean, Sections, fixtures) {


        describe("Sections", function() {

            var conf = {
                    id: 'sections',
                    fixtures: [
                                '<div id="sections-header">foo</div>'
                              ]
            }

            beforeEach(function() {
                fixtures.render(conf)
            });

            it("Should open and close in response to external control events", function() {

                new Sections().init();

                common.mediator.emit('modules:control:change:sections-control-header:true');
                expect(document.getElementById('sections-header').className).not.toContain('is-off');

                common.mediator.emit('modules:control:change', ['sections-control-header', false]);
                expect(document.getElementById('sections-header').className).toContain('is-off')

                // ignores instructions to open other panels
                common.mediator.emit('modules:control:change', ['some-other-control', true]);
                expect(document.getElementById('sections-header').className).toContain('is-off')

            });

        });
    });
