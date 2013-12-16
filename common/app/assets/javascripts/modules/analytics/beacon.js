define([], function() {

    function Beacon(path) {
        this.fire = function(config){
            var img = new Image();
            img.src = config.page.beaconUrl + path;
        };
    }

    return Beacon;
});