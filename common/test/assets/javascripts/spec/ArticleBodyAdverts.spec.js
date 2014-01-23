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
                                '<div class="js-article__container"><div class="article-body from-content-api"><p>An eight-hour truce has been declared by protesters in Kiev after<a href="/world/2014/jan/22/ukraine-opposition-leaders-meet-president-protests-fatal" title="" data-link-name="in body link" class=" u-underline">a day of violence</a>in which at least three people died and an opposition leader said he was willing to face "a bullet in the forehead" if Ukraines president, Viktor Yanukovych, did not launch snap elections.</p><p>The truce was announced by opposition politician and former heavyweight boxer Vitali Klitschko at midday Kiev time, as negotiations between opposition leaders and Yanukovych were expected to continue.</p><p>On Thursday afternoon Yanukovych called a special parliament session for next week to discuss the crisis, but there was no indication that this represented an inclination to compromise with the opposition.</p><p>On Wednesday, a three-hour meeting between the sides ended without a deal, leaving the capital braced for intensified violence.</p><p>After the truce was announced, protesters began to extinguish the huge burning barricade, made of thousands of tyres, which has separated them from lines of riot police and been the focal point of clashes.</p><p>Klitschko said he would return to the barricades at 8pm local time (6pm GMT) to announce the results of negotiations.</p><p>Two men died from bullet wounds on Wednesday, according to Ukraines general prosecutor, while the third died after falling from a rooftop while fighting with police. Protesters report that dozens of people have been seriously injured during the clashes, which had been running since Sunday evening.</p><p>Parts of central Kiev resembled a battlefield during the clashes, with police firing rubber bullets and wielding truncheons, while protesters lobbed molotov cocktails. The two men who were shot were killed with live ammunition, the authorities admitted.</p><p>On Wednesday, Klitschko said Yanukovych had 24 hours in which to call snap elections, demanding another meeting with the president. If this did not happen, he said, the opposition would "go on the attack". His words drew loud cheers from the crowd on Independence Square, hub of the protests.</p><p>"If we have to fight, I will fight together with you. If we have to face bullets, I will face bullets," Klitschko told the crowd.</p><p>Arseniy Yatsenyuk, who represents the party of jailed former prime minister Yulia Tymoshenko and attended the meeting with Yanukovych, also had fighting words for the tens of thousands of demonstrators on Independence Square, saying: "Tomorrow we will go forward together. And if its a bullet in the forehead, then its a bullet in the forehead – but in an honest, fair and brave way."</p><p>The opposition leaders initially condemned protesters attacks on riot police when they began on Sunday night, saying they were carried out by "provocateurs", but as the mood has become more radical, they have come under pressure to take a more decisive stance.</p><p>Yanukovych issued a statement saying he did not want bloodshed or the use of force, but the government does not appear ready to compromise. The prime minister, Mykola Azarov, called the protesters "terrorists". He said those who died were responsible for their fate and insisted the government had no option but to use force.</p><p>He later left Kiev for Davos, where he was due to take part in a panel at the World Economic Forum on Friday. However, it emerged that after the deaths in Kiev his invitation to the panel, and to the forum itself, was rescinded.</p><p>Condemnation of the violence has poured in from across the world. On Thursday Angela Merkel said Germany had been outraged by "the way laws have been pushed through that call democratic freedoms into question", but added that it would be wrong for Europe to respond to the violence with sanctions at this stage.</p><p>The US embassy in Kiev on Wednesday said it had revoked visas for a number of Ukrainian officials linked to police violence against demonstrators, and said Washington was considering taking further steps against the regime.</p><h2>Read more</h2></div></div>'
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
                expect($('.ad-slot--mpu-banner-ad, .ad-slot--inline').length).toBe(3);

                articleBodyAdverts.destroy();
                expect($('.ad-slot--mpu-banner-ad, .ad-slot--inline').length).toBe(0);
            });

            describe('When setting a limit of 1 inline ad', function() {

                it("Should insert only 1 inline ad container to the content", function() {
                    articleBodyAdverts.config.inlineAdLimit = 1;
                    articleBodyAdverts.init();
                    expect($('.ad-slot--inline').length).toBe(1);
                });
            });
        });
    });
