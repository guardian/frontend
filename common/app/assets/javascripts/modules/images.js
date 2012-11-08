define(['common', 'modules/detect'], function (common, detect) {

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

                //upgrade other images
                var images = document.querySelectorAll('img[data-fullsrc]'); // Leave old browsers.
                for (var i = 0, j = images.length; i < j; ++i) {
                    var image = images[i];
                    var thumbWidth = parseFloat(image.getAttribute('data-thumb-width'));
                    var fullWidth = parseFloat(image.getAttribute('data-full-width'));
                    var fullsrc = image.getAttribute('data-fullsrc');
                    var forceUpgrade = image.getAttribute('data-force-upgrade');
                    if (fullWidth && fullWidth >= thumbWidth && fullsrc) {
                        if(forceUpgrade || layoutMode === 'extended') {
                            image.src = fullsrc;
                            image.className += ' image-high';
                        }
                    }
                }
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
