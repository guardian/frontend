define([
    'common/utils/$',
    'common/utils/config'
], function (
    $,
    config
) {
    return function () {
        this.id = 'IdentityBenefits';
        this.start = '2015-02-16';
        this.expiry = '2015-03-31';
        this.author = 'Marc Hibbins';
        this.description = 'Displays one of the many enjoyable benefits of being a signed in Guardian user.';
        this.audience = 0.5;
        this.audienceOffset = 0;
        this.successMeasure = 'Number of signed in users';
        this.audienceCriteria = 'Users viewing the sign in or registration pages.';
        this.dataLinkNames = '';
        this.idealOutcome = 'Signed in users and new registrations increase.';

        this.canRun = function () {
            return config.page.section === 'identity' && (config.page.pageId === '/signin' || config.page.pageId === '/register');
        };

        function showBenefit(variant) {
            $('.identity-wrapper').addClass('identity-wrapper--leftcol');
            $('.identity-wrapper--benefits').removeClass('is-hidden');
            $('.identity-benefits__item--' + variant).removeClass('is-hidden');
        }

        this.variants = [
            {
                id: 'control',
                test: function () { }
            },
            {
                id: 'support',
                test: function () {
                    showBenefit('support');
                }
            },
            {
                id: 'discussion',
                test: function () {
                    showBenefit('discussion');
                }
            },
            {
                id: 'emails',
                test: function () {
                    showBenefit('emails');
                }
            },
            {
                id: 'witness',
                test: function () {
                    showBenefit('witness');
                }
            }
        ];
    };

});
