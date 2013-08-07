define(['common'], function (common) {

    var GalleryStyle = function () {

        this.id = 'GalleryStyle';
        this.expiry = '2013-08-20';
        this.audience = 1;
        this.description = 'Tests the new gallery style contact sheet CTA instead of the current style';
        this.canRun = function(config) {
            return config.page.contentType === 'Gallery';
        };
        this.variants = [
            {
                id: 'control',
                test: function (context) {
                   context.querySelector('.gallery--var-b').style.display = 'none';
                   return true;
                }
            },
            {
                id: 'new-style',
                test: function (context) {
                    context.querySelector('.gallery--var-a').style.display = 'none';
                }
            }
        ];
    };
    
    return GalleryStyle;

});
