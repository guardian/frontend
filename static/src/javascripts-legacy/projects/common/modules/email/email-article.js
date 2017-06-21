define(
    [
        'lib/$',
        'bean',
        'bonzo',
        'fastdom',
        'common/modules/email/email',
        'lib/config',
        'raw-loader!common/views/email/iframe.html',
        'lodash/utilities/template',
        'common/modules/article/space-filler',
        'lib/robust',
        'common/modules/email/run-checks',
        'lib/page',
        'lib/storage',
        'common/modules/analytics/google',
        'lodash/collections/find',
        'lib/mediator',
        'common/modules/check-mediator',
    ],
    function(
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
        mediator,
        checkMediator
    ) {
        var insertBottomOfArticle = function($iframeEl) {
            $iframeEl.prependTo('.content-footer');
        },
            listConfigs = {
                theFilmToday: {
                    listId: '1950',
                    listName: 'theFilmToday',
                    campaignCode: 'film_article_signup',
                    displayName: {
                        normalText: 'film',
                        accentedText: 'today',
                    },
                    headline: 'Film Today: now booking',
                    description:
                        'Sign up to the Guardian Film Today email and we’ll make sure you don’t miss a thing &ndash; the day’s insider news and our latest reviews, plus big name interviews and film festival coverage.',
                    successHeadline: 'Thank you for signing up to Film Today',
                    successDescription:
                        'You’ll receive an email every afternoon.',
                    insertMethod: insertBottomOfArticle,
                },
                theFiver: {
                    listId: '218',
                    listName: 'theFiver',
                    campaignCode: 'fiver_article_signup',
                    displayName: {
                        normalText: 'the',
                        accentedText: 'fiver',
                    },
                    headline:
                        'Kick off your evenings with our football roundup',
                    description:
                        'Sign up to the Fiver, our daily email on the world of football. We’ll deliver the day’s news and gossip in our own belligerent, sometimes intelligent and &ndash; very occasionally &ndash; funny way.',
                    successHeadline: 'Thank you for signing up',
                    successDescription:
                        'You’ll receive the Fiver daily, around 5pm.',
                    insertMethod: insertBottomOfArticle,
                },
                labNotes: {
                    listId: '3701',
                    listName: 'labNotes',
                    campaignCode: 'lab_notes_article_signup',
                    displayName: {
                        normalText: 'lab',
                        accentedText: 'notes',
                    },
                    headline: 'Science news you’ll want to read. Fact.',
                    description:
                        'Sign up to Lab Notes and we’ll email you the top stories in science, from medical breakthroughs to dinosaur discoveries &ndash; plus brainteasers, podcasts and more.',
                    successHeadline: 'Thank you for signing up for Lab notes',
                    successDescription: 'You’ll receive an email every week.',
                    insertMethod: insertBottomOfArticle,
                },
                euRef: {
                    listId: '3698',
                    listName: 'euRef',
                    campaignCode: 'eu_ref_article_signup',
                    displayName: {
                        normalText: 'brexit',
                        accentedText: 'briefing',
                    },
                    headline: 'Brexit: your weekly briefing',
                    description:
                        'Sign up and we’ll email you the key developments and most important debates as Britain takes its first steps on the long road to leaving the EU.',
                    successHeadline:
                        'Thank you for signing up for the Brexit weekly briefing',
                    successDescription:
                        'You’ll receive an email every morning.',
                    insertMethod: insertBottomOfArticle,
                },
                usBriefing: {
                    listId: '1493',
                    listName: 'usBriefing',
                    campaignCode: 'guardian_today_article_bottom',
                    displayName: {
                        normalText: 'us',
                        accentedText: 'briefing',
                    },
                    headline: 'Want stories like this in your inbox?',
                    description:
                        'Sign up to the Guardian US briefing to get the top stories in your inbox every weekday.',
                    successHeadline:
                        'Thank you for signing up to the Guardian US briefing',
                    successDescription:
                        'We will send you our pick of the most important stories.',
                    insertMethod: insertBottomOfArticle,
                },
                sleevenotes: {
                    listId: '39',
                    listName: 'sleevenotes',
                    campaignCode: 'sleevenotes_article_bottom',
                    displayName: {
                        normalText: 'sleeve',
                        accentedText: 'notes',
                    },
                    headline: 'Sleeve notes: sounds good',
                    description:
                        'Get music news, bold reviews and unexpected extras emailed direct to you from the Guardian’s music desk every Friday.',
                    successHeadline: 'Thank you for signing up to sleeve notes',
                    successDescription: 'You’ll receive an email every Friday.',
                    insertMethod: insertBottomOfArticle,
                },
                longReads: {
                    listId: '3322',
                    listName: 'longReads',
                    campaignCode: 'long_reads_article_bottom',
                    displayName: {
                        normalText: 'long',
                        accentedText: 'reads',
                    },
                    headline: 'Here’s the real story',
                    description:
                        'Look a little deeper with The Long Read. Sign up to our weekly email for inside stories, murder, politics, and much more. Great writing, worth reading.',
                    successHeadline:
                        'Thank you for signing up to The Long Read',
                    successDescription:
                        'You’ll receive an email every weekend.',
                    insertMethod: insertBottomOfArticle,
                },
                bookmarks: {
                    listId: '3039',
                    listName: 'bookmarks',
                    campaignCode: 'bookmarks_article_bottom',
                    displayName: {
                        normalText: 'book',
                        accentedText: 'marks',
                    },
                    headline: 'Bookmarks: read me first',
                    description:
                        'Sign up for our weekly email for book lovers and discover top 10s, expert book reviews, author interviews, and enjoy highlights from our columnists and community every weekend.',
                    successHeadline: 'Thank you for signing up to Bookmarks',
                    successDescription:
                        'You’ll receive an email every weekend.',
                    insertMethod: insertBottomOfArticle,
                },
                greenLight: {
                    listId: '38',
                    listName: 'greenLight',
                    campaignCode: 'green_light_article_bottom',
                    displayName: {
                        normalText: 'green',
                        accentedText: 'light',
                    },
                    headline: 'The most important stories on the planet',
                    description:
                        'Sign up to Green Light for environment news emailed direct to you every Friday. And besides the week’s biggest stories and debates, you can expect beautifully curated wildlife galleries, absorbing podcasts and eco-living guides.',
                    successHeadline: 'Thank you for signing up to Green Light',
                    successDescription: 'You’ll receive an email every Friday.',
                    insertMethod: insertBottomOfArticle,
                },
                theGuardianToday: {
                    listId: (function() {
                        switch (config.page.edition) {
                            default:
                                return '37';

                            case 'US':
                                return '1493';

                            case 'AU':
                                return '1506';
                        }
                    })(),
                    listName: 'theGuardianToday',
                    campaignCode: 'guardian_today_article_bottom',
                    displayName: {
                        normalText: 'theguardian',
                        accentedText: 'today',
                    },
                    headline: 'The headlines, the analysis, the debate',
                    description:
                        'Get the whole picture from a source you trust, emailed to you every morning. The biggest stories examined, and diverse, independent views &ndash; the Guardian Today delivers the best of our journalism.',
                    successHeadline:
                        'Thank you for signing up to the Guardian Today',
                    successDescription:
                        'We will send you our picks of the most important headlines tomorrow morning.',
                    insertMethod: insertBottomOfArticle,
                },
            },
            getSpacefinderRules = function() {
                return {
                    bodySelector: '.js-article__body',
                    slotSelector: ' > p',
                    minAbove: 200,
                    minBelow: 150,
                    clearContentMeta: 50,
                    fromBottom: true,
                    selectors: {
                        ' .element-rich-link': { minAbove: 100, minBelow: 100 },
                        ' > h2': { minAbove: 200, minBelow: 0 },
                        ' > *:not(p):not(h2):not(blockquote)': {
                            minAbove: 35,
                            minBelow: 200,
                        },
                        ' .ad-slot': { minAbove: 150, minBelow: 200 },
                    },
                };
            },
            addListToPage = function(listConfig, successEventName) {
                if (listConfig) {
                    listConfig.successEventName = successEventName || '';
                    var iframe = bonzo.create(
                        template(iframeTemplate, listConfig)
                    )[0],
                        $iframeEl = $(iframe),
                        onEmailAdded = function() {
                            emailRunChecks.setEmailShown(listConfig.listName);
                            storage.session.set('email-sign-up-seen', 'true');
                        };

                    bean.on(iframe, 'load', function() {
                        email.init(iframe);
                    });

                    if (listConfig.insertMethod) {
                        fastdom.write(function() {
                            listConfig.insertMethod($iframeEl);
                            googleAnalytics.trackNonClickInteraction(
                                'rtrt | email form inline | article | ' +
                                    listConfig.listId +
                                    ' | sign-up shown'
                            );
                            onEmailAdded();
                        });
                    } else {
                        spaceFiller.fillSpace(getSpacefinderRules(), function(
                            paras
                        ) {
                            $iframeEl.insertBefore(paras[0]);
                            googleAnalytics.trackNonClickInteraction(
                                'rtrt | email form inline | article | ' +
                                    listConfig.listId +
                                    ' | sign-up shown'
                            );
                            onEmailAdded();
                        });
                    }
                }
            };

        return {
            init: function() {
                checkMediator
                    .waitForCheck('emailCanRun')
                    .then(function(emailCanRun) {
                        if (emailCanRun) {
                            checkMediator
                                .waitForCheck('emailCanRunPostCheck')
                                .then(function(emailCanRunPostCheck) {
                                    if (emailCanRunPostCheck) {
                                        emailRunChecks
                                            .getUserEmailSubscriptions()
                                            .then(function() {
                                                addListToPage(
                                                    find(
                                                        listConfigs,
                                                        emailRunChecks.listCanRun
                                                    )
                                                );
                                            })
                                            .catch(function(error) {
                                                robust.logError(
                                                    'c-email',
                                                    error
                                                );
                                            });
                                    }
                                });
                        }
                    })
                    .catch(function(error) {
                        robust.logError('check-mediator', error);
                    });
            },
            getListConfigs: function() {
                return listConfigs;
            },
        };
    }
);
