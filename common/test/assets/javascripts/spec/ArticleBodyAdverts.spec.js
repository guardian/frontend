define([ 'common/common',
         'bean',
         'bonzo',
         'common/modules/adverts/article-body-adverts',
         'helpers/fixtures'], function(common, bean, bonzo, ArticleBodyAdverts, fixtures) {


        describe("ArticleBodyAdverts", function() {
            var style;
            var articleBodyAdverts;
            var conf = {
                    id: 'article',
                    fixtures: [
                                '<div class="mpu-container js-mpu-ad-slot"><div class="social-wrapper social-wrapper--aside"><h2 class="article__meta-heading tone-colour">Share this article</h2></div></div>',
                                '<div class="article-body from-content-api"><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p></div>'
                              ]
            };

            beforeEach(function() {
                fixtures.render(conf);

                articleBodyAdverts = new ArticleBodyAdverts({
                    isArticle: true
                });

                style = bonzo(bonzo.create('<style type="text/css"></style>'))
                    .html('body:after{ content: "wide"}')
                    .appendTo('head');
            });

            afterEach(function() {
                fixtures.clean();
                style.remove();
                articleBodyAdverts.destroyAds();
            });

            it("Should insert an ad container in the secondary column", function() {
                articleBodyAdverts.init();
                expect(document.querySelectorAll('.ad-slot--mpu-banner-ad').length).toBe(1);
            });

            it("Should insert an 2 inline ad containers to the content", function() {
                articleBodyAdverts.init();
                expect(document.querySelectorAll('.ad-slot--inline').length).toBe(2);
            });

            it("Should destroy the ads", function() {
                articleBodyAdverts.init();
                expect(document.querySelectorAll('.ad-slot--mpu-banner-ad, .ad-slot--inline').length).toBe(3);

                articleBodyAdverts.destroyAds();
                expect(document.querySelectorAll('.ad-slot--mpu-banner-ad, .ad-slot--inline').length).toBe(0);
            });
        });
    });
