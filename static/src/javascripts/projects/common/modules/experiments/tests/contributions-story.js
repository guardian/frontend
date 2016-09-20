define([
    'bean',
    'qwery',
    'common/utils/$',
    'common/utils/template',
    'common/views/svg',
    'common/utils/fastdom-promise',
    'common/utils/mediator',
    'text!common/views/contributions-story.html',
    'text!common/views/contributions-epic.html',
    'common/utils/robust',
    'inlineSvg!svgs/icon/arrow-right',
    'common/utils/config',
    'common/modules/commercial/commercial-features',
    'common/utils/cookies',
    'common/utils/element-inview',
    'inlineSvg!svgs/illustration/contributions-finance',
    'inlineSvg!svgs/illustration/contributions-independent',
    'inlineSvg!svgs/illustration/contributions-quality'
], function (bean,
             qwery,
             $,
             template,
             svg,
             fastdom,
             mediator,
             contributionsStory,
             contributionsEpic,
             robust,
             arrowRight,
             config,
             commercialFeatures,
             cookies,
             ElementInview,
             iconFinance,
             iconIndependent,
             iconQuality
) {

    return function () {

        this.id = 'ContributionsStory20160922';
        this.start = '2016-09-22';
        this.expiry = '2016-10-03';
        this.author = 'Jonathan Rankin';
        this.description = 'Test whether telling the story of the guardian through staggered messages over time results in more contributions than always showing the epic message.';
        this.showForSensitive = false;
        this.audience = 0.08;
        this.audienceOffset = 0.48;
        this.successMeasure = 'Impressions to number of contributions';
        this.audienceCriteria = 'Non members viewing the UK edition';
        this.dataLinkNames = '';
        this.idealOutcome = 'Telling the story of the guardian through staggered messages over time result in an uplift of 30% in impressions to conversions';
        this.canRun = function () {
            var worksWellWithPageTemplate = (config.page.contentType === 'Article'); // may render badly on other types
            return commercialFeatures.canAskForAContribution && worksWellWithPageTemplate && !obWidgetIsShown();
        };

        var messages = [
            {
                title: 'Did you know...',
                body: '\<p class=\"contributions__paragraph contributions__paragraph--epic\">... the Guardian has the freedom to report on any story it wants?\</p>\
                        \<p class=\"contributions__paragraph contributions__paragraph--epic\">From Edward Snowden to the Panama Papers, everything we do is in pursuit of the truth. We believe that every issue should be reported without bias, whatever the cost to us. These days, though, those are expensive beliefs to hold.\</p>\
                        \<p class=\"contributions__paragraph contributions__paragraph--epic\">If you believe in our unbiased reporting, if you read us, if you like us, then please contribute to the Guardian.\</p>'
            },
            {
                title: 'Did you know...',
                body: '\<p class=\"contributions__paragraph contributions__paragraph--epic\">… the Guardian has won more than 50 journalism awards in 2016?\</p>\
                        \<p class=\"contributions__paragraph contributions__paragraph--epic\">Whether it’s Brexit or the Olympics, stories like this cost a lot to produce. We believe that money should never get in the way of informative, unbiased quality journalism. This is why we make our website available free of charge.\</p>\
                        \<p class=\"contributions__paragraph contributions__paragraph--epic\">We’ll always be here to cover them. If you read us, if you like us, then please contribute to the Guardian.\</p>'
            },
            {
                title: 'Did you know...',
                body: '\<p class=\"contributions__paragraph contributions__paragraph--epic\">… the Guardian is working in a difficult financial environment?\</p>\
                        \<p class=\"contributions__paragraph contributions__paragraph--epic\">Never before have more people read the Guardian. Unlike many others, you can read us online, for free. However, like many others, we’re selling fewer actual papers. Which means that never before have so few paid for the Guardian.\</p>\
                        \<p class=\"contributions__paragraph contributions__paragraph--epic\">Finding the truth is expensive. But supporting us isn’t. If you read us, if you like us, then please contribute to the Guardian.\</p>'
            }
        ];

        var icons = [iconIndependent, iconQuality, iconFinance];

        function obWidgetIsShown() {
            var $outbrain = $('.js-outbrain-container');
            return $outbrain && $outbrain.length > 0;
        }

        var writer = function (component) {
            return fastdom.write(function () {
                var a = $('.submeta');
                component.insertBefore(a);
                mediator.emit('contributions-embed:insert', component);
            });
        };

        var completer = function (complete) {
            mediator.on('contributions-embed:insert', function () {
                bean.on(qwery('.js-submit-input')[0], 'click', function (){
                    complete();
                });
            });
        };

        function getStoryComponent(message, storyVariant, image) {
            return $.create(template(contributionsStory, {
                position: 'bottom',
                title: message.title,
                body: message.body,
                linkUrl : 'https://contribute.theguardian.com?INTCMP=co_uk_story_' + storyVariant,
                storyVariant: storyVariant,
                image: image
            }));
        }

        function getControlComponent(iterationNumber) {
            return $.create(template(contributionsEpic, {
                id: 'today',
                linkUrl : 'https://contribute.theguardian.com?INTCMP=co_uk_story_control'+iterationNumber.toString(),
                linkName: 'Contribute',
                position: 'bottom',
                variant: 'no-buttons'
            }));
        }

        function getValue(name){
            return parseInt(cookies.get(name));
        }

        function setValue(name, value){
            cookies.add(name, value, 14);
        }

        function addInviewLIstener(proposedAdvance, currentTime, storyMessageIterationForDisplay, componentName) {
            mediator.on('contributions-embed:insert', function () {
                $('.contributions__contribute--epic').each(function (el) {

                    if (proposedAdvance) {
                        //top offset of 18 ensures view only counts when half of element is on screen
                        var elementInview = ElementInview(el, window, {top: 18});
                        elementInview.on('firstview', function () {
                            setValue('gu.storyTimeStamp', currentTime);
                            setValue('gu.storyMessageIterationCount', storyMessageIterationForDisplay);
                        });
                    }

                    require(['ophan/ng'], function (ophan) {
                        ophan.trackComponentAttention(componentName+storyMessageIterationForDisplay, el);
                    });
                });

            });
        }

        var currentTime = Math.floor(Date.now() / 1000);
        var messageDuration = 43200; //12 hours
        var initialStoryMessageIterationCount = getValue('gu.storyMessageIterationCount') || 0;
        var storyTimeStamp = getValue('gu.storyTimeStamp') || 0;
        var elapsedSoakTime = currentTime - storyTimeStamp;
        var proposedAdvance = elapsedSoakTime > messageDuration;
        var storyMessageIterationCount = proposedAdvance ? initialStoryMessageIterationCount + 1 : initialStoryMessageIterationCount;

            this.variants = [

            {
                id: 'control',
                test: function () {
                    var component = getControlComponent(storyMessageIterationCount);
                    addInviewLIstener(proposedAdvance, currentTime, storyMessageIterationCount, 'contributions-story-control');
                    writer(component);
                },
                success: completer
            },

            {
                id: 'story',
                test: function () {
                    addInviewLIstener(proposedAdvance, currentTime, storyMessageIterationCount, 'contributions-story');
                    writer(getStoryComponent(messages[storyMessageIterationCount%3], storyMessageIterationCount, icons[storyMessageIterationCount%3]));
                },
                success: completer
            }
        ];
    };
});
