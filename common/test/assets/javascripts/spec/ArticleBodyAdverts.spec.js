define([ 'common/common',
         'bean',
         'bonzo',
         'common/modules/adverts/article-body-adverts',
         'helpers/fixtures'], function(common, bean, bonzo, ArticleBodyAdverts, fixtures) {


        describe("ArticleBodyAdverts", function() {
            var style;
            var conf = {
                    id: 'article',
                    fixtures: [
                                '<div class="mpu-container js-mpu-ad-slot"><div class="social-wrapper social-wrapper--aside"><h2 class="article__meta-heading tone-colour">Share this article</h2></div></div>',
                                '<div class="article-body from-content-api"><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p></div>'
                              ]
            };

            beforeEach(function() {
                fixtures.render(conf);
            });

            afterEach(function() {
                fixtures.clean();
                style.remove();
            });

            it("Should insert an ad container in the secondary column", function() {
                style = bonzo(bonzo.create('<style type="text/css"></style>'))
                    .html('body:after{ content: "wide"}')
                    .appendTo('head');

                new ArticleBodyAdverts().init();

                expect(document.querySelectorAll('.ad-slot--mpu-banner-ad').length).toBe(1);
            });

            it("Should insert an 2 inline ad containers to the content", function() {
                new ArticleBodyAdverts().init();

                expect(document.querySelectorAll('.ad-slot--inline').length).toBe(2);
            });
        });
    });
