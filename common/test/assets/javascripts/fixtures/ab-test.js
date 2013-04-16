define([], function () {

    var ABTest = function () {

        this.id = 'DummyTest';
        this.audience = 1;
        this.description = 'Dummy test';
        this.canRun = function(config) {
            return true;
        };
        this.variants = [
            {
                id: 'control',
                split: 50,
                test: function () {
                    console.log('Control ran');
                }
            },
            {
                id: 'hide',
                split: 50,
                test: function () {
                    console.log('Hide ran');
                }
            }
        ];
    };

    return ABTest;
});
