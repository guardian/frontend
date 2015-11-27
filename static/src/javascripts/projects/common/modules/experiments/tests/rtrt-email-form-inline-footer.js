define([
    'common/utils/$',
    'bean',
    'bonzo',
    'common/modules/identity/api',
    'fastdom',
    'common/modules/email/email'
], function (
    $,
    bean,
    bonzo,
    Id,
    fastdom,
    email
) {

    return function () {

        var updateFooter = function () {
            fastdom.write(function () {
                $('.js-footer__secondary')
                    .removeClass('l-footer__secondary--no-email')
                    .addClass('l-footer__secondary--has-email');

                $('.js-button--social').remove();
                $('.js-colophon__item--social').removeClass('is-hidden');
            });
        },
        getIframe = function () {
            return bonzo.create('<iframe src="/email/form" scrolling="no" seamless id="footer__email-form" frameborder="0" class="iframed--overflow-hidden email-sub__iframe"></iframe>');
        };

        this.id = 'RtrtEmailFormInlineFooter';
        this.start = '2015-11-13';
        this.expiry = '2015-12-13';
        this.author = 'Gareth Trufitt';
        this.description = 'Test headings and comfort text (No spam, one click subscribe)';
        this.audience = 0; // Initial 0% test to allow opt in for team testing
        this.audienceOffset = 0.90;
        this.successMeasure = 'X% more users sign up to the email in the footer';
        this.audienceCriteria = 'All non logged-in users, not on the email landing page';
        this.dataLinkNames = '';
        this.idealOutcome = 'Comfort messaging and headlines with stronger CTA get more sign-ups';

        this.canRun = function () {
            return true;
        };

        this.variants = [
            {
                id: 'headline-a-with-comforter',
                test: function () {
                    updateFooter();
                    fastdom.write(function () {
                        $('.footer__follow-us').prepend(getIframe());
                    });
                }
            }
        ];

    };

});
