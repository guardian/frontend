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
                                '<div class=js-article__container><div class="article-body from-content-api"><p>An eight-hour truce has been declared by protesters in Kiev after a day of violence in which at least three people died and an opposition leader said he was willingto face "a bullet in the forehead" if Ukraines president, Viktor Yanukovych, didnot launch snap elections.</p><p>The truce was announced by opposition politician and former heavyweight boxer VitaliKlitschko at midday Kiev time, as negotiations between opposition leaders and Yanukovychwere expected to continue.</p><p>On Thursday afternoon Yanukovych called a special parliament session for next weekto discuss the crisis, but there was no indication that this represented an inclinationto compromise with the opposition.</p><p>On Wednesday, a three-hour meeting between the sides ended without a deal, leavingthe capital braced for intensified violence.</p><p>After the truce was announced, protesters began to extinguish the huge burning barricade,made of thousands of tyres, which has separated them from lines of riot police andbeen the focal point of clashes.</p><p>Klitschko said he would return to the barricades at 8pm local time (6pm GMT) toannounce the results of negotiations.</p><p>Two men died from bullet wounds on Wednesday, according to Ukraines general prosecutor,while the third died after falling from a rooftop while fighting with police. Protestersreport that dozens of people have been seriously injured during the clashes, whichhad been running since Sunday evening.</p><p>Parts of central Kiev resembled a battlefield during the clashes, with police firingrubber bullets and wielding truncheons, while protesters lobbed molotov cocktails.The two men who were shot were killed with live ammunition, the authorities admitted.</p><p>On Wednesday, Klitschko said Yanukovych had 24 hours in which to call snap elections,demanding another meeting with the president. If this did not happen, he said, theopposition would "go on the attack". His words drew loud cheers from the crowd onIndependence Square, hub of the protests.</p><p>"If we have to fight, I will fight together with you. If we have to face bullets,I will face bullets," Klitschko told the crowd.</p><p>Arseniy Yatsenyuk, who represents the party of jailed former prime minister YuliaTymoshenko and attended the meeting with Yanukovych, also had fighting words forthe tens of thousands of demonstrators on Independence Square, saying: "Tomorrowwe will go forward together. And if its a bullet in the forehead, then its a bulletin the forehead – but in an honest, fair and brave way."</p><p>The opposition leaders initially condemned protesters attacks on riot police whenthey began on Sunday night, saying they were carried out by "provocateurs", but asthe mood has become more radical, they have come under pressure to take a more decisivestance.</p><p>Yanukovych issued a statement saying he did not want bloodshed or the use of force,but the government does not appear ready to compromise. The prime minister, MykolaAzarov, called the protesters "terrorists". He said those who died were responsiblefor their fate and insisted the government had no option but to use force.</p><p>He later left Kiev for Davos, where he was due to take part in a panel at the WorldEconomic Forum on Friday. However, it emerged that after the deaths in Kiev his invitationto the panel, and to the forum itself, was rescinded.</p><p>Condemnation of the violence has poured in from across the world. On Thursday AngelaMerkel said Germany had been outraged by "the way laws have been pushed through thatcall democratic freedoms into question", but added that it would be wrong for Europeto respond to the violence with sanctions at this stage.</p><p id=insert_after>On Wednesday, Klitschko said Yanukovych had 24 hours in which to call snap elections,demanding another meeting with the president. If this did not happen, he said, theopposition would "go on the attack". His words drew loud cheers from the crowd onIndependence Square, hub of the protests.</p><p>"If we have to fight, I will fight together with you. If we have to face bullets,I will face bullets," Klitschko told the crowd.</p><p>Arseniy Yatsenyuk, who represents the party of jailed former prime minister YuliaTymoshenko and attended the meeting with Yanukovych, also had fighting words forthe tens of thousands of demonstrators on Independence Square, saying: "Tomorrowwe will go forward together. And if its a bullet in the forehead, then its a bulletin the forehead – but in an honest, fair and brave way."</p><p>The opposition leaders initially condemned protesters attacks on riot police whenthey began on Sunday night, saying they were carried out by "provocateurs", but asthe mood has become more radical, they have come under pressure to take a more decisivestance.</p><p>Yanukovych issued a statement saying he did not want bloodshed or the use of force,but the government does not appear ready to compromise. The prime minister, MykolaAzarov, called the protesters "terrorists". He said those who died were responsiblefor their fate and insisted the government had no option but to use force.</p><p>He later left Kiev for Davos, where he was due to take part in a panel at the WorldEconomic Forum on Friday. However, it emerged that after the deaths in Kiev his invitationto the panel, and to the forum itself, was rescinded.</p><p>Condemnation of the violence has poured in from across the world. On Thursday AngelaMerkel said Germany had been outraged by "the way laws have been pushed through thatcall democratic freedoms into question", but added that it would be wrong for Europeto respond to the violence with sanctions at this stage.</p></div></div>'
                              ]
            };

            beforeEach(function() {
                fixtures.render(conf);

                articleBodyAdverts = new ArticleBodyAdverts({
                    wordsPerAd: 300
                });

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

            it("Should insert a 2 inline ad containers to the content", function() {
                articleBodyAdverts.init();
                expect($('.ad-slot--inline').length).toBe(2);
            });

            it("Should ignore any paragraphs less than 120 characters", function() {
                articleBodyAdverts.init();
                expect($('#short_paragraph').previous().hasClass('ad-slot--inline')).toBeFalsy();
            });

            it("Should destroy the ads", function() {
                articleBodyAdverts.init();
                expect(articleBodyAdverts.inlineAdsPlaced).toBe(2);
                expect($('.ad-slot--mpu-banner-ad, .ad-slot--inline').length).toBe(3);

                articleBodyAdverts.destroy();
                expect(articleBodyAdverts.inlineAdsPlaced).toBe(0);
                expect($('.ad-slot--mpu-banner-ad, .ad-slot--inline').length).toBe(0);
            });

            it('Should return the correct insert method', function() {
                expect(articleBodyAdverts.getInsertMethod()).toBe('insertBefore');
            });

            it('Should return the correct word limit for the slot at the top of the article', function() {
                expect(articleBodyAdverts.getTopOfArticleSlotWordLimit()).toBe(0);
            });

            describe('When setting a limit of 1 inline ad', function() {

                it("Should insert only 1 inline ad container to the content", function() {
                    articleBodyAdverts.config.inlineAdLimit = 1;
                    articleBodyAdverts.init();
                    expect($('.ad-slot--inline').length).toBe(1);
                });
            });

            describe('When viewing at the mobile breakpoint', function() {

                beforeEach(function() {
                    style = bonzo(bonzo.create('<style type="text/css"></style>'))
                        .html('body:after{ content: "mobile"}')
                        .appendTo('head');
                });

                it('Should return the correct insert method', function() {
                    expect(articleBodyAdverts.getInsertMethod()).toBe('insertAfter');
                });

                it('Should return the correct word limit for the slot at the top of the article', function() {
                    expect(articleBodyAdverts.getTopOfArticleSlotWordLimit()).toBe(150);
                });

                it("Should insert inline ad containers after paragraphs", function() {
                    articleBodyAdverts.init();
                    expect($('#insert_after').next().hasClass('ad-slot--inline')).toBeTruthy();
                });
            });
        });
    });
