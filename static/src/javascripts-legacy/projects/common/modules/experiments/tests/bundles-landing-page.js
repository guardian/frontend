define([
    'bean',
    'qwery',
    'lib/config',
    'lib/detect',
    'commercial/modules/user-features'

], function (
    bean,
    qwery,
    config,
    detect,
    userFeatures
) {
    return function () {
        this.id = 'BundlesLandingPage';
        this.start = '2017-03-24';
        this.expiry = '2017-04-06'; // Thursday 6th April
        this.author = 'Justin Pinner';
        this.description = 'Route 10% of epic traffic to recurring contributions-enabled bundle page';
        this.showForSensitive = true;
        this.audience = 0.1;  // 10% (of epic-seeing readers)
        this.audienceOffset = 0;
        this.successMeasure = 'Two thousand conversions of any kind';
        this.audienceCriteria = 'Epic click-throughs';
        this.dataLinkNames = '';
        this.idealOutcome = 'We score some recurring contributions and don\'t miss out on others';
        this.hypothesis = 'People want recurring contributions, and the landing page serves all options';

        this.canRun = function () {
            return !userFeatures.isPayingMember();
        };

        this.completeFunc = function(complete) {
            // fire on Epic's [Become... ->] or [Make... ->] button click
            bean.on(qwery('.contributions__option-button')[0], 'click', complete);
            bean.on(qwery('.contributions__option-button')[1], 'click', complete);
        };

        this.variants = [
            {
                id: 'intest',
                test: function(){},
                success: this.completeFunc
            }
        ];
    };
});
