define(['common', 'modules/detect'], function (common, detect) {

    function Images() {
    
        var connectionSpeed = detect.getConnectionSpeed();

        //http://stackoverflow.com/questions/5539354/svg-for-images-in-browsers-with-png-fallback
        var supportsSVG = window.SVGAngle ||
            document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1");

        // View

        this.view = {
            upgrade: function() {

                //upgrade svg images
                if (supportsSVG) {
                    var svgImages = document.querySelectorAll('img[data-svgsrc]');
                    for (var x = 0; x < svgImages.length; ++x) {
                        svgImages[x].src = svgImages[x].getAttribute('data-svgsrc');
                    }
                }

                //upgrade other images
                var images = document.querySelectorAll('img[data-fullsrc]'); // Leave old browsers.
                for (var i = 0, j = images.length; i<j; ++i) {
                    var image = images[i];
                    var width = image.getAttribute('data-width');
                    var fullsrc = image.getAttribute('data-fullsrc');
                    if (width && width <= image.offsetWidth && fullsrc ) {
                        image.src = fullsrc;
                        image.className += ' image-high';
                    }
                }
            }
        }

        // Bindings
        
        common.mediator.on('modules:images:upgrade', this.view.upgrade);
   
        // Model
        
        this.upgrade = function() {
            if (connectionSpeed !== 'low') {
                common.mediator.emit('modules:images:upgrade');
            }
        }
    }
    
    return Images;

});
