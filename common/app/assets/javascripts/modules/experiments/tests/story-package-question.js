/*global guardian */
define([

], function (

    ) {

    var Question = function () {

        this.id = 'StoryPackageQuestion';
        this.expiry = '2013-11-30';
        this.audience = 0.1;
        this.description = 'Test effectiveness of question based trails in storypackages';
        this.canRun = function(config) {
            return config.page.contentType === 'Article';
        };
        this.variants = [
            {
                id: 'Read',
                test: function(context, isBoth) {

                }
            },
            {
                id: 'Question',
                test: function(context, isBoth) {

                    return true;
                }
            },
            {
                id: 'Popular',
                test: function() {


                    return true;
                }
            },
            {
                id: 'control',
                test: function() {


                    return true;
                }
            }
        ];
    };

    return Question;

});
