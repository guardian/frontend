define([ 'common',
         'bean',
         'modules/navigation/sections',
         'fixtures'], function(common, bean, Sections, fixtures) {


        describe("Sections", function() {

            var conf = {
                    id: 'sections',
                    fixtures: [
                                '<div class="nav-panel-sections">foo</div>'
                              ]
            }

            beforeEach(function() {
                fixtures.render(conf)
            });

            it("Should be responsive", function() {

                // TODO

            });

        });
    });
