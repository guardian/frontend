define(['common', 'modules/lightbox-gallery'], function (common, LightboxGallery) {

    var _config;

    var LightboxGalleries = function () {

        this.id = 'LightboxGalleries';
        this.expiry = '2013-08-12';
        this.audience = 1;
        this.description = 'Tests the lightbox gallery variants between no lightbox, lightbox and lightbox with swipe';
        this.canRun = function(config) {
            _config = config;
            return true;
        };
        this.variants = [
            {
                id: 'control',
                test: function () {
                   return true;
                }
            },
            {
                id: 'lightbox',
                test: function (context) {
                    var galleries = new LightboxGallery(_config, context);
                    galleries.init({
                        overrideSwitch: true,
                        disableSwipe: true
                    });
                }
            },
            {
                id: 'lightbox-swipe',
                test: function (context) {
                    var galleries = new LightboxGallery(_config, context);
                    galleries.init({
                        overrideSwitch: true
                    });
                }
            }

        ];
    };
    
    return LightboxGalleries;

});
