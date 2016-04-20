define(['membership/membership-tab', 'membership/digitalpack-tab'], function (membershipTab, digitalpackTab) {
    return {
        init: function () {
            membershipTab.init();
            digitalpackTab.init();
        }
    };
});
