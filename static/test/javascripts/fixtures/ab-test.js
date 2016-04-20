define([], function () {

    var ABTest = function (id) {

        this.id = id;
        this.audience = 1;
        this.audienceOffset = 0;
        this.expiry = '2045-01-01';
        this.description = 'Dummy test';
        this.canRun = function () {
            return true;
        };
        this.events = ['most popular | The Guardian | trail ', 'most popular | Section | trail '];
        this.variants = [
            {
                id: 'control',
                test: function () {
                }
            },
            {
                id: 'hide',
                test: function () {
                }
            }
        ];
    };

    return ABTest;
});
