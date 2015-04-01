define([
       'qwery',
       'bonzo',
       'common/utils/config'
], function (
        qwery,
        bonzo,
        config
    ){

    function SaveForLater() {
        console.log("++ Create save to later");
        this.saveLinkHolder = document.body.querySelector('.meta__save-for-later');
        console.log("++ Save created");
    }

    SaveForLater.prototype.init = function() {
        console.log("++ Save init");
        var $saver = bonzo(this.saveLinkHolder)
        var encodedPageUrl = encodeURIComponent(document.location.href);

        var url = config.page.idUrl + '/prefs/save-content?returnUrl='+encodedPageUrl+'&shortUrl='+config.page.shortUrl;

        $saver.html(
            '<a href="' + url + ' "data-link-name="meta-save-for-later" data-component=meta-save-for-later">Save for later</a>'
        );
    };

    return SaveForLater;
});
