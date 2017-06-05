define([
    'bean',
    'qwery',
    'lib/config',
    'lib/detect',
    'lib/cookies',
    'commercial/modules/user-features'
], function (
    bean,
    qwery,
    config,
    detect,
    cookies,
    userFeatures
) {
    return function () {
        var self = this;
        this.id = 'BundleDigitalSubPriceTest1M';
        this.start = '2017-05-10';
        this.expiry = '2017-07-06'; // Thursday 6th July
        this.author = 'Justin Pinner';
        this.description = 'Test digital subs price points via thrasher';
        this.showForSensitive = true;
        this.audience = 0.25;
        this.audienceOffset = 0.75;
        this.successMeasure = '';
        this.audienceCriteria = 'Non-paying UK network front users - mobile resolution and above';
        this.dataLinkNames = '';
        this.idealOutcome = 'Find the price that works for most people.';
        this.hypothesis = 'One of our price points will be more desirable than the others';

        this.canRun = function () {
            return document.querySelector('#membership-ab-thrasher') &&
                    !cookies.getCookie('GU_DBPT1M') &&
                    !userFeatures.isPayingMember() &&
                    config.page.isFront &&
                    config.page.pageId.toLowerCase() === "uk" &&
                    config.page.edition.toUpperCase() === 'UK';
        };

        this.thrasherContainer = function() {
            return document.querySelector('#membership-ab-thrasher');
        };

        this.thrasher = function() {
            return document.querySelector('.membership-ab-thrasher--wrapper');
        };

        this.setTitle = function() {
            if (this.thrasher()) {
                var titleEl = document.querySelector('.membership-ab-thrasher_header .main_title');
                if (titleEl) {
                    titleEl.innerHTML = '<p>Support' + (detect.isBreakpoint({min: 'mobileMedium', max: 'tablet'}) ? ' ' : '<br>')  + 'the Guardian</p>';
                }
            }
        };

        this.setCopy = function() {
            if (this.thrasher()) {
                var subTitleEl = document.querySelector('.membership-ab-thrasher_header .sub_title');
                if (subTitleEl) {
                    subTitleEl.innerHTML = '<p>We\'re introducing <strong>new ways</strong> to support' + (detect.isBreakpoint({min: 'desktop'}) ? '<br>' : ' ') + 'the Guardian\'s quality journalism and independent voice. Choose to subscribe or contribute today.</p>';
                }
            }
        };

        this.setLink = function(variant) {
            if (this.thrasher()) {
                var linkEl = document.querySelector('.membership-ab-thrasher--wrapper .link-button');
                if (linkEl && linkEl.getAttribute('href')) {
                    linkEl.setAttribute('href', config.page.membershipUrl + '/bundles?INTCMP=BUNDLE_PRICE_TEST_1M_' + config.page.edition.toUpperCase() + '_' + variant.toUpperCase());
                }
            }
        };

        this.setCaption = function() {
            if (this.thrasher()) {
                var captionEl = document.querySelector('.membership-ab-thrasher--wrapper .link-button div p');
                if (captionEl) {
                    captionEl.textContent = 'Subscribe now';
                }
            }
        };

        this.showThrasher = function() {
            var thrasherContainer = this.thrasherContainer();
            if (thrasherContainer) {
                if (!thrasherContainer.classList.contains('visible')) {
                    thrasherContainer.classList.add('visible');
                }
            }
        };

        this.setup = function(variant) {
            this.setTitle();
            this.setCopy();
            this.setLink(variant);
            this.setCaption();
            this.showThrasher();
        };

        this.completeFunc = function(complete) {
            // fire on thrasher's [find out more -->] button click
            bean.on(qwery('.membership-ab-thrasher--wrapper .link-button')[0], 'click', complete);
        };

        this.variants = [
            {
                id: 'A',
                test: function () {
                    self.setup('A');   // Band 'A' (control group) - current default price
                },
                success: this.completeFunc
            },
            {
                id: 'B',
                test: function () {
                    self.setup('B');  // B = Band 'B' - current default +20%
                },
                success: this.completeFunc
            },
            {
                id: 'C',
                test: function () {
                    self.setup('C');  // C = Band 'C' - current default -20%
                },
                success: this.completeFunc
            }
        ];
    };
});
