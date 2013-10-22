define(['bonzo'], function (bonzo) {

    var UltimateParagraphSpacing = function () {

        var _config;

        this.id = 'UltimateParagraphSpacing';
        this.expiry = '2013-10-31';
        this.audience = 1;
        this.description = 'Tests the impact of paragraph spacing versus indents on user engagement';
        this.canRun = function(config) {
            return config.page.contentType === 'Article';
        };
        this.variants = [
            {
                id: 'control',
                test: function() {
                   return true;
                }
            },
            {
                id: 'indents',
                test: function() {
                    bonzo(document.body).addClass('ab-paragraph-spacing--indents');
                }
            }
        ];
    };

    return UltimateParagraphSpacing;

});
