define(['utils/config'], function(config) {

    function Beacon(path) {
        this.fire = function(){
            var img = new Image();
            img.src = config.page.beaconUrl + path;
        };
    }

    return Beacon;
});