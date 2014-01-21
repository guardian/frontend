define([ 'common/common',
         'bean',
         'bonzo',
         'common/modules/adverts/article-body-adverts',
         'helpers/fixtures'
    ], function(common, bean, bonzo, ArticleBodyAdverts, fixtures) {


        describe("ArticleBodyAdverts", function() {
            var style;
            var articleBodyAdverts;
            var conf = {
                    id: 'article',
                    fixtures: [
                                '<div class="mpu-container js-mpu-ad-slot"><div class="social-wrapper social-wrapper--aside"><h2 class="article__meta-heading tone-colour">Share this article</h2></div></div>',
                                '<div class="article-body from-content-api"><h2>The winner</h2><p>A sentence that is long enough to have an advert placed next to it because there are enough characters in this sentence!!!</p><p>A sentence that is long enough to have an advert placed next to it because there are enough characters in this sentence!!!</p><p>A sentence that is long enough to have an advert placed next to it because there are enough characters in this sentence!!!</p><p>A sentence that is long enough to have an advert placed next to it because there are enough characters in this sentence!!!</p><p>A sentence that is long enough to have an advert placed next to it because there are enough characters in this sentence!!!</p><p>A sentence that is long enough to have an advert placed next to it because there are enough characters in this sentence!!!</p><p>A sentence that is long enough to have an advert placed next to it because there are enough characters in this sentence!!!</p><h2>The year to date</h2><p>A sentence less than 120 characters</p><p>A sentence less than 120 characters</p><p>A sentence less than 120 characters</p><p>A sentence less than 120 characters</p><p>A sentence less than 120 characters</p><p>A sentence less than 120 characters</p><p>A sentence less than 120 characters</p><p>A sentence less than 120 characters</p><p>A sentence that is long enough to have an advert placed next to it because there are enough characters in this sentence!!!</p><p>A sentence that is long enough to have an advert placed next to it because there are enough characters in this sentence!!!</p><p>A sentence that is long enough to have an advert placed next to it because there are enough characters in this sentence!!!</p><p>A sentence that is long enough to have an advert placed next to it because there are enough characters in this sentence!!!</p><p>A sentence that is long enough to have an advert placed next to it because there are enough characters in this sentence!!!</p><p>A sentence that is long enough to have an advert placed next to it because there are enough characters in this sentence!!!</p><figure id=test_figure class="img img--extended img--landscape"><img src=http://i.guim.co.uk/n/sys-images/Guardian/Pix/pictures/2014/1/20/1390230017580/Yume-Kitchen-Bristol-001.jpg alt="Yume Kitchen, Bristol" width=460 height=276 class=gu-image></figure><p>A sentence that is long enough to have an advert placed next to it because there are enough characters in this sentence!!!</p><p>A sentence that is long enough to have an advert placed next to it because there are enough characters in this sentence!!!</p><h2>Top 10 films 13-15 December</h2><p><strong>1.</strong><a href=/film/movie/154178/hobbit data-link-name="in body link" class=u-underline>The Hobbit: The Desolation of Smaug</a> , £9,325,626 from 580 sites ( <strong>New</strong>)</p><p><strong>2.</strong><a href=/film/movie/155770/frozen data-link-name="in body link" class=u-underline>Frozen</a> , £4,212,920 from 515 sites. Total: £10,298,514</p><p><strong>3.</strong><a href=/film/movie/158612/hunger-games data-link-name="in body link" class=u-underline>The Hunger Games: Catching Fire</a> , £1,368,662 from 492 sites. Total: £28,824,306</p><p><strong>4.</strong><a href=/film/movie/156058/gravity data-link-name="in body link" class=u-underline>Gravity</a> , £592,321 from 359 sites. Total: £25,763,353</p><p><strong>5.</strong><a href=/film/movie/156373/saving-mr-banks data-link-name="in body link" class=u-underline>Saving Mr Banks</a> , £359,134 from 393 sites. Total: £2,802,991</p><p><strong>6.</strong>Falstaff – Met Opera (live event), £224,763 from 165 sites ( <strong>New</strong>)</p><p><strong>7.</strong><a href=/film/movie/158970/homefront data-link-name="in body link" class=u-underline>Homefront</a> , £202,518 from 259 sites. Total: £942,561</p><p><strong>8.</strong><a href=/film/movie/156233/free-birds data-link-name="in body link" class=u-underline>Free Birds</a> , £191,656 from 416 sites. Total: £1,788,256</p><p><strong>9.</strong><a href=/film/movie/155322/butler data-link-name="in body link" class=u-underline>The Butler</a> , £144,573 from 207 sites. Total: £3,794,786</p><p><strong>10.</strong><a href=/film/movie/150238/carrie data-link-name="in body link" class=u-underline>Carrie</a> , £118,097 from 224 sites. Total: £1,658,491</p></div>'
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
                expect(document.querySelectorAll('.ad-slot--mpu-banner-ad').length).toBe(1);
            });

            it("Should insert an 2 inline ad containers to the content", function() {
                articleBodyAdverts.init();
                expect(document.querySelectorAll('.ad-slot--inline').length).toBe(2);
            });

            it("Should ignore any paragraphs less than 120 characters", function() {
                articleBodyAdverts.init();
                expect(document.querySelectorAll('.ad-slot--inline').length).toBe(2);
            });

            it("Should insert an ad container after a H2 tag", function() {
                articleBodyAdverts.init();
                expect(document.querySelectorAll('.ad-slot--inline')[0].previousElementSibling.nodeName).toBe('H2');
            });

            it("Should insert an ad container after a figure tag", function() {
                articleBodyAdverts.init();
                expect(/ad-slot--inline/.test(document.querySelector('#test_figure').nextElementSibling.className)).toBe(true);
            });

            it("Should NOT insert an ad container after a H2 tag when on a mobile device", function() {
                style.remove();

                style = bonzo(bonzo.create('<style type="text/css"></style>'))
                    .html('body:after{ content: "mobile"}')
                    .appendTo('head');

                articleBodyAdverts.init();
                expect(document.querySelectorAll('.ad-slot--inline')[0].previousElementSibling.nodeName).toBe('P');
            });

            it("Should destroy the ads", function() {
                articleBodyAdverts.init();
                expect(document.querySelectorAll('.ad-slot--mpu-banner-ad, .ad-slot--inline').length).toBe(3);

                articleBodyAdverts.destroy();
                expect(document.querySelectorAll('.ad-slot--mpu-banner-ad, .ad-slot--inline').length).toBe(0);
            });
        });
    });
