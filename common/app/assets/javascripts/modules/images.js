define(['common', 'modules/detect', 'bonzo'], function (common, detect, bonzo) {

    function Images(options) {
    
        var opts = options || {},
            connectionSpeed = detect.getConnectionSpeed(opts.connection),
            layoutMode = detect.getLayoutMode(opts.viewportWidth),
            self = this;

        // View

        this.view = {
            upgrade: function (context) {

                // upgrade svg images
                if (detect.hasSvgSupport()) {
                    common.$g('body').addClass('svg');
                }

                //upgrade other images;
                Array.prototype.forEach.call(context.getElementsByTagName('img'), function(image) {
                    image = bonzo(image);

                    var thumbWidth = parseFloat(image.attr('data-thumb-width'));
                    var fullWidth = parseFloat(image.attr('data-full-width'));
                    var lowsrc = image.attr('data-lowsrc');
                    var fullsrc = image.attr('data-fullsrc');
                    var forceUpgrade = image.attr('data-force-upgrade');

                    if (fullWidth && fullWidth >= thumbWidth && fullsrc) {
                        if (forceUpgrade || layoutMode === 'desktop' || layoutMode === 'extended') {
                            image.attr('src', fullsrc);
                            image.addClass('image-high');
                            return;
                        }
                    }
                    if (lowsrc) {
                        image.attr('src', lowsrc);
                    }
                });
            }
        };

        // Model
        
        this.upgrade = function (context) {
            if (connectionSpeed !== 'low') {
                self.view.upgrade(context);
                common.mediator.emit('modules:images:upgrade');
            }
        };
    }
    
    return Images;

});
