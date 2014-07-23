(function(vjs) {
"use strict";  
  var
  extend = function(obj) {
    var arg, i, k;
    for (i = 1; i < arguments.length; i++) {
      arg = arguments[i];
      for (k in arg) {
        if (arg.hasOwnProperty(k)) {
          obj[k] = arg[k];
        }
      }
    }
    return obj;
  },

  defaults = {
    count: 10,
    counter: "counter",
    countdown: "countdown",
    countdown_text: "Next video in:",
    endcard: "player-endcard",
    related: "related-content",
    next: "next-video",
    getRelatedContent: function(callback){callback();},
    getNextVid: function(callback){callback();}
  },

  endcard = function(options) {
    var player = this;
    var el = this.el();
    var settings = extend({}, defaults, options || {});

    // set background
    var card = document.createElement('div');
    card.id = settings.endcard;
    card.style.display = 'none';

    el.appendChild(card);

    settings.getRelatedContent(function(content) {
      if (content instanceof Array) {
        var related_content_div = document.createElement('div');
        related_content_div.id = settings.related;

        for (var i = 0; i < content.length; i++) {
          related_content_div.appendChild(content[i]);
        }

        card.appendChild(related_content_div);
      }
      else {
        throw new TypeError("options.getRelatedContent must return an array");
      }
    });

    settings.getNextVid(function(next) {
      if (typeof next !== "undefined") {
        var next_div = document.createElement('div');
        var counter = document.createElement('span');
        var countdown = document.createElement('div');
        counter.id = settings.counter;
        countdown.id = settings.countdown;
        next_div.id = settings.next;

        countdown.innerHTML = settings.countdown_text;
        countdown.appendChild(counter);
        next_div.appendChild(countdown);
        next_div.appendChild(next);

        card.appendChild(next_div);
      }
    });

    var counter_started = 0;
    player.on('ended', function() {
      card.style.display = 'block';
      var next = document.getElementById(settings.next);
      if (next !== null) {
        var href = next.getElementsByTagName("a")[0].href;
        var count = settings.count;
        counter.innerHTML = count;

        var interval = setInterval(function(){
          count--;
          if (count <= 0) {
            clearInterval(interval);
            window.location = href;
            return;
          }
          counter.innerHTML = count;
        }, 1000);
      }
      if (counter_started === 0) {
        counter_started++;
        player.on('playing', function() {
          card.style.display = 'none';
          clearInterval(interval);
        });
      }
    });



  };

  vjs.plugin('endcard', endcard);
    
})(window.videojs);