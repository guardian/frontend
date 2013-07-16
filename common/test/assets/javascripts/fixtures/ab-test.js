define([], function () {

    var ABTest = function (id) {

        this.id = id;
        this.audience = 1;
        this.expiry = '2045-01-01';
        this.description = 'Dummy test';
        this.canRun = function(config) {
            return true;
        };
        this.variants = [
            {
                id: 'control',
                test: function () {
                    console.log('Control ran');
                }
            },
            {
                id: 'hide',
                test: function () {
                    console.log('Hide ran');
                }
            }
        ];
    };

    return ABTest;
});
