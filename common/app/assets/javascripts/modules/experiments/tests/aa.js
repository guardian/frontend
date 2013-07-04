define(['common'], function (common) {

    // An AA test is like an AB test but with no difference between the A & B variants. It is useful to prove
    // that the bucketing of users is fair.
    var Aa = function () {

        this.id = 'AA';
        this.expiry = '2013-07-12';
        this.audience = 0.1;
        this.description = 'AA test to prove we bucket users evenly';
        this.canRun = function(config) {
            return true;
        };
        this.variants = [
            {
                id: 'control',
                test: function () {
                   return true;
                }
            },
            {
                id: 'bucketa',
                test: function () {
                    return true;
                }
            }
        ];
    };

    return Aa;

});
