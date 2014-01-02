define(['common/$'], function ($) {

    var ExperimentUnderlineLinks = function () {

        this.id = 'UnderlineLinks';
        this.expiry = "2014-01-17";
        this.audience = 0.1;
        this.audienceOffset = 0.6;
        this.description = 'Underlines links to make them more obvious, and clickable';
        this.canRun = function(config) {
            return (
               config.page.contentType === 'Article' 
            );
        };
        this.variants = [
            {
                id: 'control',
                test: function (context) {
                    return true;
                }
            },
            {
                id: 'underlined',
                test: function (context) {
                    $('.article__main-column p a').addClass('u-underline');
                }
            }
        ];
    };

    return ExperimentUnderlineLinks; 

});
