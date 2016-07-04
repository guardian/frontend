define([
    'common/utils/$',
    'common/utils/template',
    'text!common/views/giraffe-message.html',
    'common/views/svgs'
], function ($,template,giraffeMessage, svgs) {
    return function () {

        this.id = 'Giraffe';
        this.start = '2016-07-03';
        this.expiry = '2016-08-13';
        this.author = 'Alex Ware';
        this.description = 'Add a button allowing readers to contribute money.';
        this.showForSensitive = false;
        this.audience = 0.5;
        this.audienceOffset = 0;
        this.successMeasure = 'Determine the best message for driving contributions.';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = '';
        this.canRun = function () {
             return window.guardian.config.page.edition == 'UK';
        };

        var writer = function (linkText, linkHref, copy) {
            var $newThing = $.create(template(giraffeMessage, {
                linkText:linkText,
                linkName: 'idk',
                linkHref: linkHref,
                copy: copy,
                svg: svgs('arrowWhiteRight', ['button--giraffe__icon'])
            }));
            var a = $('.submeta');
            $newThing.insertBefore(a[0]);
        };

        this.variants = [
            {
                id: 'everyone',
                test: function () {
                    writer('If everyone were to chip in, the Guardian\'s future would be more secure.', 'https://membership.theguardian.com/contribute?INTCMP=article-1-everyone', 'Please support the Guardian and independent journalism');
                }
            },
            {
                id: 'coffee',
                test: function () {
                    writer('Do you want the news with your coffee? Or do you just want coffee? Quality journalism costs. Please contribute', 'https://membership.theguardian.com/contribute?INTCMP=article-1-coffee', 'Please support the Guardian and independent journalism');
                }
            },
            {
                id: 'heritage',
                test: function () {
                    writer('From the Peterloo massacre to the Panama Papers, we\'ve been on your side for almost 200 years. Contribute to the Guardian\'s future today', 'https://membership.theguardian.com/contribute?INTCMP=article-1-heritage', 'Please support the Guardian and independent journalism');                }
            },
            {
                id: 'global',
                test: function () {
                    writer('By the time you\'ve had your morning tea, reporters in Rio, Beijing, Dakar and Paris, have already filed their stories. Covering the world\'s news isn\'t cheap. Please chip in a few pounds', 'https://membership.theguardian.com/contribute?INTCMP=article-1-global', 'Please support the Guardian and independent journalism');
                }
            }
        ];
    };
});
