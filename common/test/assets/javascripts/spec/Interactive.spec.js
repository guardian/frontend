define([ 'common/common',
         'bean',
         'common/modules/interactive/loader',
         'helpers/fixtures'], function(common, bean, Interactive, fixtures) {

        describe("Interactive", function() {
            
            var conf = {
                    id: 'interactive',
                    fixtures: [
                                '<figure class="interactive" data-interactive="http://interactive.guim.co.uk/embed/path/to/interactive/boot.js">' +
                                '  <caption>Description of the interactive</caption>' +
                                '</figure>'
                              ]
            };

            var config = {};

            beforeEach(function() {
                fixtures.render(conf);
            });

            var i;

            beforeEach(function() {
                i = new Interactive(document.querySelector('figure.interactive'), document, config);
            });

            it("Should exist", function() {
                expect(i).toBeDefined();
            });

            it("Should load the interactive resource defined in the data-attribute", function() {
                require = jasmine.createSpy();
                i.init();
                expect(require.mostRecentCall.args[0]).toBe('http://interactive.guim.co.uk/embed/path/to/interactive/boot.js');
            });

        });
    });
