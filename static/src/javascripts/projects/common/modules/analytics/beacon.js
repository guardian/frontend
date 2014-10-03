define(['common/utils/config'], function(config) {

    return {
        fire: function(path){
            // There is currently no SSL version of the beacon
            if(!config.page.isSSL) {
                var img = new Image();
                img.src = config.page.beaconUrl + path;
            }
        }
    };
});