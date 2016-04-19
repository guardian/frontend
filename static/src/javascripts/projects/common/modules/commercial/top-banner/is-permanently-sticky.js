define([
    'common/utils/config'
], function (config) {
    return [
        function isPersonalInvestments() {
            var endDate = new Date(2017, 3, 26);
            var now = new Date();
            return /(^|,)personal-investments(\/|$|,)/.test(config.page.keywordIds) && now < endDate;
        }
    ];
});
