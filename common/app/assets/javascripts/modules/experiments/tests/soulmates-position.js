define([
    'common/utils/$'
], function (
    $
) {
    return function() {

        this.id = 'SoulmatesPosition';
        this.start = '2014-08-08';
        this.expiry = '2014-08-22';
        this.author = 'Darren Hurley';
        this.description = 'Move the soulmates link in the "all sections" menu to the top';
        this.audience = 0.2;
        this.audienceOffset = 0.2;
        this.successMeasure = 'CTR';
        this.audienceCriteria = 'Everyone';
        this.dataLinkNames = 'Soulmates';
        this.idealOutcome = 'Higher CTR';

        this.canRun = function () {
            return true;
        };

        this.variants = [
            {
                id: 'control',
                test: function () { }
            },
            {
                id: 'move-from-the-guardian',
                test: function () {
                    var $fromTheGuardian = $('.global-navigation__section--from-the-guardian');
                    $fromTheGuardian
                        .parent()
                        .prepend($fromTheGuardian.detach());
                }
            }
        ];
    };
});
