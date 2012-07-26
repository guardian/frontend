define([guardian.js.modules.gu, guardian.js.modules.player, guardian.js.modules.detectOs], function(gu, Player, detect) {

    var Video = function(opts) {
    
        // mappings between Guardian published formats and actual media type 
        this.mediaTypes = {
            'video/3gpp:large'  : 'video/3gpp', // Android fast connection
            'video/3gpp:small'  : 'video/3gpp', // Android slow
            'video/m3u8'        : '',           // HLS
            'video/mp4:720'     : 'video/mp4',  // Plain h264/mp4 @ ~4100bps (for tv)
            'video/mp4'         : 'video/mp4'   // Plain h264/mp4 @ ~1000kbps 
        };

        // LATER a video source should always fallback to mp4  
        var encoding = this.getPlayableEncodings(opts.encodings);

        // 
        if (!encoding) {
            gu.events.emit('video:unsupported'); // no encodings found that match your device
            return false;
        }

        //
        this.player = new Player(encoding);
    }


    // 
    Video.prototype = {

        // map operating system to encodings. LATER append bandwidth & browser sniff here
        getEncodingForThisOS: function() {
            
            switch (detect.getOperatingSystem()) {
                case 'ios':
                    var os = 'video/m3u8';
                    break;
                case 'android':
                    var os = 'video/3gpp:small';
                    break;
                default:
                     var os = 'video/mp4'; // fallback
            }
            return os;
        },

        getPlayableEncodings: function(encodings) {

            var os = this.getEncodingForThisOS();

            var matching = encodings.filter(function(encoding){
                return (encoding.format == os);    
                }).map(function(encoding){
                    return {
                        'type': this.mediaTypes[encoding.format],
                        'source': encoding.url
                    }
                }, this);
        
            return (matching.length >= 0) ? matching[0] : false;

        },

        embed: function(callback){
            var that = this;
            gu.events.emit('video:embed', [function(){
                that.setEmitters();
                callback();
            }]);
        },

        play: function(){
            gu.events.emit('video:play');
        },
        
        // externalise all the events by turning in to event emitters
        setEmitters: function(){

            var events =  'abort canplay canplaythrough canshowcurrentframe dataunavailable durationchange ' + 
                          'emptied empty ended error loadeddata loadedmetadata loadstart mozaudioavailable ' + 
                          'pause play playing progress ratechange seeked seeking suspend timeupdate volumechange';

            events.split(/\s+/).forEach(function(e){
                var p = this.player.player; // shit naming, possibly hold players in array
                p.addEventListener(e, function(log){
                    console.log(log.type, [p.currentTime]);
                    gu.events.emit('video:' + log.type, [p.currentTime]);
                    })
                }, this);
        }

    };

    return Video;

});

