define([
    'common/utils/$',
    'common/utils/template',
    'text!common/views/giraffe-message.html',
    'common/views/svgs'
], function ($,template,giraffeMessage, svgs) {
    return function () {

        this.id = 'Giraffe';
        this.start = '2016-06-13';
        this.expiry = '2016-08-13';
        this.author = 'Alex Ware';
        this.description = 'Add a button allowing readers to contribute money.';
        this.showForSensitive = false;
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = '';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = '';
        this.canRun = function () {
             return window.guardian.config.page.edition == 'UK';
        };

        var defaultRules = { // these are written for adverts
            bodySelector: '.js-article__body',
            slotSelector: ' > p',
            absoluteMinAbove: 0, // minimum from slot to top of page
            minAbove: 250, // minimum from para to top of article
            minBelow: 0, // minimum from (top of) para to bottom of article
            clearContentMeta: 50, // vertical px to clear the content meta element (byline etc) by. 0 to ignore
            selectors: { // custom rules using selectors. format:
                //'.selector': {
                //   minAbove: <min px above para to bottom of els matching selector>,
                //   minBelow: <min px below (top of) para to top of els matching selector> }
                ' > h2': {minAbove: 0, minBelow: 250}, // hug h2s
                ' > *:not(p):not(h2)': {minAbove: 25, minBelow: 250} // require spacing for all other elements
            },

            // filter:(slot:Element, index:Integer, slots:Collection<Element>) -> Boolean
            // will run each slot through this fn to check if it must be counted in
            filter: null,

            // startAt:Element
            // will remove slots before this one
            startAt: null,

            // stopAt:Element
            // will remove slots from this one on
            stopAt: null,

            // fromBotton:Boolean
            // will reverse the order of slots (this is useful for lazy loaded content)
            fromBottom: false
        };

        var writer = function (a) {
            var $newThing = $.create(template(giraffeMessage, {
                linkText: 'Can\'t live without us? The feeling\'s mutual',
                linkName: 'idk',
                linkHref: 'http://gu.com',
                copy: 'Please support the Guardian and independent journalism',
                svg: svgs('arrowWhiteRight', ['button--giraffe__icon'])
            }));
            $newThing.insertBefore(a[0]);
        };

        this.variants = [
            {
                id: 'control',
                test: function () {

                }
            },
            {
                id: 'someMessage',
                test: function () {
                    var submeta = $('.submeta');
                    writer(submeta);
                }
            }
        ];
    };
});
