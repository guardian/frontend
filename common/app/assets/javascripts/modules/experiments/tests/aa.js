define(['common'], function (common) {

    var AATest = function () {

        this.id = 'AA-test';
        this.expiry = '2013-07-12';
        this.audience = 0.3;
        this.description = 'This is an AA test to prove the test framework segments the users fairly';
        this.canRun = function(config) {
            return config.page.contentType === 'Article';
        };
        this.variants = [
            {
                id: 'control',
                test: function () {
                   return true;
                }
            },
            {
                id: 'aa',
                test: function () {
                    return true;
                }
            }
        ];
    };

    return AATest;

});
