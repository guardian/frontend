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
