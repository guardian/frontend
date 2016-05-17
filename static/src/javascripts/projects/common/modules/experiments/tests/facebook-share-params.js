define([
    'common/utils/config'
], function (
    config
) {
    return function () {
        this.id = 'FacebookShareParams';
        this.start = '2016-06-06';
        this.expiry = '2016-06-13';
        this.author = 'Kate Whalen';
        this.description = 'Change the URL sent to the facebook crawler to manipulate FB caching';
        this.audience = 0;
        this.audienceOffset = 0;
        this.successMeasure = 'We want to see how image branding affects Facebook shares and click-through';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = 'Open Graph';
        this.idealOutcome = 'Increase in guardian traffic from facebook cards with image overlays';

        this.canRun = function () {
            if (!config.page.isFront) {
                // && server side test open-graph-overlay is running
                return true;
            }
            return false;
        };

        function alterCanonicalUrlSent(hrefContent, additionalParam) {
            var urlhalves = hrefContent.split('&redirect_uri=');
            return urlhalves[0] + additionalParam + '&redirect_uri=' + urlhalves[1];
        }

        function alterFacebookShareItems(additionalParam) {
            var facebookShareItem = document.getElementsByClassName('social__item--facebook');
            for (var i = 0; i < facebookShareItem.length; i++) {
                var redirectUrl = facebookShareItem[i].getElementsByClassName('social__action');
                redirectUrl[0].href = alterCanonicalUrlSent(redirectUrl[0].href, additionalParam);
            }

        }

        this.variants = [
            {
                id: 'variant',
                test: function () {
                    alterFacebookShareItems('?page=facebookOverlayTest');
                }
            },
            {
                id: 'control',
                test: function () {
                }
            }
        ];
    };
});
