define([
    'common/utils/$',
    'bean',
    'bonzo',
    'common/modules/identity/api',
    'fastdom',
    'common/modules/email/email',
    'common/utils/detect',
    'lodash/collections/contains'

], function (
    $,
    bean,
    bonzo,
    Id,
    fastdom,
    email,
    detect,
    contains
) {
    return function () {
        this.id = 'RtrtEmailFormArticlePromo';
        this.start = '2015-12-17';
        this.expiry = '2016-01-17';
        this.author = 'Gareth Trufitt';
        this.description = 'Test promotion of email form at bottom of article pages (when clicked from front)';
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'Increase email sign-up numbers';
        this.audienceCriteria = 'Visitors hitting articles after visiting a front';
        this.dataLinkNames = '';
        this.idealOutcome = 'Email sign-up is increased';

        this.canRun = function () {
            //Tests for fronts, editions optional.
            var host = window.location.host,
                escapedHost = host.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), // Escape anything that will mess up the regex
                urlRegex = new RegExp("^https?:\/\/" + escapedHost + "\/(uk\/|us\/|au\/)?([a-z-])+$", "gi"),
                browser = detect.getUserAgent.browser,
                version = detect.getUserAgent.version;

            // User referred from a front, is not logged in and not lte IE9
            return urlRegex.test(document.referrer) && !Id.isUserLoggedIn() && !(browser === 'MSIE' && contains(['7','8','9'], version + ''));
        };

        this.variants = [
            {
                id: 'control',
                test: function () {

                    var iframe = bonzo.create('<iframe src="/email/form/article/37" height="218px" data-form-title="Want stories like this in your inbox?" data-form-description="Sign up to The Guardian Today daily email and get the biggest headlines each morning." data-form-campaign-code="frontReferredTest" scrolling="no" seamless frameborder="0" class="iframed--overflow-hidden email-sub__iframe js-email-sub__iframe js-email-sub__iframe--article"></iframe>')[0];

                    bean.on(iframe, 'load', function () {
                        email.init(iframe);
                    });

                    fastdom.write(function () {
                        $('.js-article__body').append(iframe);
                    });
                }
            },
            {
                id: 'variant',
                test: function () {}
            }
        ];
    };
});
