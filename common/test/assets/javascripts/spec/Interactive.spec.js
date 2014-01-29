define([ 'common/common',
         'bean',
         'common/modules/interactive/loader',
         'helpers/fixtures'], function(common, bean, Interactive, fixtures) {

        describe("Interactive", function() {
            
            var conf = {
                    id: 'interactive',
                    fixtures: [
                                // Legacy using relative URL
                                '<figure class="interactive legacy" data-interactive="path/to/interactive">' +
                                '  <caption>Description of the interactive</caption>' +
                                '</figure>',
                                '<figure class="interactive new" data-interactive="http://interactive.guim.co.uk/embed/path/to/interactive/boot.js">' +
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
            });

            describe('Legacy (relative URLs)', function() {
                var i;

                beforeEach(function() {
                    i = new Interactive(document.querySelector('figure.interactive.legacy'), document, config);
                });

                it("Should exist", function() {
                    expect(i).toBeDefined();
                });

                it("Should load the interactive resource relatively defined in the data-attribute", function() {
                    require = jasmine.createSpy();
                    i.init();
                    expect(require.mostRecentCall.args[0]).toBe('http://foo/path/to/interactive/boot.js');
                });
            });


            describe('New (absolute URLs)', function() {
                var i;

                beforeEach(function() {
                    i = new Interactive(document.querySelector('figure.interactive.new'), document, config);
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
    });
