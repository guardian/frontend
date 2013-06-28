define([ 'common',
         'bean',
         'modules/interactive',
         'fixtures'], function(common, bean, Interactive, fixtures) {

        describe("Interactive", function() {
            var conf = {
                    id: 'interactive',
                    fixtures: [
                                '<figure id="abcde" class="interactive">' +
                                '  <p>foo</p>' +
                                '</div>'
                              ]
            };

            var config = {
                page: {
                  interactiveUrl: 'foo',
                  pageId: 'bar'
                }
            };

            beforeEach(function() {
                fixtures.render(conf);
            });

            it("Should exist", function() {
                expect(new Interactive(document.querySelector('figure.interactive'), document, config)).toBeDefined();
            });

        });
    });
