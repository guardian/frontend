define([
    'common/utils/$',
    'bean',
    'bonzo',
    'common/modules/identity/api',
    'fastdom',
    'common/modules/email/email',
    'common/utils/config'
], function (
    $,
    bean,
    bonzo,
    Id,
    fastdom,
    email,
    config
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
        },
        makeABChanges = function (iFrameEl, opts) {
            // Once our iframe had loaded, make the A/B test changes
            bean.on(iFrameEl, 'load', function () {
                if (opts && opts.headline) {
                    updateHeadline(opts.headline, iFrameEl);
                }
                if (opts && opts.removeComforter) {
                    removeComforter(iFrameEl);
                }

                email.init(iFrameEl);
            });

            return iFrameEl;
        },
        updateHeadline = function (headline, iFrameEl) {
            fastdom.write(function () {
                $('.email-sub__heading', iFrameEl.contentDocument.body).text(headline);
            });
        },
        removeComforter = function (iFrameEl) {
            fastdom.write(function () {
                $('.email-sub__small', iFrameEl.contentDocument.body).remove();
            });
        };

        this.id = 'RtrtEmailFormInlineFooterV2';
        this.start = '2015-11-30';
        this.expiry = '2015-12-08';
        this.author = 'Gareth Trufitt';
        this.description = 'Test inline footer Guardian Today email sign-up with 50% of logged-out, UK users';
        this.audience = 50;
        this.audienceOffset = 0.50;
        this.successMeasure = 'Increase conversion of email sign-up';
        this.audienceCriteria = 'Logged-out UK users';
        this.dataLinkNames = '';
        this.idealOutcome = 'Email sign-up conversion and engagement is increased';

        this.canRun = function () {
            return config.page.edition === 'UK' && !Id.isUserLoggedIn();
        };

        this.variants = [
            {
                id: 'control',
                test: function () {
                    updateFooter();
                    fastdom.write(function () {
                        $('.footer__follow-us').prepend(
                            makeABChanges(getIframe()[0])
                        );
                    });
                }
            }
        ];

    };

});
