define(['common', 'modules/lightbox-gallery'], function (common, LightboxGallery) {

    var GalleryStyle = function () {

        var _config;

        this.id = 'GalleryStyle';
        this.expiry = '2013-08-21';
        this.audience = 1;
        this.description = 'Tests the new gallery style contact sheet CTA instead of the current style';
        this.canRun = function(config) {
            _config = config;
            return config.page.contentType === 'Gallery';
        };
        this.variants = [
            {
                id: 'control',
                test: function (context) {
                   return true;
                }
            },
            {
                id: 'new-style',
                test: function (context) {
                    context.querySelector('.gallerytest--var-a').style.display = 'none';
                    context.querySelector('.gallerytest--var-b').style.display = 'block';

                    var galleries = new LightboxGallery(_config, context);
                    galleries.init({
                        overrideSwitch: true
                    });
                }
            }
        ];
    };
    
    return GalleryStyle;

});
