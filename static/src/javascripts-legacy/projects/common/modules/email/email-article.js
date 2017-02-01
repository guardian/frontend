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
    'common/utils/robust',
    'common/modules/email/run-checks',
    'common/utils/page',
    'common/utils/storage',
    'common/modules/analytics/google',
    'lodash/collections/find',
    'common/modules/experiments/ab',
    'common/utils/mediator'
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
    robust,
    emailRunChecks,
    page,
    storage,
    googleAnalytics,
    find,
    ab,
    mediator
) {
    var insertBottomOfArticle = function ($iframeEl) {
            $iframeEl.appendTo('.js-article__body');
        },
        isUSMinuteArticle = config.page.isMinuteArticle && config.page.keywordIds.indexOf('us-news/us-elections-2016') > -1,
        listConfigs = {
            theCampaignMinute: {
                listId: '3599',
                listName: 'theCampaignMinute',
                campaignCode: isUSMinuteArticle ? 'the_minute_footer' : 'the_minute_election_article',
                headline: isUSMinuteArticle ? 'Enjoying the minute?' : 'Want the latest election news?',
                description: 'Sign up and we\'ll send you the campaign minute every weekday.',
                successHeadline: 'Thank you for signing up to the Guardian US Campaign minute',
                successDescription: 'We will send you the biggest political story lines of the day',
                modClass: isUSMinuteArticle ? 'post-article' : 'end-article',
                insertMethod: function ($iframeEl) {
                    if (isUSMinuteArticle ) {
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
            labNotes: {
                listId: '3701',
                listName: 'labNotes',
                campaignCode: 'lab_notes_article_signup',
                headline: 'Sign up to Lab notes',
                description: 'Get a weekly round-up of the biggest stories in science, insider knowledge from our network of bloggers, and a healthy dose of fun.',
                successHeadline: 'Thank you for signing up for Lab notes',
                successDescription: 'You\'ll receive an email every week.',
                modClass: 'end-article',
                insertMethod: insertBottomOfArticle
            },
            euRef: {
                listId: '3698',
                listName: 'euRef',
                campaignCode: 'eu_ref_article_signup',
                headline: 'Brexit weekly briefing',
                description: 'Get a weekly rundown of the debates and developments as Britain starts out on the long road to leaving the European Union.',
                successHeadline: 'Thank you for signing up for the Brexit weekly briefing',
                successDescription: 'You\'ll receive an email every morning.',
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
                insertEventName: 'GuardianTodaySignupMessaging:insert',
                successEventName: 'GuardianTodaySignupMessaging:signup',
                trackingCode: 'GuardianTodaySignupMessaging-' + ab.getTestVariantId('GuardianTodaySignupMessaging'),
                headline: (function () {
                    switch (ab.getTestVariantId('GuardianTodaySignupMessaging')) {
                        case 'message-a': return 'Get a headstart on the day';
                        case 'message-b': return 'Cut through the noise';
                        case 'message-c': return 'The headlines, the analysis, the debate';
                        default: return 'Want stories like this in your inbox?';
                    }
                }()),
                description: (function () {
                    switch (ab.getTestVariantId('GuardianTodaySignupMessaging')) {
                        case 'message-a': return 'The top headlines, candid commentary and the best features to keep you up to speed and spark debate. The Guardian Today daily email will get you asking bigger questions and make sure you don’t miss a thing.';
                        case 'message-b': return 'Get straight to the heart of the day’s breaking news in double-quick time with the Guardian Today. We’ll email you the stories you need to read, and bundle them up with the best of sport, culture, lifestyle and more.';
                        case 'message-c': return 'Get the whole picture from a source you trust, emailed to you every morning. The biggest stories examined, and diverse, independent views - the Guardian Today delivers the best of our journalism.';
                        default: return 'Sign up to The Guardian Today daily email and get the biggest headlines each morning.';
                    }
                }()),
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

                if (listConfig.insertEventName) {
                    mediator.emit(listConfig.insertEventName);
                }

                if (listConfig.insertMethod) {
                    fastdom.write(function () {
                        listConfig.insertMethod($iframeEl);
                        if (listConfig.trackingCode) {
                            require(['ophan/ng'], function (ophan) {
                                ophan.trackComponentAttention(listConfig.trackingCode, $iframeEl[0]);
                            });
                        }
                        googleAnalytics.trackNonClickInteraction('rtrt | email form inline | article | ' + listConfig.listId + ' | sign-up shown');
                        emailRunChecks.setEmailInserted();
                        emailRunChecks.setEmailShown(listConfig.listName);
                    });
                } else {
                    spaceFiller.fillSpace(getSpacefinderRules(), function (paras) {
                        $iframeEl.insertBefore(paras[0]);
                        googleAnalytics.trackNonClickInteraction('rtrt | email form inline | article | ' + listConfig.listId + ' | sign-up shown');
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
