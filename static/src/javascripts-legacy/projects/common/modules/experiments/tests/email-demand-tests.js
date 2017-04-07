define([
    'lib/$',
    'bean',
    'bonzo',
    'fastdom',
    'lib/config',
    'lodash/utilities/template',
    'lib/robust',
    'common/modules/email/run-checks',
    'lib/page',
    'lib/storage',
    'common/modules/check-mediator',
    'raw-loader!common/views/experiments/email-demand-test.html',
    'ophan/ng'
], function (
    $,
    bean,
    bonzo,
    fastdom,
    config,
    template,
    robust,
    emailRunChecks,
    page,
    storage,
    checkMediator,
    emailDemandTemplate,
    ophan
) {
    var minimumTrailingParagraphs = 5;
    var completeFunction = null;

    return function () {
        this.completeFunction = null;
        this.id = 'EmailDemandTests';
        this.start = '2017-03-27';
        this.expiry = '2017-04-21';
        this.author = 'Leigh-Anne Mathieson';
        this.description = 'Show an email sign up that simply tracks clicks and links to a google form for food, business, and cities articles.';
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'Number of clicks';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = 'People will demonstrate their interest in food, business and/or cities emails';

        var articleBody = '.js-article__body';

        var listConfigs = {
            food: {
                listName: 'food',
                displayName: {
                    normalText: 'food',
                    accentedText: 'weekly'
                },
                tone: 'feature',
                headline: "What's for dinner?",
                description: "Sign-up for our new weekly food email and you’ll get recipes, restaurant reviews and the best" +
                " of all things culinary. Whether you’re a full-on foodie or a budding gastronaut, we’ve something to sate your appetite",
                linkOnClick: "https://docs.google.com/forms/d/e/1FAIpQLSeGAacgwIRrUFxKPRSUG-imlqEwUKgVYFhOnJP4__avevZEHw/viewform?usp=sf_link",
                canRun: function () {
                    var tags = config.page.keywordIds.concat(config.page.nonKeywordTagIds);

                    return (tags.indexOf('lifeandstyle/food-and-drink') > -1) || (tags.indexOf('tone/recipes') > -1)
                }
            },
            cities: {
                listName: 'cities',
                displayName: {
                    normalText: 'cities'
                },
                tone: 'news',
                headline: "Want more stories from Guardian Cities?",
                description: "Sign up for our new email and get  in-depth journalism exploring cities and urban life all " +
                "over the world – from gentrification and climate change to cycling and urban history",
                linkOnClick: "https://docs.google.com/forms/d/e/1FAIpQLScUfA4BZ8RtDGJaM9NSVc7YxDRg_SB9-bLtdJG-Gml837cayQ/viewform?usp=sf_link",
                canRun: function () {
                    return config.page.section === 'cities';
                }
            },
            business: {
                listName: 'business',
                displayName: {
                    normalText: 'business',
                    accentedText: 'today'
                },
                tone: 'news',
                headline: "Business updates, direct to your inbox",
                description: "Sign up to our daily email for an at-a-glance guide to the biggest stories, smartest " +
                "analysis and hottest topics in the world of business and economics",
                linkOnClick: "https://docs.google.com/forms/d/e/1FAIpQLSclNwg8nkuwYrApRnnVkhGsdIIb85Uk0_DTEoCRiMDdgqIBFQ/viewform?usp=sf_link",
                canRun: function () {
                    return config.page.section === 'business';
                }
            }
        };

        this.canRun = function () {
            return whichTestToRun() !== null;
        };

        this.variants = [
            {
                id: 'show-demand-tests',
                test: insertEmailDemandSection,
                success: function (fn) {
                    completeFunction = fn;
                }
            }
        ];

        function whichTestToRun() {
            if (validArticleStructure()) {
                for (var key in listConfigs) {
                    if (listConfigs[key].canRun()) {
                        return listConfigs[key];
                    }
                }
            }
            return null;
        }

        function validArticleStructure() {
            var $articleBody = $(articleBody);
            if ($articleBody && $articleBody.length > 0) {
                var lastArticleElements = [].slice.call($articleBody[0].children, -minimumTrailingParagraphs);
                return lastArticleElements.length === minimumTrailingParagraphs && lastArticleElements.every(isParagraph);
            } else {
                return false;
            }
        }

        function isParagraph($el) {
            return $el.nodeName && $el.nodeName === 'P';
        }

        function insertEmailDemandSection() {
            var listConfig = whichTestToRun();

            if (listConfig) {
                var $demandTestSection = $.create(template(emailDemandTemplate, {
                    listName: listConfig.listName,
                    headline: listConfig.headline,
                    description: listConfig.description,
                    normalText: listConfig.displayName.normalText,
                    accentedText: listConfig.displayName.accentedText,
                    linkOnClick: listConfig.linkOnClick,
                    toneClass: "email-demand--tone-" + listConfig.tone
                }));

                fastdom.write(function () {
                    var elements = $(articleBody)[0].children;
                    $demandTestSection.insertAfter(elements[elements.length - minimumTrailingParagraphs]);
                    emailRunChecks.setEmailShown(listConfig.listName);
                    storage.session.set('email-sign-up-seen', 'true');

                    ophan.trackComponentAttention('email-demand-test-' + listConfig.listName, $demandTestSection[0]);

                    bean.on($('.js-email-demand__submit-button', $demandTestSection)[0], 'click', function () {
                        completeFunction && completeFunction();
                    });
                });
            }
        }

    }

});

