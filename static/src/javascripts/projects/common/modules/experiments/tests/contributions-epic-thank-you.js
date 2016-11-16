define([
    'bean',
    'qwery',
    'common/utils/$',
    'common/utils/template',
    'common/views/svg',
    'common/utils/fastdom-promise',
    'common/utils/mediator',
    'text!common/views/contributions-epic-thank-you.html',
    'common/utils/robust',
    'inlineSvg!svgs/icon/arrow-right',
    'common/utils/config',
    'common/utils/cookies',
    'common/modules/commercial/user-features',
    'common/utils/element-inview'

], function (bean,
             qwery,
             $,
             template,
             svg,
             fastdom,
             mediator,
             contributionsEpicThankYou,
             robust,
             arrowRight,
             config,
            cookies,
            userFeatures, 
             ElementInview) {

    return function () {
        var isContributor = cookies.get('gu.contributions.contrib-timestamp');
        var isPayingMember = userFeatures.isPayingMember();

        this.id = 'ContributionsEpicThankYou';
        this.start = '2016-11-09';
        this.expiry = '2016-11-22';
        this.author = 'Jonathan Rankin';
        this.description = 'Send out a thank you to our existing members/contributors, with a social share';
        this.showForSensitive = false;
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'Number of social shares';
        this.audienceCriteria = 'All contributors/members';
        this.dataLinkNames = '';
        this.idealOutcome = 'We learn to what extend our paying readers are willing to share the fact on social media';
        this.canRun = function () {
            var worksWellWithPageTemplate = (config.page.contentType === 'Article') && !config.page.isMinuteArticle; // may render badly on other types
            return worksWellWithPageTemplate && (isContributor || isPayingMember);
        };

        var completer = function (complete) {
            mediator.on('contributions-embed:insert', complete);
        };

        var componentWriter = function (component) {
            fastdom.write(function () {
                var submetaElement = $('.submeta');

                if (submetaElement.length > 0) {
                    component.insertBefore(submetaElement);
                    mediator.emit('contributions-embed:insert', component);
                }
            });
        };


        function getValue(name){
            return parseInt(cookies.get(name));
        }

        function setValue(name, value){
            cookies.add(name, value, 18);
        }


        function addInviewListener(thankYouCounter) {
            mediator.on('contributions-embed:insert', function () {
                $('.contributions__epic').each(function (el) {
                        //top offset of 18 ensures view only counts when half of element is on screen
                        var elementInview = ElementInview(el, window, {top: 18});
                        elementInview.on('firstview', function () {
                            setValue('gu.thankyouCount', thankYouCounter + 1);
                        });

                });

            });
        }

        var thankyouCount = getValue('gu.thankyouCount') || 0;

        var messages  =  {
            title: 'Thank you',
            p1: 'Your crucial financial support makes our journalism possible. We do it because we believe, like you, that the world has never needed fearless, independent media more.',
        };

        this.variants = [
            {
                id: 'control',

                test: function () {
                    addInviewListener(thankyouCount);
                    if(thankyouCount < 4) {
                        var component = $.create(template(contributionsEpicThankYou, {
                            title: messages.title,
                            p1: messages.p1,
                            p2: messages.p2
                        }));
                        componentWriter(component);
                    }
                },

                impression: function(track) {
                    mediator.on('contributions-embed:insert', track);
                },

                success: completer
            }
        ];
    };
});
