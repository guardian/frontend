define([
    'bean',
    'qwery',
    'common/utils/$',
    'common/utils/template',
    'common/views/svg',
    'common/utils/fastdom-promise',
    'common/utils/mediator',
    'common/utils/config',
    'text!common/views/experiments/remind-me-email-signup.html',
    'inlineSvg!svgs/icon/envelope',
    'lodash/objects/defaults'
], function (bean,
             qwery,
             $,
             template,
             svg,
             fastdom,
             mediator,
             config,
             remindMeEmailSignup,
             envelope,
             defaults
) {
    return function () {

        this.id = 'RemindMeEmail';
        this.start = '2016-07-18';
        this.expiry = '2016-08-10';
        this.author = 'Joseph Smith';
        this.description = 'Add a signup for a reminder email at the bottom of series articles';
        this.showForSensitive = false;
        this.audience = 0;
        this.audienceOffset = 0;
        this.successMeasure = 'Greatest clickthrough rate';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = '';
        this.canRun = function () {
            return (isBlindDate() && blindDateIsPublished()) || (isExperience() && experienceIsPublished());
        };

        var copy = {
            oneOff: {
                comingUp: {
                    blindDate: {
                        subtitle: 'Coming up in next week&rsquo;s Blind Date',
                        title: '<b>&lsquo;She didn’t judge me for talking about giraffes&rsquo; necks&rsquo;</b>',
                        description: 'Did digital communications consultant Lucy, 23, click with waitress Charlie, 20?',
                        cta: 'Remind me',
                        trackingCode: 'one-off_coming-up_blind-date'
                    },
                    experience: {
                        subtitle: 'Coming up in next week&rsquo;s Experience',
                        title: '<b>I was stranded in the wilderness for nine days</b>',
                        description: '&lsquo;I had lost so much weight that I looked like walking skeleton. I was ready to give up&rsquo;',
                        cta: 'Remind me',
                        trackingCode: 'one-off_coming-up_experience'
                    }
                },
                seriesDescription: {
                    blindDate: {
                        subtitle: null,
                        title: 'What is <b>Blind Date?</b>',
                        description: 'Every Saturday we fix up two Guardian readers',
                        cta: 'Remind me next Saturday',
                        trackingCode: 'one-off_series-description_blind-date'
                    },
                    experience: {
                        subtitle: null,
                        title: 'What is <b>Experience?</b>',
                        description: 'Every Saturday a Guardian reader shares their unique story',
                        cta: 'Remind me next Saturday',
                        trackingCode: 'one-off_series-description_experience'
                    }
                }
            },
            weekly: {
                comingUp: {
                    blindDate: {
                        subtitle: 'Coming up in next week&rsquo;s Blind Date',
                        title: '<b>&lsquo;She didn’t judge me for talking about giraffes&rsquo; necks&rsquo;</b>',
                        description: 'Did digital communications consultant Lucy, 23, click with waitress Charlie, 20?',
                        cta: 'Get a weekly reminder',
                        trackingCode: 'weekly_coming-up_blind-date'
                    },
                    experience: {
                        subtitle: 'Coming up in next week&rsquo;s Experience',
                        title: '<b>I was stranded in the wilderness for nine days</b>',
                        description: '&lsquo;I had lost so much weight that I looked like walking skeleton. I was ready to give up&rsquo;',
                        cta: 'Get a weekly reminder',
                        trackingCode: 'weekly_coming-up_experience'
                    }
                },
                seriesDescription: {
                    blindDate: {
                        subtitle: null,
                        title: 'What is <b>Blind Date?</b>',
                        description: 'Every Saturday we fix up two Guardian readers',
                        cta: 'Get a weekly reminder',
                        trackingCode: 'weekly_series-description_blind-date'
                    },
                    experience: {
                        subtitle: null,
                        title: 'What is <b>Experience?</b>',
                        description: 'Every Saturday a Guardian reader shares their unique story',
                        cta: 'Get a weekly reminder',
                        trackingCode: 'weekly_series-description_experience'
                    }
                }
            }
        };

        function isBlindDate() {
            return config.page.series === 'Blind date';
        }

        function blindDateIsPublished() {
            var isPublishDateInThePast = Date.parse('2016-08-06 06:00:00') < Date.now();
            var isViewingTheLatestArticle = config.page.pageId === 'lifeandstyle/2016/aug/06/blind-date-rosie-rodney';
            return isPublishDateInThePast || isViewingTheLatestArticle;
        }

        function isExperience() {
            return config.page.series === 'Experience';
        }

        function experienceIsPublished() {
            var isPublishDateInThePast = Date.parse('2016-08-05 14:00:00') < Date.now();
            var isViewingTheLatestArticle = config.page.pageId === 'lifeandstyle/2016/aug/05/playing-pokemon-go-crashed-car-experience';
            return isPublishDateInThePast || isViewingTheLatestArticle;
        }

        function insertSignupBox(templateData) {
            var params = defaults({
                svg: svg(envelope, ['submit-input__icon'])
            }, templateData);

            var $signupBox = $.create(template(remindMeEmailSignup, params));

            return fastdom.write(function () {
                var tags = $('.submeta');
                $signupBox.insertBefore(tags);
                require(['ophan/ng'], function (ophan) {
                    ophan.trackComponentAttention(params.trackingCode, $signupBox[0]);
                });
                mediator.emit('remind-me-email:insert');
            });
        }


        function getTemplateData(data) {
            return config.page.series === 'Blind date' ? data.blindDate : data.experience;
        }


        function completer(complete) {
            mediator.on('remind-me-email:insert', function () {
                bean.on(qwery('.js-remind-me-signup')[0], 'click', function (){
                    var html404 =
                        '<p class="remind-me__cta">' +
                            'Yessss! Another click! Thanks for your interest in this feature, we’re testing demand. ' +
                            'If enough of you like the idea, we’ll make it happen. Fingers crossed!' +
                        '</p>';

                    $(this).replaceWith(html404);
                    complete();
                });
            });
        }

        this.variants = [
            {
                id: 'one-off-coming-up',
                test: function () {
                    insertSignupBox(getTemplateData(copy.oneOff.comingUp));
                },
                success: function (complete) {
                    completer(complete);
                }
            },
            {
                id: 'one-off-series-description',
                test: function () {
                    insertSignupBox(getTemplateData(copy.oneOff.seriesDescription));
                },
                success: function (complete) {
                    completer(complete);
                }
            },
            {
                id: 'weekly-coming-up',
                test: function () {
                    insertSignupBox(getTemplateData(copy.weekly.comingUp));
                },
                success: function (complete) {
                    completer(complete);
                }
            },
            {
                id: 'weekly-series-description',
                test: function () {
                    insertSignupBox(getTemplateData(copy.weekly.seriesDescription));
                },
                success: function (complete) {
                    completer(complete);
                }
            }
        ];
    };
});
