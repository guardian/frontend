define([ 'common',
         'bean',
         'modules/navigation/sections',
         'helpers/fixtures'], function(common, bean, Sections, fixtures) {


        describe("Sections", function() {
            var sections;
            var conf = {
                    id: 'sections',
                    fixtures: [
                                '<div id="preloads"></div>',
                                '<div id="header">' +
                                '  <div class="control--topstories"></div>' +
                                '  <div class="nav-container"><ul class="nav nav--global"><li class="nav__item"><a href="/culture" class="nav__link">Culture</a></li></ul></div>' +
                                '  <div class="nav-popup-sections">foo</div>' +
                                '</div>',
                                '<div id="footer-nav">' +
                                  '<ul class="nav nav--footer"><li class="nav__item"><a href="/culture" class="nav__link">Culture</a></li></ul>' +
                                '</div>',
                                '<h1 class="section-head zone-color">World news</h1>',
                                '<h2 class="article-zone"><a href="/test">Test Section</a></h2>',
                                '<h3 id="related-content-head" class="type-2 article-zone">Related content</h3>',
                                '<h3 id="related-content-head" class="type-2 article-zone">More on this story</h3>'
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
              config.page.pageId = 'culture';
              sections = new Sections(config);
              sections.view.insertLocalNav(document);

              expect(document.querySelectorAll('.nav--local').length).toBe(1);
              expect(document.querySelector('#preloads').className).toContain('has-localnav');
            });

            it("Should insert a local nav when in Sport", function() {
              config.page.section = 'sport';
              config.page.pageId = 'sport';
              sections = new Sections(config);
              sections.view.insertLocalNav(document);

              expect(document.querySelectorAll('.nav--local').length).toBe(1);
              expect(document.querySelector('#preloads').className).toContain('has-localnav');
            });

            it("Should show the local nav when on a content page", function() {
                config.page.section = 'football';
                config.page.pageId = 'football/2013/oct/29/arsene-wenger-arsenal-chelsea-capital-one-cup';
                sections = new Sections(config);
                sections.view.insertLocalNav(document);

                expect(document.querySelectorAll('.nav--local').length).toBe(1);
            });

            it("Should not insert a local nav when in Business", function() {
              config.page.section = 'business';
              config.page.pageId = 'business';
              sections = new Sections(config);
              sections.view.insertLocalNav(document);

              expect(document.querySelectorAll('.nav--local').length).toBe(0);
              expect(document.querySelector('#preloads').className).not.toContain('has-localnav');
            });

            it("Should only have a single active highlighted section", function() {
              config.page.section = 'sport';
              config.page.pageId = 'sport/cricket';
              sections = new Sections(config);
              sections.view.insertLocalNav(document);

              expect(document.querySelectorAll('.nav-popup-localnav .is-active').length).toBe(1);
            });


            it("Should highlight Books section when inside it", function() {
              config.page.section = 'books';
              config.page.pageId = 'books';
              sections = new Sections(config);
              sections.view.insertLocalNav(document);

              expect(document.querySelector('[data-link-name="Books"]').parentNode.className).toContain('is-active');
            });

            it("Should not contain the first link in the wide desktop nav", function() {
              config.page.section = 'books';
              config.page.pageId = 'books';
              sections = new Sections(config);
              sections.view.insertLocalNav(document);

              expect(document.querySelectorAll('.nav-popup-localnav .nav__link')[0].href).toContain('/culture');
              expect(document.querySelectorAll('.nav--local .nav__link')[0].href).not.toContain('/culture');
            });


            it("Should only colour highlight the top navs, not the footer", function() {
              config.page.section = 'culture';
              config.page.pageId = 'culture';
              sections = new Sections(config);
              sections.view.insertLocalNav(document);

              expect(document.querySelectorAll('.is-active [href="/culture"]').length).not.toBe(0);
              expect(document.querySelectorAll('.nav--footer .is-active [href="/culture"]').length).toBe(0);
            });
        });
    });
