define([ 'common',
         'bean',
         'modules/navigation/sections',
         'fixtures'], function(common, bean, Sections, fixtures) {


        describe("Sections", function() {
            var sections;
            var conf = {
                    id: 'sections',
                    fixtures: [
                                '<div id="preloads"></div>',
                                '<div id="header"><div class="control--topstories"></div></div>',
                                '<div class="nav-popup-sections">foo</div>'
                              ]
            };

            var config = {
                page: {
                  section: 'culture'
                }
            };

            beforeEach(function() {
                fixtures.render(conf);


                sections = new Sections(config);
            });

            it("Should be responsive", function() {

                // TODO

            });


            it("Should insert a local nav when in Culture", function() {
              config.page.section = 'culture';
              sections = new Sections(config);
              sections.view.insertLocalNav(document);

              expect(document.querySelectorAll('.nav--local').length).toBe(1);
              expect(document.querySelector('#preloads').className).toContain('has-localnav');
            });

            it("Should insert a local nav when in Sport", function() {
              config.page.section = 'sport';
              sections = new Sections(config);
              sections.view.insertLocalNav(document);

              expect(document.querySelectorAll('.nav--local').length).toBe(1);
              expect(document.querySelector('#preloads').className).toContain('has-localnav');
            });

            it("Should not insert a local nav when in Business", function() {
              config.page.section = 'business';
              sections = new Sections(config);
              sections.view.insertLocalNav(document);

              expect(document.querySelectorAll('.nav--local').length).toBe(0);
              expect(document.querySelector('#preloads').className).not.toContain('has-localnav');
            });


            it("Should highlight Books section when inside it", function() {
              config.page.section = 'books';
              config.page.pageId = 'books';
              sections = new Sections(config);
              sections.view.insertLocalNav(document);

              expect(document.querySelector('[data-link-name="Books"]').parentNode.className).toContain('is-active');
              expect(document.querySelector('[data-link-name="Books"]').className).toContain('zone-color');
            });


            it("Should not contain the first link in the wide desktop nav", function() {
              config.page.section = 'books';
              config.page.pageId = 'books';
              sections = new Sections(config);
              sections.view.insertLocalNav(document);

              expect(document.querySelectorAll('.nav-popup-localnav .nav__link')[0].href).toContain('/culture');
              expect(document.querySelectorAll('.nav--local .nav__link')[0].href).not.toContain('/culture');
            });

        });
    });
