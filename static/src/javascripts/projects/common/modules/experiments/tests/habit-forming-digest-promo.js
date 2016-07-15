define([
    'common/utils/config',
    'common/utils/storage',
    'common/utils/template',
    'common/utils/fastdom-promise',
    'common/modules/ui/message',
    'common/views/svgs',
    'lodash/objects/defaults',
    'Promise',
    'text!common/views/experiments/digest-promo.html'
], function (
    config,
    storage,
    template,
    fastdomPromise,
    Message,
    svgs,
    defaults,
    Promise,
    digestPromo
) {
    return function () {
        this.id = 'HabitFormingDigestPromo';
        this.start = '2016-07-13';
        this.expiry = '2016-08-13';
        this.author = 'Kate Whalen';
        this.description = 'Show infrequent users a banner offering a curated digest';
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'Find if their is demand for various Guardian digest offerings';
        this.audienceCriteria = 'Infrequent visitors, excluding first time visits';
        this.dataLinkNames = 'habit forming digest promo';
        this.idealOutcome = 'Visitors click on the CTA and demonstrate demand for the feature';

        this.canRun = function () {
            return !(config.page.isAdvertisementFeature) && config.page.contentType === 'Article';
        };

        var defaultData = {
            arrowWhiteRight: svgs('arrowWhiteRight')
        };

        var DigestBanner = function (template, config) {
            this.template = template;
            this.config = config;

            this.templates = {
                'adblock-sticky-message': digestPromo,
                'adblock-sticky-message-coin': adblockStickyMessageCoin
            };
        };

        DigestBanner.prototype.renderTemplate = function () {
            return template(this.templates[this.template], this.config);
        };

        // check if the user is one of the target audience
        function isInfrequentVisitor(cookieName) {
            var habitCookie = cookies.get(cookieName);
            if (!(habitCookie) && storage.local.isStorageAvailable()) {
                var alreadyVisited = storage.local.get('gu.alreadyVisited');
                // check alreadyVisited and visit frequency?
                return true;
            }
            return false;
        }

        // makes the thing
        function renderDigestSnap2(messageText, linkText) {
            return fastdomPromise.write(function () {
                var article = document.getElementsByClassName('content__article-body')[0];
                var insertionPoint = article.getElementsByTagName('p')[1];
                var habitDigest = document.createElement('div');
                habitDigest.innerHTML = digestPromo;
                article.insertBefore(habitDigest, insertionPoint);
            });
        }

        function renderDigestSnap(messageText, linkText, linkHref) {
            var data = defaults({linkText: linkText}, {messageText: messageText}, {linkHref: linkHref}, defaultData);

            var cssModifierClass = 'membership-message';

            return new Message('habit-digest-message-07-16', {
                pinOnHide: false,
                siteMessageLinkName: 'habit digest message',
                siteMessageCloseBtn: 'hide',
                cssModifierClass: cssModifierClass
            }).show(template(digestPromo, data));
        }

        this.variants = [
            {
                id: 'digest',
                test: function () {
                    var messageText = "Get a package of stories tailored to you";
                    var linkText = "Get started";
                    var linkHref = "http://www.google.com";
                    renderDigestSnap(messageText, linkText, linkHref);
                }
            }, {
                id: 'weekend',
                test: function () {
                    var messageText = "Get the best stuff you didn't have time to read during the week delivered to you every Saturday";
                    var linkText = "Sign up";
                    var linkHref = "http://www.google.com";
                    renderDigestSnap(messageText, linkText, linkHref);
                }
            }, {
                id: 'headlines',
                test: function () {
                    var messageText = "Get the top headlines delivered to you every morning";
                    var linkText = "Sign up";
                    var linkHref = "http://www.google.com";
                    renderDigestSnap(messageText, linkText, linkHref);
                }
            }
        ];
    };
});
