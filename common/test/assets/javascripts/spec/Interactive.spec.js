define([ 'common',
         'bean',
         'modules/interactive/loader',
         'helpers/fixtures'], function(common, bean, Interactive, fixtures) {

        describe("Interactive", function() {
            
            var i, conf = {
                    id: 'interactive',
                    fixtures: [
                                '<figure class="interactive" data-interactive="path/to/interactive">' +
                                '  <caption>Description of the interactive</caption>' +
                                '</figure>'
                              ]
            };

            var config = {
                page: {
                  interactiveUrl: 'http://foo/'
                }
            };

            beforeEach(function() {
                fixtures.render(conf);
                i = new Interactive(document.querySelector('figure.interactive'), document, config);
            });

            it("Should exist", function() {
                expect(i).toBeDefined();
            });
            
            it("Should load the interactive resource defined in the data-attribute", function() {
                require = jasmine.createSpy();
                i.init();
                expect(require.mostRecentCall.args[0]).toBe('http://foo/path/to/interactive/boot.js');
            });

        });
    });
