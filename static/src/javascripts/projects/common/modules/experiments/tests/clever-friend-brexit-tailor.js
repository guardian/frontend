define([

], function() {
    function noop() {}

    function companionInteractives() {
        return document.querySelectorAll('figure[data-canonical-url^="https://interactive.guim.co.uk/2016/05/brexit-companion/"]');
    }

    return function () {
        this.id = 'CleverFriendBrexitTailor';
        this.start = '2016-06-01';
        this.expiry = '2016-07-31';
        this.author = 'Roberto Tyley';
        this.description = 'Tailor explainers (beginner/advanced/intermediate) for half the audience';
        this.audience = 1;
        this.audienceOffset = 0.0;
        this.successMeasure = 'Level of interaction with the explainer';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = 'Tailored explainers will show greater levels of user engagement and positive response (survey links)';

        this.canRun = function () {
            var companions = companionInteractives();
            for (var i = 0; i < companions.length; i++) {
                var url = companions[i].getAttribute('data-canonical-url');
                if (url.indexOf('tailored=true') >= 0) return true;
            }
            return false;
        };

        this.variants = [{
            id: 'remove-tailoring',
            test: function() {
                var companions = companionInteractives();
                for (var i = 0; i < companions.length; i++) {
                    var c = companions[i];
                    var url = c.getAttribute('data-canonical-url');
                    c.setAttribute('data-canonical-url', url.replace('tailored=true','tailored=false'));
                }
            }
        },
        {
            id: 'keep-tailoring',
            test: noop
        }];
    };
});
