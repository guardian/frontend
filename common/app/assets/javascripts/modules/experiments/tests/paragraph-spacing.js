define(['common'], function (common) {

    var ParagraphSpacing = function () {
        
        this.id = 'ParagraphSpacing';
        this.audience = 0.1;
        this.description = 'Impact of macro typography on readability';
        this.canRun = function(config) {
            // only run on article pages (and if switch is on)
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
                    common.$g('#article').addClass('test-paragraph-spacing--no-spacing');
                }
            },
            {
                id: 'no-spacing-indents',
                test: function () {
                    common.$g('#article').addClass('test-paragraph-spacing--no-spacing-indents');
                }
            },
            {
                id: 'more-spacing',
                test: function () {
                    common.$g('#article').addClass('test-paragraph-spacing--more-spacing');
                }
            }
        ];
    };

    return ParagraphSpacing;

});
