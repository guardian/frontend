define([
    'common/utils/config',
    'bean'
], function (
    config,
    bean
) {
    return function () {
        var module = this;

        this.id = 'NoSocialCount';
        this.start = '2016-08-25';
        this.expiry = '2016-09-07';
        this.author = 'Gareth Trufitt';
        this.description = 'Test whether the social share counts increase the number of shares an article has';
        this.audience = 0.5;
        this.audienceOffset = 0.5;
        this.successMeasure = 'The control group, that shows social shares, will have 2% more clicks on sharing buttons';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = 'Social share counts *do not* cause a significant increase in sharing, so we can remove them';

        this.canRun = function () {
            // We're on content and the page is commentable (so we don't have to fuss with the gap if it wasn't commentable)
            return config.page.isContent && config.page.commentable;
        };

        this.variants = [
            {
                id: 'control',
                test: function () {},
                success: userClickedSocialShare
            },
            {
                id: 'no-sharing',
                test: function () {},
                success: userClickedSocialShare
            }
        ];

        function userClickedSocialShare (complete) {
            var socialTopArr = document.querySelectorAll('.js-social--top');

            if (socialTopArr.length > 0 && module.canRun()) {
                bean.on(socialTopArr[0], 'click', document.getElementsByClassName('js-social__action--top'), complete);
            }
        }
    };
});
