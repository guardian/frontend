define([
    'common/utils/config'
], function (config) {
    return [
        function isPersonalInvestments() {
            var startDate = new Date(2016, 3, 26);
            var endDate = new Date(2017, 3, 26);
            var now = new Date();
            return /(^|,)personal-investments(\/|$|,)/.test(config.page.keywordIds) &&
                startDate <= now &&
                now < endDate;
        }
    ];
})
