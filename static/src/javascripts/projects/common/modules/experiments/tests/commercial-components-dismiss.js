define([
    'common/modules/commercial/survey/survey-simple'
], function (
    SurveySimple
) {
    return function () {

        this.id = 'CommercialComponentsDismiss';
        this.start = '2016-02-28';
        this.expiry = '2016-04-05';
        this.author = 'Steve Vadocz';
        this.description = 'Survey to test if users will be interested in paying for the Guardian with no commercial components';
        this.audience = 0.02;
        this.audienceOffset = 0.8;
        this.successMeasure = 'Users will be interested in paying for the Guardian without commercial components';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = 'adfree trash read more, hide ads hide adslot: {slot size}, survey overlay take part, survey overlay hide survey message, adfree survey page take part in survey, adfree survey page read more about the guardian app, adfree survey page read more about the guardian members, adfree survey page register email, adfree trash simple read more, hide ads simple hide adslot: {slot size}, survey overlay simple take part, survey overlay simple hide survey message, adfree survey simple page take part in survey, adfree survey simple page read more about the guardian app, adfree survey simple page register email';
        this.idealOutcome = 'Users will be interested in paying a lot for the Guardian without commercial components';

        this.canRun = function () {
            return true;
        };

        this.variants = [
            {
                id: 'simple',
                test: function () {
                    //attach hidden survey overlay, it will be triggered by a 'Dimiss' label
                    new SurveySimple().attach();
                }
            },
            {
                id: 'control',
                test: function () {}
            }
        ];
    };
});
