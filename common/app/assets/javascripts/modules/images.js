define(['common', 'modules/detect'], function (common, detect) {

    function Images() {
    
        var connectionSpeed = detect.getConnectionSpeed();

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
                    var width = image.getAttribute('data-width');
                    var fullsrc = image.getAttribute('data-fullsrc');
                    if (width && width <= image.offsetWidth && fullsrc) {
                        image.src = fullsrc;
                        image.className += ' image-high';
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
