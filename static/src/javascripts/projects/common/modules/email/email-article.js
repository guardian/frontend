define([
    'common/utils/$',
    'bean',
    'bonzo',
    'fastdom',
    'common/modules/email/email',
    'common/utils/config',
    'text!common/views/email/iframe.html',
    'common/utils/template',
    'common/modules/article/space-filler',
    'common/modules/analytics/omniture',
    'common/utils/robust',
    'common/modules/email/run-checks',
    'common/utils/page',
    'common/utils/storage',
    'lodash/collections/find'
], function (
    $,
    bean,
    bonzo,
    fastdom,
    email,
    config,
    iframeTemplate,
    template,
    spaceFiller,
    omniture,
    robust,
    emailRunChecks,
    page,
    storage,
    find
) {

    var insertBottomOfArticle = function ($iframeEl) {
            $iframeEl.appendTo('.js-article__body');
        },
        listConfigs = {
            theCampaignMinute: {
                listId: '3599',
                listName: 'theCampaignMinute',
                campaignCode: 'the_minute_footer',
                headline: 'Enjoying The Minute?',
                description: 'Sign up and we\'ll send you the Guardian US Campaign Minute, once per day.',
                successHeadline: 'Thank you for signing up to the Guardian US Campaign minute',
                successDescription: 'We will send you the biggest political story lines of the day',
                modClass: config.page.isMinuteArticle ? 'post-article' : 'end-article',
                insertMethod: function ($iframeEl) {
                    if (config.page.isMinuteArticle) {
                        $iframeEl.insertAfter('.js-article__container');
                    } else {
                        insertBottomOfArticle($iframeEl);
                    }
                }
            },
            theFilmToday: {
                listId: '1950',
                listName: 'theFilmToday',
                campaignCode: 'film_article_signup',
                headline: 'Want the best of Film, direct to your inbox?',
                description: 'Sign up to Film Today and we\'ll deliver to you the latest movie news, blogs, big name interviews, festival coverage, reviews and more.',
                successHeadline: 'Thank you for signing up to Film Today',
                successDescription: 'We will send you our picks of the most important headlines tomorrow afternoon.',
                modClass: 'end-article',
                insertMethod: insertBottomOfArticle
            },
            theFiver: {
                listId: '218',
                listName: 'theFiver',
                campaignCode: 'fiver_article_signup',
                headline: 'Want a football roundup direct to your inbox?',
                description: 'Sign up to the Fiver, our daily email on the world of football',
                successHeadline: 'Thank you for signing up',
                successDescription: 'You\'ll receive the Fiver daily, around 5pm.',
                modClass: 'end-article',
                insertMethod: insertBottomOfArticle
            },
            ausCampaignCatchup: {
                listId: '3689',
                listName: 'ausCampaignCatchup',
                campaignCode: 'AU_campaign_signup_page',
                headline: 'Sign up for the Campaign catchup',
                description: 'Get the day\'s top election news and commentary coverage delivered to your inbox every afternoon',
                successHeadline: 'Thank you for signing up',
                successDescription: 'We will send you the latest Campaign catchup every weekday afternoon',
                modClass: 'end-article',
                insertMethod: insertBottomOfArticle
            },
            usBriefing: {
                listId: '1493',
                listName: 'usBriefing',
                campaignCode: 'guardian_today_article_bottom',
                headline: 'Want stories like this in your inbox?',
                description: 'Sign up to the Guardian US briefing to get the top stories in your inbox every weekday.',
                successHeadline: 'Thank you for signing up to the Guardian US briefing',
                successDescription: 'We will send you our pick of the most important stories.',
                modClass: 'end-article',
                insertMethod: insertBottomOfArticle
            },
            theGuardianToday: {
                listId: (function () {
                    switch (config.page.edition) {
                        default:
                            return '37';

                        case 'AU':
                            return '1506';
                    }
                }()),
                listName: 'theGuardianToday',
                campaignCode: 'guardian_today_article_bottom',
                headline: 'Want stories like this in your inbox?',
                description: 'Sign up to The Guardian Today daily email and get the biggest headlines each morning.',
                successHeadline: 'Thank you for signing up to the Guardian Today',
                successDescription: 'We will send you our picks of the most important headlines tomorrow morning.',
                modClass: 'end-article',
                insertMethod: insertBottomOfArticle
            }
        },
        getSpacefinderRules = function () {
            return {
                bodySelector: '.js-article__body',
                slotSelector: ' > p',
                minAbove: 200,
                minBelow: 150,
                clearContentMeta: 50,
                fromBottom: true,
                selectors: {
                    ' .element-rich-link': {minAbove: 100, minBelow: 100},
                    ' > h2': {minAbove: 200, minBelow: 0},
                    ' > *:not(p):not(h2):not(blockquote)': {minAbove: 35, minBelow: 200},
                    ' .ad-slot': {minAbove: 150, minBelow: 200}
                }
            };
        },
        addListToPage = function (listConfig) {
            if (listConfig) {
                var iframe = bonzo.create(template(iframeTemplate, listConfig))[0],
                    $iframeEl = $(iframe);

                bean.on(iframe, 'load', function () {
                    email.init(iframe);
                });
                if (listConfig.insertMethod) {
                    fastdom.write(function () {
                        listConfig.insertMethod($iframeEl);

                        omniture.trackLinkImmediate('rtrt | email form inline | article | ' + listConfig.listId + ' | sign-up shown');
                        emailRunChecks.setEmailInserted();
                        emailRunChecks.setEmailShown(listConfig.listName);
                    });
                } else {
                    spaceFiller.fillSpace(getSpacefinderRules(), function (paras) {
                        $iframeEl.insertBefore(paras[0]);
                        omniture.trackLinkImmediate('rtrt | email form inline | article | ' + listConfig.listId + ' | sign-up shown');
                        emailRunChecks.setEmailInserted();
                        emailRunChecks.setEmailShown(listConfig.listName);
                    });
                }

                storage.session.set('email-sign-up-seen', 'true');
            }
        };

    return {
        init: function () {
            if (emailRunChecks.allEmailCanRun()) {
                // First we need to check the user's email subscriptions
                // so we don't insert the sign-up if they've already subscribed
                emailRunChecks.getUserEmailSubscriptions().then(function () {
                    // Get the first list that is allowed on this page
                    addListToPage(find(listConfigs, emailRunChecks.listCanRun));
                }).catch(function (error) {
                    robust.log('c-email', error);
                });
            }
        }
    };
});
