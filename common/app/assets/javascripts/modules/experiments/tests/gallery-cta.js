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
        this.expiry = '2013-09-19';
        this.audience = 1;
        this.description = 'Tests two different styles "Launch Gallery" CTA';
        this.canRun = function(config) {
            _config = config;

            var participationsStore = Storage.get('gu.ab.participations'),
                isGalleryStyleTestRunning = participationsStore &&
                                            participationsStore.GalleryStyle &&
                                            participationsStore.GalleryStyle.variant !== "control";

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
                    var href = context.querySelector('.article .gallerythumbs a').href,
                        html = '<a class="gallery-launch-cta" data-link-name="Launch Gallery CTA" href="' + href + '">' +
                                    label +
                               '    <i class="i i-double-arrow-right-blue"></i>' +
                               '</a>';

                    bonzo(context.querySelector('.article .gallerythumbs')).append(html);
                }
            },
            {
                id: 'dark-cta',
                test: function (context) {
                    var href = context.querySelector('.article .gallerythumbs a').href,
                        html = '<a class="gallery-launch-cta gallery-launch-cta--dark" data-link-name="Launch Gallery CTA" href="' + href + '">' +
                                   label +
                               '    <i class="i i-double-arrow-right-white"></i>' +
                               '</a>';

                    bonzo(context.querySelector('.article .gallerythumbs')).append(html);
                }
            }
        ];
    };
    
    return GalleryCta;

});
