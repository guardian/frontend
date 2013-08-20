define(['common',
        'bonzo',
        'modules/detect',
        'modules/storage'],
function (common,
          bonzo,
          detect,
          Storage) {

    var GalleryCta = function () {

        var _config;
        var label = (detect.hasTouchScreen() ? 'Tap' : 'Click') + ' here to launch gallery';

        this.id = 'GalleryCta';
        this.expiry = '2013-09-02';
        this.audience = 1;
        this.description = 'Tests two different styles "Launch Gallery" CTA';
        this.canRun = function(config) {
            _config = config;

            var isGalleryStyleTestRunning = Storage.get('gu.ab.participations').GalleryStyle.variant != "control";
            return isGalleryStyleTestRunning && config.page.contentType === 'Gallery';
        };
        this.variants = [
            {
                id: 'control',
                test: function (context) {
                   return true;
                }
            },
            {
                id: 'light-cta',
                test: function (context) {
                    var html = '<button class="gallery-launch-cta">' +
                                    label +
                               '    <i class="i i-double-arrow-right-blue"></i>' +
                               '</button>';

                    bonzo(context.querySelector('.article__inner .gallerythumbs')).append(html);
                }
            },
            {
                id: 'dark-cta',
                test: function (context) {
                    var html = '<button class="gallery-launch-cta gallery-launch-cta--dark">' +
                                   label +
                               '    <i class="i i-double-arrow-right-white"></i>' +
                               '</button>';

                    bonzo(context.querySelector('.article__inner .gallerythumbs')).append(html);
                }
            }
        ];
    };
    
    return GalleryCta;

});
