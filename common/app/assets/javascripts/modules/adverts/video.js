define([
    "common",
    "bean",
    "utils/ajax"
], function(
   common,
   bean,
   ajax
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

        if(this.vastData.trackingEvents) { this.initTracking(this.vastData.trackingEvents); }
        if(this.vastData.impressionEvents) { this.initImpressions(this.vastData.impressionEvents); }

    };

    Video.prototype.initImpressions = function(impressions) {
        var self = this;

        impressions.forEach(function(el) {
            self.logEvent(new VideoEvent(el));
        });
    };

    Video.prototype.initTracking = function(tracking, impressions) {
        var self = this;

        for(var event in tracking) { this.events[event] = new VideoEvent(tracking[event]); }

        if(impressions && impressions.length) {
            impressions.forEach(function(el) {
                self.logEvent(new VideoEvent(el));
            });
        }

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
        var self = this, impressionList;

        this.vastData.file = this.getNodeContent(xml.querySelector("MediaFile"));
        if (this.vastData.file) {
            this.vastData.trackingEvents.clickThrough = this.getNodeContent(xml.querySelector("ClickThrough"));

            impressionList = (xml.querySelector("Impression URL")) ? xml.querySelectorAll("Impression URL") : xml.querySelectorAll("Impression");

            this.vastData.impressionEvents = common.toArray(impressionList).map(function(el) {
                return self.getNodeContent(el);
            });

            common.toArray(xml.querySelectorAll("Tracking")).forEach(function(el) {
                self.vastData.trackingEvents[el.getAttribute("event")] = self.trimText(el.textContent);
            });
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
            host = (window.location.hostname === "localhost") ? "m.code.dev-theguardian.com" :  window.location.hostname,
            url = "http://" + config.oasHost + "//2/" + host + "/" + id + "oas.html/" + (new Date().getTime()) + "@x50";

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
