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
    'common/utils/element-inview'
    ], function (
        bean,
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
        ElementInview
) {

    return function () {

        this.id = 'ContributionsStory';
        this.start = '2016-09-26';
        this.expiry = '2016-10-06';
        this.author = 'Jonathan Rankin';
        this.description = 'Test whether telling the story of the guardian through 3 staggered messages over time in a component at the end of an article results in more ' +
            'contributions than always showing the epic component at the end of an article (which was a long message of text over 3 paragraphs).';
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
                body: '\<p class=\"contributions__paragraph contributions__paragraph--epic\">... the Guardian is unique? Unlike other media, we have no billionaire owner and no hidden influences. Just open, honest journalism, free from commercial or political interference. We seek truth, not approval.\</p>\
                        \<p class=\"contributions__paragraph contributions__paragraph--epic\">If you do too, then please help to keep our independence, and our future, secure. You can give to the Guardian in less than a minute.\</p>',
                imageHref: 'https://uploads.guim.co.uk/2016/09/22/contributions-independent.png'
            },
            {
                title: 'Did you know...',
                body: '\<p class=\"contributions__paragraph contributions__paragraph--epic\">… the Guardian has won 70 awards so far this year? Our serious, fearless, public-interest journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters.\</p>\
                        \<p class=\"contributions__paragraph contributions__paragraph--epic\"> If you do too, then please help to keep our quality journalism, and our future, secure. You can give to the Guardian in less than a minute.\</p>',
                imageHref: 'https://uploads.guim.co.uk/2016/09/22/contributions-quality.png'
            },
            {
                title: 'Did you know...',
                body: '\<p class=\"contributions__paragraph contributions__paragraph--epic\">… the Guardian is working in a difficult commercial environment? More people are reading our journalism than ever, but far fewer are paying for it - and advertising revenues are falling fast. Producing the Guardian’s quality, independent journalism is expensive, but supporting us isn’t.\</p>\
                        \<p class=\"contributions__paragraph contributions__paragraph--epic\">Please help to keep our future secure. You can give to the Guardian in less than a minute.\</p>',
                imageHref: 'https://uploads.guim.co.uk/2016/09/22/contributions-finance.png'
            }
        ];


        function obWidgetIsShown() {
            var $outbrain = $('.js-outbrain-container');
            return $outbrain && $outbrain.length > 0;
        }

        var writer = function (component) {
            return fastdom.write(function () {
                var submetaElement = $('.submeta');
                component.insertBefore(submetaElement);
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

        function getStoryComponent(message, storyVariant) {
            return $.create(template(contributionsStory, {
                position: 'bottom',
                title: message.title,
                body: message.body,
                linkUrl : 'https://contribute.theguardian.com?INTCMP=co_uk_story_' + storyVariant,
                storyVariant: storyVariant,
                imageHref: message.imageHref
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
                    writer(getStoryComponent(messages[(storyMessageIterationCount-1)%3], storyMessageIterationCount));
                },
                success: completer
            }
        ];
    };
});
