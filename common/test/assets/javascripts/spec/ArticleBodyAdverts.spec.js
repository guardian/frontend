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
                                '<div class="article-body u-cf from-content-api" itemprop="articleBody"><h2>The winner</h2><p>Exactly a year ago, opened in the UK with £9.51m, plus £2.1m in previews. Many critics carped that thefilm didnt live up to Peter Jacksons Lord of the Rings trilogy, and sounded a noteof scepticism over.</p><p>Now sequel arrives with a very similar £9.32m, slightly down on the original. A better Metacritic score of 66/100 (as opposed to 58/100 for Unexpected Journey) suggests that the film.</p><p>Among films released in 2012, An Unexpected Journey ended up as the third-highestgrosser, behind only Skyfall and The Dark Knight Rises. So far in 2013, the top title.</p><p>Among films released in 2012, An Unexpected Journey ended up as the third-highestgrosser, behind only Skyfall and The Dark Knight Rises. So far in 2013, the top title is.</p><p>Among films released in 2012, An Unexpected Journey ended up as the third-highestgrosser, behind only Skyfall and The Dark Knight Rises. So far in 2013, the top title.</p><p>With family films for the festive season, its not so much about the opening weekendas the full period up to Christmas Eve: virtually the whole of December can be golden.</p><p>After 10 days, Frozen has clocked up a very handy £10.3m, which compares with asimilar £10.52m for Disneys Wreck-It Ralph at the same stage of its run, and £8.63mfor Monsters University. Those films achieved final tallies of £23.78m and £30.64mrespectively, and Disney will be hoping that Frozen lands at a similar place. Andsince there is no particular plot connection between Frozen and the Christmas holiday,there is no reason why the film couldnt continue to engage audiences beyond 25 Decemberand into wintry January.</p><h2>The year to date</h2><p>A sentence less than 120 characters</p><p>A sentence less than 120 characters</p><p>A sentence less than 120 characters</p><p>A sentence less than 120 characters</p><p>A sentence less than 120 characters</p><p>A sentence less than 120 characters</p><p>A sentence less than 120 characters</p><p>A sentence less than 120 characters</p><p>A sentence less than 120 characters</p><p>A sentence less than 120 characters</p><p>This will be the final UK box-office report for 2013 – and in fact the column willbe on a three-week hiatus – so it seems a good chance to take stock of the year.Below is a special one-off chart featuring the years top 30 hits. As usual, thereis a strong domination by sequels and films based on existing hit properties, suchas stage musical Les Misérables, comic-book icon Superman and books including TheGreat Gatsby and World War Z.</p><div class="media-proportional-container"></div><p>Animation has had a particularly strong year in 2013. Not only is the top title(so far) Despicable Me 2, there are two more animations. Animation has had a particularly strong year in 2013. Not only is the top title(so far) Despicable Me 2, there are two more animations.</p><p>Generating a lot of publicity – much of it negative – surrounding the casting ofBritains Got Talent winner Susan Boyle, festive period tale<a href="/film/movie/158849/christmas-candle" data-link-name="in body link" class=" u-underline">The Christmas Candle</a></p><p>Generating a lot of publicity – much of it negative – surrounding the casting ofBritains Got Talent winner Susan Boyle, festive period tale<a href="/film/movie/158849/christmas-candle" data-link-name="in body link" class=" u-underline">The Christmas Candle</a></p><p>Generating a lot of publicity – much of it negative – surrounding the casting ofBritains Got Talent winner Susan Boyle, festive period tale<a href="/film/movie/158849/christmas-candle" data-link-name="in body link" class=" u-underline">The Christmas Candle</a></p><p>Generating a lot of publicity – much of it negative – surrounding the casting ofBritains Got Talent winner Susan Boyle, festive period tale<a href="/film/movie/158849/christmas-candle" data-link-name="in body link" class=" u-underline">The Christmas Candle</a></p><p>Generating a lot of publicity – much of it negative – surrounding the casting ofBritains Got Talent winner Susan Boyle, festive period tale<a href="/film/movie/158849/christmas-candle" data-link-name="in body link" class=" u-underline">The Christmas Candle</a></p><p>Overall the box office is a slim 1% up on the equivalent weekend from 2012, whenthe original Hobbit film and DreamWorks Animations Rise of the Guardians occupiedthe top two spots in the chart.</p><h2>Top 10 films 13-15 December</h2><p><strong>1.</strong><a href="/film/movie/154178/hobbit" title="" data-link-name="in body link" class=" u-underline">The Hobbit: The Desolation of Smaug</a>, £9,325,626 from 580 sites (<strong>New</strong>)</p><p><strong>2.</strong><a href="/film/movie/155770/frozen" title="" data-link-name="in body link" class=" u-underline">Frozen</a>, £4,212,920 from 515 sites. Total: £10,298,514</p><p><strong>3.</strong><a href="/film/movie/158612/hunger-games" title="" data-link-name="in body link"class=" u-underline">The Hunger Games: Catching Fire</a>, £1,368,662 from 492 sites. Total: £28,824,306</p><p><strong>4.</strong><a href="/film/movie/156058/gravity" title="" data-link-name="in body link" class=" u-underline">Gravity</a>, £592,321 from 359 sites. Total: £25,763,353</p><p><strong>5.</strong><a href="/film/movie/156373/saving-mr-banks" title="" data-link-name="in body link"class=" u-underline">Saving Mr Banks</a>, £359,134 from 393 sites. Total: £2,802,991</p><p><strong>6.</strong>Falstaff – Met Opera (live event), £224,763 from 165 sites (<strong>New</strong>)</p><p><strong>7.</strong><a href="/film/movie/158970/homefront" title="" data-link-name="in body link" class=" u-underline">Homefront</a>, £202,518 from 259 sites. Total: £942,561</p><p><strong>8.</strong><a href="/film/movie/156233/free-birds" title="" data-link-name="in body link" class=" u-underline">Free Birds</a>, £191,656 from 416 sites. Total: £1,788,256</p><p><strong>9.</strong><a href="/film/movie/155322/butler" title="" data-link-name="in body link" class=" u-underline">The Butler</a>, £144,573 from 207 sites. Total: £3,794,786</p><p><strong>10.</strong><a href="/film/movie/150238/carrie" title="" data-link-name="in body link" class=" u-underline">Carrie</a>, £118,097 from 224 sites. Total: £1,658,491</p></div>'
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
