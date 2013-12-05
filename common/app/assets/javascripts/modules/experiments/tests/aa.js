define([], function () {

    // An AA test is like an AB test but with no difference between the A & B variants. It is useful to prove
    // that the bucketing of users is fair.
    var Aa = function () {

        this.id = 'Abcd';
        this.expiry = '2013-12-31';
        this.audience = 0.25;
        this.audienceOffset = 0;
        this.description = 'A/A test to prove we bucket users evenly';
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
                id: 'bucketA',
                test: function () {
                    return true;
                }
            },
            {
                id: 'bucketB',
                test: function () {
                    return true;
                }
            },
            {
                id: 'bucketC',
                test: function () {
                    return true;
                }
            },
            {
                id: 'bucketD',
                test: function () {
                    return true;
                }
            }
        ];
    };
    
    return Aa;

});
