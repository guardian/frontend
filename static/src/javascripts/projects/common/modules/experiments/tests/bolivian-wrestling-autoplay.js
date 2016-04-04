define([], function () {

    return function () {
        this.id = 'BolivianWrestlingAutoplay';
        this.start = '2016-03-23';
        this.expiry = '2016-03-31';
        this.author = 'James Gorrie';
        this.description = 'Autoplay embedded videos on Bolivian wrestling pages';
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = '';
        this.audienceCriteria = '';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return window.location.pathname === '/global-development/2016/mar/24/bolivia-cholitas-female-wrestlers-cholitas-discrimination-stranglehold';
        };

        this.variants = [{
            id: 'noautoplay',
            test: function () {}
        }, {
            id: 'autoplay',
            test: function () {}
        }];

    };

});
