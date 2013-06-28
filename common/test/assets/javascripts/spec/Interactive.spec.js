define([ 'common',
         'bean',
         'modules/interactive',
         'fixtures'], function(common, bean, Interactive, fixtures) {

        describe("Interactive", function() {
            var conf = {
                    id: 'interactive',
                    fixtures: [
                                '<figure class="interactive" data-interactive="path/to/interactive">' +
                                '  <p>.</p>' +
                                '</div>'
                              ]
            };

            var config = {
                page: {
                  interactiveUrl: 'http://foo/'
                }
            };

            beforeEach(function() {
                fixtures.render(conf);
                require = jasmine.createSpy();
            });

            it("Should exist", function() {
                expect(new Interactive(document.querySelector('figure.interactive'), document, config)).toBeDefined();
            });
            
            it("Should load the interactive resource defined in the data-attribute", function() {
                new Interactive(document.querySelector('figure.interactive'), document, config).init();
                expect(require.mostRecentCall.args[0]).toBe('http://foo/path/to/interactive/boot.js');
            });

        });
    });
