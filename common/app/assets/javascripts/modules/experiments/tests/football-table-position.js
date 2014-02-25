define(['common/$'], function ($) {

var FootballTablePosition = function () {

    this.id = 'FootballTablePosition';
    this.expiry = '2014-03-07';
    this.audience = 0.3;
    this.audienceOffset = 0.1;
    this.description = 'Varies the football tables\'s position and functionality';
    this.canRun = function(config) {
        return config.page &&
               config.page.contentType === 'Article' &&
               config.page.section === 'football' &&
               $('.js-football-competition').length > 0;
    };

    this.variants = [
        {
            id: 'control',
            test: function (context) {
                return true;
            }
        },
        {
            id: 'pre-image',
            test: function (context) {
                var table = $('.js-football-table');
            }
        },
        {
            id: 'post-image',
            test: function (context) {
                var table = $('.js-football-table');
            }
        },
        {

            id: 'middle-article',
            test: function (context) {
                var table = $('.js-football-table');
            }
        },
        {
            id: 'post-article',
            test: function (context) {
                var table = $('.js-football-table');
            }
        }
    ];
};

return FootballTablePosition;

}); // define