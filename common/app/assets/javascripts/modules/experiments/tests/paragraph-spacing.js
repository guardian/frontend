define(['common'], function (common) {

    var ParagraphSpacing = function () {

        this.id = 'ParagraphSpacing';
        this.expiry = '2013-07-05';
        this.audience = 0.1;
        this.description = 'Impact of macro typography on readability';
        this.canRun = function(config) {
            return config.page.contentType === 'Article';
        };
        this.variants = [
            {
                id: 'control',
                test: function () {
                   return true;
                }
            },
            {
                id: 'no-spacing',
                test: function () {
                    common.$g('body').addClass('test-paragraph-spacing--no-spacing');
                }
            },
            {
                id: 'no-spacing-indents',
                test: function () {
                    common.$g('body').addClass('test-paragraph-spacing--no-spacing-indents');
                }
            },
            {
                id: 'more-spacing',
                test: function () {
                    common.$g('body').addClass('test-paragraph-spacing--more-spacing');
                }
            }
        ];
    };

    return ParagraphSpacing;

});
