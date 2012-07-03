define([guardian.js.modules.gu, guardian.js.modules.bonzo, guardian.js.modules.qwery], function(gu, bonzo, qwery){

    var Player = function(opts){

        opts.video = opts.video || {};

        console.log(opts);

        this.player = null;
        this.src = opts.source || null;
        this.type = opts.type;

        var that = this;
       
        gu.events.addListener('video:embed', function(callback) {
            that.embed();
            callback()
        });

        gu.events.addListener('video:play', function() {
            that.play();
        });

    };

    Player.prototype = {

        canPlayType: function(type) {
            var v = document.createElement('video');
            return (v.canPlayType && (v.canPlayType(type) !== '')); // @return probably, maybe, '' 
        },
    
        supportsFullscreenApi: function() {
            return (!document.mozFullScreen && !document.webkitFullScreen);
        },

        play: function() {
            this.player.play();
        },

        embed: function() {
            
            this.player = document.createElement('video');

            if (this.type && !this.canPlayType(this.type)) {
                gu.events.emit('video:unsupportedType');
                return false;
            }; 

            // <source src="..."/> 
            var source = document.createElement('source')
            source.setAttribute('src', this.src)
            source.setAttribute('type', this.type)
            this.player.appendChild(source);

            document.getElementById('player').appendChild(this.player);
            
            }

    };

    return Player;

});

