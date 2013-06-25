define([
    "common",
    "bean",
    "ajax",
    "bonzo"
], function(
   common,
   bean,
   ajax,
   bonzo
) {

    function Video(config) {
        this.config = config.config;
        this.context = config.context;
        this.support = config.support;
        this.video = config.el;
        this.played = false;
        this.timer = false;
        this.events = {};
        this.vastData = {trackingEvents: {}};
    }

    function VideoEvent(url) {
        this.url = url;
        this.hasFired = false;
    }

    Video.prototype.play = function(format) {
        var self = this,
            sources = this.video.querySelectorAll('source'),
            source;

        this.played = true;

        //Horrible UA detection for iOS
        if(format === "mp4") {
            if(window.navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) {
                format = "m3u8";
            }
        }

        for(var i = 0, l = sources.length; i < l; i++) {
            if(sources[i].src.search("."+format) > -1) {
                source = sources[i].src;
                break;
            }
        }

        bean.on(this.video, "ended error", function() {
            //Init omniture tracking
            common.mediator.emit("video:ads:finished", self.config, self.context);

            bean.off(self.video, "ended error");
            bean.off(self.video, "click.ct touchstart.ct");

            bean.fire(self.video, "play:content");
            self.video.src = source;
            self.video.play();

            common.$g(self.video).removeClass("has-cursor");

            if(self.events.complete && !self.events.complete.hasFired) {
                self.logEvent(self.events.complete);
                clearInterval(self.timer);
            }
        });

        // Prevent different size ads from making the video jump around
        this.video.style.height = this.video.offsetHeight+'px';

        bean.fire(this.video, "play:advert");
        this.video.src = this.vastData.file;
        this.video.play();

        if(this.vastData.trackingEvents) {
            this.initTracking(this.vastData.trackingEvents);
        }
    };

    Video.prototype.initTracking = function(tracking) {
        var self = this;

        for(var event in tracking) {
           this.events[event] = new VideoEvent(tracking[event]);
        }

        if(this.events.impression) { this.logEvent(this.events.impression); }
        if(this.events.oasImpression) { this.logEvent(this.events.oasImpression); }
        if(this.events.start) { this.logEvent(this.events.start); }
        if(this.events.clickThrough) {
            common.$g(this.video).addClass("has-cursor");
            bean.one(self.video, "click.ct touchstart.ct", function(){
                if(self.events.oasClickThrough) { self.logEvent(self.events.oasClickThrough); }
                window.open(self.events.clickThrough.url);
            });
        }

       this.timer = setInterval(function() {
           var progress = self.getProgress(),
               duration = self.getDuration();

           if(progress > (duration/2) && self.events.midpoint && !self.events.midpoint.hasFired) {
               self.logEvent(self.events.midpoint);
           }
       }, 1000);
    };

    Video.prototype.getProgress = function() {
        return this.video.currentTime;
    };

    Video.prototype.getDuration = function() {
        return this.video.duration;
    };

    Video.prototype.logEvent = function(event) {
        var px = new Image();
        px.src = event.url; px.width = 0; px.height = 0;
        document.body.appendChild(px);
        event.hasFired = true;
    };

    Video.prototype.trimText = function(text) {
        return text.replace(/^\s+|\s+$/g,'');
    };

    Video.prototype.getNodeContent = function(node) {
        if (node && node.textContent) {
            return this.trimText(node.textContent);
        }
    };

    Video.prototype.parseVast = function(xml) {

        this.vastData.file = this.getNodeContent(xml.querySelector("MediaFile"));
        if (this.vastData.file) {
            this.vastData.trackingEvents.impression = this.getNodeContent(xml.querySelector("Impression"));
            this.vastData.trackingEvents.clickThrough = this.getNodeContent(xml.querySelector("ClickThrough"));

            var trackingNodes = xml.querySelectorAll("Tracking");
            for (var i = 0, j = trackingNodes.length; i<j; ++i) {
                var ev = trackingNodes[i].getAttribute("event");
                this.vastData.trackingEvents[ev] = this.trimText(trackingNodes[i].textContent);
            }
        }

    };

    Video.prototype.parseVideoAdServingTemplate = function(xml) {
        this.vastData.trackingEvents.oasImpression = this.getNodeContent(xml.querySelector("Impression URL"));
        this.vastData.trackingEvents.oasClickThrough = this.getNodeContent(xml.querySelector("ClickTracking URL"));
        return this.getNodeContent(xml.querySelector("VASTAdTagURL URL"));
    };

    Video.prototype.getVastData = function(url) {

        var self = this;

        this.video.advertWasRequested = true;

        ajax({
            url: url,
            method: "get",
            type: "xml",
            crossOrigin: true,
            success: function(response) {
                if(response && response.documentElement) {
                    var thirdParty = response.documentElement.querySelector("VASTAdTagURL");
                    if(thirdParty) {
                        var nextUrl = self.parseVideoAdServingTemplate(response.documentElement);
                        self.getVastData(nextUrl);
                    } else {
                        self.parseVast(response.documentElement);
                    }
                }
            }
        });
    };

    Video.prototype.init = function(config) {
        var id = (config.pageId === '') ? '' : config.pageId + '/',
            host = (window.location.hostname === "localhost") ? "m.gucode.co.uk" :  window.location.hostname,
            url = "http://oas.guardian.co.uk//2/" + host + "/" + id + "oas.html/" + (new Date().getTime()) + "@x40";

        this.getVastData(url);

        var format = false,
            self = this;

        for (var f in this.support) {
            if(this.support.hasOwnProperty(f)) {
                if(this.support[f] === "probably") {
                    format = f;
                    break;
                }
            }
        }

        //We are only supporting mp4 adverts first
        if(format === "mp4") {
            bean.on(self.video, "play", function() {
                if(!self.played) {
                    self.play(format);
                }
            });
        } else {
            common.mediator.emit("video:ads:finished", self.config, self.context);
        }
    };

    return Video;

});
