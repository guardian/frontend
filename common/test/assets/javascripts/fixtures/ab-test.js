define([], function () {

    var ABTest = function (id) {

        this.id = id;
        this.audience = 1;
        this.expiry = '2045-01-01';
        this.description = 'Dummy test';
        this.canRun = function(config) {
            return true;
        };
        this.events = ['most popular | The Guardian | trail ', 'most popular | Section | trail ']
        this.variants = [
            {
                id: 'control',
                test: function (context) {
                    console.log('Control ran', context);
                }
            },
            {
                id: 'hide',
                test: function (context) {
                    console.log('Hide ran', context);
                }
            }
        ];
    };

    return ABTest;
});
