define([
    'helpers/fixtures',
    'common/modules/commercial/creatives/template'
], function (
    fixtures,
    Template
) {
    var fixturesConfig = {
        id: 'ad-slot',
        fixtures: [
            '<div class="ad-slot"></div>'
        ]
    },
    slot;

    describe('Template', function () {

        it('should exist', function () {
            expect(Template).toBeDefined();
        });

    });

    describe('Manual inline', function () {
        beforeEach(function (done) {
            slot = fixtures.render(fixturesConfig);
            done();
        });

        afterEach(function () {
            fixtures.clean(fixturesConfig.id);
        });

        it('should create a manual inline component', function () {
            var params = {
                creative: 'manual-inline',
                Toneclass: 'commercial--tone-brand',
                component_title: 'The Guardian Bookshop',
                omniture_id: '[%OmnitureID%]',
                base_url: 'http://www.guardianbookshop.co.uk/',
                offer_title: 'Title',
                offer_url: 'http://www.guardianbookshop.co.uk/',
                offer_image: 'http://pagead2.googlesyndication.com/pagead/imgad?id=CICAgKCToPeYcRABGAEyCL27FJtXKuKj',
                offer_meta: 'Meta',
                offer_button: 'yes',
                clickMacro: '%%CLICK_URL_ESC%%'
            };
            new Template(slot, params).create().then(function () {
                expect(document.querySelector('.commercial', slot)).not.toBe(null);
            });
        });

        it('should create a manual inline component with no button', function () {
            var params = {
                creative: 'manual-inline',
                Toneclass: 'commercial--tone-brand',
                component_title: 'The Guardian Bookshop',
                omniture_id: '[%OmnitureID%]',
                base_url: 'http://www.guardianbookshop.co.uk/',
                offer_title: 'Title',
                offer_url: 'http://www.guardianbookshop.co.uk/',
                offer_image: 'http://pagead2.googlesyndication.com/pagead/imgad?id=CICAgKCToPeYcRABGAEyCL27FJtXKuKj',
                offer_meta: 'Meta',
                offer_button: 'no',
                clickMacro: '%%CLICK_URL_ESC%%'
            };
            new Template(slot, params).create().then(function () {
                expect(document.querySelector('.commercial--v-high__body .button', slot)).toBe(null);
            });
        });
    });

    describe('Manual single', function () {
        beforeEach(function (done) {
            slot = fixtures.render(fixturesConfig);
            done();
        });

        afterEach(function () {
            fixtures.clean(fixturesConfig.id);
        });

        it('should create a manual single component', function () {
            var params = {
                creative: "manual-single",
                toneClass:  "commercial--tone-brand",
                omnitureId: "[%omnitureid%]",
                baseUrl: "http://www.theguardian.com/technology/2014/nov/20/apple-beats-music-iphone-ipad-spotify",
                title: "title",
                viewAllText: "View all",
                offerTitle: "Scientists climb to bottom of Siberian sinkhole - in pictures",
                offerImage: "http://pagead2.googlesyndication.com/pagead/imgad?id=CICAgKDjk-jQkgEQARgBMghE750kQXQwJg",
                offerText: "A Russian research team including scientists, a medic and a professional climber has descended a giant sinkhole on the Yamal Peninsula in northern Siberia. Photographs by Vladimir Pushkarev/Siberian Times",
                offerLinkText: "click here",
                offerUrl: "http://www.theguardian.com/technology/2014/nov/20/apple-beats-music-iphone-ipad-spotify",
                seeMoreUrl: "http://www.theguardian.com/technology/2014/nov/20/apple-beats-music-iphone-ipad-spotify",
                showCtaLink: "show-cta-link",
                clickMacro: "%%CLICK_URL_ESC%%"
            };
            new Template(slot, params).create().then(function () {
                expect(document.querySelector('.commercial', slot)).not.toBe(null);
            });
        });

        it('should create a manual single component with no button', function () {
            var params = {
                creative: "manual-single",
                toneClass:  "commercial--tone-brand",
                omnitureId: "[%omnitureid%]",
                baseUrl: "http://www.theguardian.com/technology/2014/nov/20/apple-beats-music-iphone-ipad-spotify",
                title: "title",
                viewAllText: "View all",
                offerTitle: "Scientists climb to bottom of Siberian sinkhole - in pictures",
                offerImage: "http://pagead2.googlesyndication.com/pagead/imgad?id=CICAgKDjk-jQkgEQARgBMghE750kQXQwJg",
                offerText: "A Russian research team including scientists, a medic and a professional climber has descended a giant sinkhole on the Yamal Peninsula in northern Siberia. Photographs by Vladimir Pushkarev/Siberian Times",
                offerUrl: "http://www.theguardian.com/technology/2014/nov/20/apple-beats-music-iphone-ipad-spotify",
                seeMoreUrl: "http://www.theguardian.com/technology/2014/nov/20/apple-beats-music-iphone-ipad-spotify",
                showCtaLink: "show-cta-link",
                clickMacro: "%%CLICK_URL_ESC%%"
            };
            new Template(slot, params).create().then(function () {
                expect(document.querySelector('.lineitem--dfp-single .button', slot)).toBe(null);
            });
        });
    });

    describe('Manual multiple', function () {
        beforeEach(function (done) {
            slot = fixtures.render(fixturesConfig);
            done();
        });

        afterEach(function () {
            fixtures.clean(fixturesConfig.id);
        });

        it('should create a manual multiple component', function () {
            var params = {
                creative: "manual-multiple",
                title: "A Title",
                explainer: "Explainer text",
                base__url: "http://www.theguardian.com/uk",
                offerlinktext: "Offer link text",
                viewalltext: "View all text",
                offeramount: "offer-amount",
                relevance: "high",
                Toneclass: "commercial--tone-brand",
                offer1title: "Offer 1 Title",
                offer1url: "http://www.theguardian.com/uk",
                offer1meta: "Offer 1 Meta",
                offer1image: "http://www.catgifpage.com/gifs/247.gif",
                offer2title: "Offer 2 Title",
                offer2url: "http://www.theguardian.com/uk",
                offer2meta: "Offer 1 Meta",
                offer2image: "http://www.catgifpage.com/gifs/247.gif",
                offer3title: "Offer 3 Title",
                offer3url: "http://www.theguardian.com/uk",
                offer3meta: "Offer 1 Meta",
                offer3image: "http://www.catgifpage.com/gifs/247.gif",
                offer4title: "Offer 4 Title",
                offer4url: "http://www.theguardian.com/uk",
                offer4meta: "Offer 1 Meta",
                offer4image: "http://www.catgifpage.com/gifs/247.gif",
                omnitureId: "[%OmnitureID%]",
                clickMacro: "%%CLICK_URL_ESC%%"
            };
            new Template(slot, params).create().then(function () {
                expect(document.querySelector('.commercial', slot)).not.toBe(null);
            });
        });

        it('should create a manual multiple component with no button', function () {
            var params = {
                creative: "manual-multiple",
                title: "A Title",
                explainer: "Explainer text",
                base__url: "http://www.theguardian.com/uk",
                viewalltext: "View all text",
                offeramount: "offer-amount",
                relevance: "high",
                Toneclass: "commercial--tone-brand",
                offer1title: "Offer 1 Title",
                offer1url: "http://www.theguardian.com/uk",
                offer1meta: "Offer 1 Meta",
                offer1image: "http://www.catgifpage.com/gifs/247.gif",
                offer2title: "Offer 2 Title",
                offer2url: "http://www.theguardian.com/uk",
                offer2meta: "Offer 1 Meta",
                offer2image: "http://www.catgifpage.com/gifs/247.gif",
                offer3title: "Offer 3 Title",
                offer3url: "http://www.theguardian.com/uk",
                offer3meta: "Offer 1 Meta",
                offer3image: "http://www.catgifpage.com/gifs/247.gif",
                offer4title: "Offer 4 Title",
                offer4url: "http://www.theguardian.com/uk",
                offer4meta: "Offer 1 Meta",
                offer4image: "http://www.catgifpage.com/gifs/247.gif",
                omnitureId: "[%OmnitureID%]",
                clickMacro: "%%CLICK_URL_ESC%%"
            };
            new Template(slot, params).create().then(function () {
                expect(document.querySelector('.lineitem__link .button', slot)).toBe(null);
            });
        });
    });
});
