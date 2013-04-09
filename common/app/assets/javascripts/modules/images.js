define(['common', 'modules/detect', 'bonzo'], function (common, detect, bonzo) {

    function Images(context) {
    
        var connectionSpeed = detect.getConnectionSpeed(),
            layoutMode = detect.getLayoutMode();

        // View

        this.view = {
            upgrade: function () {

                // upgrade svg images
                if (detect.hasSvgSupport()) {
                    common.$g('body').addClass('svg');
                }

                //upgrade other images;
                [].forEach.call(context.querySelectorAll('img'), function(image) {
                    image = bonzo(image);
                    if (!image.attr('data-fullsrc')) {
                        return;
                    }
                    var thumbWidth = parseFloat(image.attr('data-thumb-width'));
                    var fullWidth = parseFloat(image.attr('data-full-width'));
                    var fullsrc = image.attr('data-fullsrc');
                    var forceUpgrade = image.attr('data-force-upgrade');

                    if (fullWidth && fullWidth >= thumbWidth && fullsrc) {
                        if(forceUpgrade || layoutMode === 'desktop') {
                            image.attr('src', fullsrc);
                            image.addClass('image-high');
                        }
                    }
                });
            }
        };

        // Model
        
        this.upgrade = function () {
            if (connectionSpeed !== 'low') {
                this.view.upgrade();
            }
        };
    }
    
    return Images;

});
