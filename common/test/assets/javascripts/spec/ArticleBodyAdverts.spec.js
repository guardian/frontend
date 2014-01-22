define([ 'common/common',
         'common/$',
         'bean',
         'bonzo',
         'common/modules/adverts/article-body-adverts',
         'helpers/fixtures'
    ], function(common, $, bean, bonzo, ArticleBodyAdverts, fixtures) {


        describe("ArticleBodyAdverts", function() {
            var style;
            var articleBodyAdverts;
            var conf = {
                    id: 'article',
                    fixtures: [
                                '<div class="mpu-container js-mpu-ad-slot"><div class="social-wrapper social-wrapper--aside"><h2 class="article__meta-heading tone-colour">Share this article</h2></div></div>',
                                '<div class="article-body from-content-api"><h2>The winner</h2><p>A sentence that is long enough to have an advert placed next to it because there are enough characters in this sentence!!!</p><p>A sentence that is long enough to have an advert placed next to it because there are enough characters in this sentence!!!</p><p>A sentence that is long enough to have an advert placed next to it because there are enough characters in this sentence!!!</p><p>A sentence that is long enough to have an advert placed next to it because there are enough characters in this sentence!!!</p><p>A sentence that is long enough to have an advert placed next to it because there are enough characters in this sentence!!!</p><p>A sentence that is long enough to have an advert placed next to it because there are enough characters in this sentence!!!</p><p>A sentence that is long enough to have an advert placed next to it because there are enough characters in this sentence!!!</p><h2>The year to date</h2><p>A sentence less than 120 characters</p><p>A sentence less than 120 characters</p><p>A sentence less than 120 characters</p><p>A sentence less than 120 characters</p><p>A sentence less than 120 characters</p><p>A sentence less than 120 characters</p><p id=short_paragraph>A sentence less than 120 characters</p><p>A sentence that is long enough to have an advert placed next to it because there are enough characters in this sentence!!!</p><p>A sentence that is long enough to have an advert placed next to it because there are enough characters in this sentence!!!</p><p>A sentence that is long enough to have an advert placed next to it because there are enough characters in this sentence!!!</p><p>A sentence that is long enough to have an advert placed next to it because there are enough characters in this sentence!!!</p><p>A sentence that is long enough to have an advert placed next to it because there are enough characters in this sentence!!!</p><p>A sentence that is long enough to have an advert placed next to it because there are enough characters in this sentence!!!</p><p>A sentence that is long enough to have an advert placed next to it because there are enough characters in this sentence!!!</p><p>A sentence that is long enough to have an advert placed next to it because there are enough characters in this sentence!!!</p></div>'
                              ]
            };

            beforeEach(function() {
                fixtures.render(conf);

                articleBodyAdverts = new ArticleBodyAdverts();

                style = bonzo(bonzo.create('<style type="text/css"></style>'))
                    .html('body:after{ content: "wide"}')
                    .appendTo('head');
            });

            afterEach(function() {
                fixtures.clean();
                style.remove();
                articleBodyAdverts.destroy();
            });

            it("Should insert an ad container in the secondary column", function() {
                articleBodyAdverts.init();
                expect($('.ad-slot--mpu-banner-ad').length).toBe(1);
            });

            it("Should insert an 2 inline ad containers to the content", function() {
                articleBodyAdverts.init();
                expect($('.ad-slot--inline').length).toBe(2);
            });

            it("Should ignore any paragraphs less than 120 characters", function() {
                articleBodyAdverts.init();
                expect($('#short_paragraph').previous().hasClass('ad-slot--inline')).toBeFalsy();
            });

            it("Should destroy the ads", function() {
                articleBodyAdverts.init();
                expect(document.querySelectorAll('.ad-slot--mpu-banner-ad, .ad-slot--inline').length).toBe(3);

                articleBodyAdverts.destroy();
                expect(document.querySelectorAll('.ad-slot--mpu-banner-ad, .ad-slot--inline').length).toBe(0);
            });

            describe('When setting a limit of 1 inline ad', function() {

                it("Should insert only 1 inline ad container to the content", function() {
                    articleBodyAdverts.config.inlineAdLimit = 1;
                    articleBodyAdverts.init();
                    expect(document.querySelectorAll('.ad-slot--inline').length).toBe(1);
                });
            });
        });
    });
