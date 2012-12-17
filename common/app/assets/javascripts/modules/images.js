define(['common', 'modules/detect'], function (common, detect) {

    function Images() {

        var view = {
            
            upgradeSvg: function() {
                common.$g('body').addClass('svg');
            },

            upgradeImages: function (root) {

                var doc = root || document,
                    images = doc.querySelectorAll('img[data-fullsrc]');

                for (var i = 0, j = images.length; i < j; ++i) {
                    
                    var image = images[i],
                        thumbWidth = parseFloat(image.getAttribute('data-thumb-width')),
                        fullWidth = parseFloat(image.getAttribute('data-full-width')),
                        fullsrc = image.getAttribute('data-fullsrc');
                    
                    if (fullWidth && (fullWidth >= thumbWidth)) {
                        
                        var forceUpgrade = image.getAttribute('data-force-upgrade');
                        
                        if(forceUpgrade || detect.getLayoutMode() === 'extended') {
                            image.src = fullsrc;
                            image.className += ' image-high';
                        }

                    }
                }
            }
        };
   
        // Model
        this.upgrade = function (root) {
            
            if (detect.getConnectionSpeed() !== 'low') {
                
                if (detect.hasSvgSupport()) {
                    view.upgradeSvg();
                }
                
                view.upgradeImages(root);
            
            }

        };
    }
    
    return Images;

});
