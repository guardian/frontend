define([
  'common/$',
  'qwery'
], function(
    $,
    qwery
) {

    var OnwardPackages = function() {
        this.id = 'OnwardsAboveDiscussion';
        this.start = '2014-04-10';
        this.end = '2014-04-17';
        this.description = 'Moves onwards components above discussion';
        this.audience = 0.75;
        this.audienceOffset = 0.2;

        this.canRun = function(config) {
            return config.page.contentType === 'Article';
        };

        this.variants = [
            {
                id: 'control',
                test: function() {}
            },
            {
                id: 'shift-comments-down-a',
                test: function() {
                    $('.js-comments').insertAfter(qwery('.js-popular'));
                }
            },
            {
                id: 'shift-comments-down-b',
                test: function() {
                    $('.js-comments').insertAfter(qwery('.js-popular'));
                }
            }
        ];
    };

    return OnwardPackages;
});