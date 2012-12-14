define(['common', 'modules/detect', 'bonzo'], function (common, detect, bonzo) {

    function Images() {
    
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
                common.$g('img').each(function(image, index) {
                    image = bonzo(image);
                    if (!image.attr('data-fullsrc')) {
                        return;
                    }
                    var thumbWidth = parseFloat(image.attr('data-thumb-width'));
                    var fullWidth = parseFloat(image.attr('data-full-width'));
                    var fullsrc = image.attr('data-fullsrc');
                    var forceUpgrade = image.attr('data-force-upgrade');
                    if (fullWidth && fullWidth >= thumbWidth && fullsrc) {
                        if(forceUpgrade || layoutMode === 'extended') {
                            image.attr('src', fullsrc);
                            image.addClass('image-high');
                        }
                    }
                });
            }
        };

        // Bindings
        
        common.mediator.on('modules:images:upgrade', this.view.upgrade);
   
        // Model
        
        this.upgrade = function () {
            if (connectionSpeed !== 'low') {
                common.mediator.emit('modules:images:upgrade');
            }
        };
    }
    
    return Images;

});
