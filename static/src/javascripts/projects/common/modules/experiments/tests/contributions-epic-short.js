define([
    'bean',
    'qwery',
    'common/utils/$',
    'common/utils/template',
    'common/utils/fastdom-promise',
    'common/utils/mediator',
    'text!common/views/contributions-epic-short.html',
    'common/utils/config',
    'common/modules/commercial/commercial-features',
    'common/modules/experiments/embed'
], function(
    bean,
    qwery,
    $,
    template,
    fastdom,
    mediator,
    contributionsEpicShort,
    config,
    commercialFeatures,
    embed
)   {

    return function() {

        this.id = 'ContributionsEpicShort';
        this.start = '2016-09-30';
        this.expiry = '2016-10-10';
        this.author = 'Guy Dawson';
        this.description = 'Test whether epics design or copy lead to its success.';
        this.audience = 0.04;

        // Equal to the upper bound of the ContributionsStory segment.
        // It's important the segments for these tests don't intersect,
        // as the data generated from them will be compared.
        this.audienceOffset = 0.54;

        this.successMeasure = 'Click-through';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = 'We are able to determine whether the success of the epic is due to the copy or design.';

        this.canRun = function() {
            var worksWellWithPageTemplate = (config.page.contentType === 'Article'); // may render badly on other types
            return commercialFeatures.canAskForAContribution && worksWellWithPageTemplate && !obWidgetIsShown();
        };

        function obWidgetIsShown() {
            var $outbrain = $('.js-outbrain-container');
            return $outbrain && $outbrain.length > 0;
        }

        var bottomWriter = function (component) {
            return fastdom.write(function () {
                var a = $('.submeta');
                component.insertBefore(a);
                embed.init();
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

        this.variants = [
            {
                id: 'epic-short',
                test: function() {
                    var component = $.create(template(contributionsEpicShort, {
                        linkUrl: 'https://contribute.theguardian.com?INTCMP=co_uk_epic_short'
                    }));

                    bottomWriter(component);
                },
                success: completer
            }
        ];
    };
});
