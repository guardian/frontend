define([
       'qwery',
       'bonzo',
       'common/utils/config',
       'lodash/objects/assign',
       'common/modules/identity/api'
], function (
        qwery,
        bonzo,
        config,
        assign,
        id
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
        var url = config.page.idUrl + '/prefs/save-content?returnUrl='+encodedPageUrl;

        if ( id.isUserLoggedIn() ) {
            console.log("Save: User logged in");
            $saver.html(
                '<a href="' + url + ' "data-link-name="meta-save-for-later" data-component=meta-save-for-later">Save for later</a>'
            );
        }
        else {
            console.log("Save: User not logged in");
            var returnUrl = encodeURIComponent(url);
            var signInurl = config.page.idUrl + '/signin?returnUrl='+returnUrl;
            $saver.html(
                '<a href="' + signInurl + ' "data-link-name="meta-save-for-later" data-component=meta-save-for-later">Signin to save</a>'
            );
        }
    };

    return SaveForLater;
});
