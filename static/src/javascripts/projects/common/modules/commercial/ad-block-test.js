define([
    'lodash/functions/once',
    'common/utils/$',
    'common/utils/$css',
    'common/modules/analytics/beacon'
], function (
    once,
    $,
    $css,
    beacon
) {

    return once(function () {
        // class matches one in https://easylist-downloads.adblockplus.org/easylist.txt
        var blocked = false,
            $adBlockTest = $.create('<div class="ad_unit"></div>').appendTo(document.body);
        if ($css($adBlockTest, 'display') === 'none') {
            blocked = true;
            beacon.counts('ads-blocked');
        }
        $adBlockTest.remove();

        return blocked;
    });

});
