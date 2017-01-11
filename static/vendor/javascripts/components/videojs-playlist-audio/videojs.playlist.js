 (function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module unless amdModuleId is set
    define('videojs-playlist', ["videojs"], function (a0) {
      return (factory(a0));
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require("video.js"));
  } else {
    root['videojs-playlist'] = factory(videojs);
  }
}(this, function(videojs) {

 videojs.plugin('playlist', function(options) {
  //this.L="vjs_common_one";
  

  console.log(this);
  var id=this.el().id;

  //console.log('begin playlist plugin with video id:'+id);

 //console.log(this);
  //var id=this.tag.id;
  //assign variables
  var tracks=document.querySelectorAll("#"+id+"-vjs-playlist .vjs-track"),
      trackCount=tracks.length,
      player=this,
      currentTrack=tracks[0],
      index=0,
      play=true,
      onTrackSelected=options.onTrackSelected;

    //manually selecting track
    for(var i=0; i<trackCount; i++){
       tracks[i].onclick = function(){
          //var track=this;
          //index=this.getAttribute('data-index');
          //console.log("a is clicked and index position is"+this.getAttribute('data-index')+"the data-src is "+this.getAttribute('data-src'));
          //console.log("a is clicked and index position is"+index+"the data-src is "+this.getAttribute('data-src'));

          trackSelect(this);
       }
    }

    // for continuous play
    if(typeof options.continuous=='undefined' || options.continuous==true){
        //console.log('options.continuous==true');

        player.on("ended", function(){
            //console.log('on ended');

            index++;
            if(index>=trackCount){
              //console.log('go to beginning');
              index=0;
            }
            else;// console.log('trigger click next track');
            tracks[index].click();

        });// on ended
    }
    else;// console.log('dont play next!');

    //track select function for onended and manual selecting tracks
    var trackSelect=function(track){

       //get new src
        var src=track.getAttribute('data-src');
        index=parseInt(track.getAttribute('data-index')) || index;
        //console.log('track select click src:'+src);

        if(player.techName=='youtube'){
           player.src([
            { type: type="video/youtube", src:  src}
          ]);
        }
        else{

            if(player.el().firstChild.tagName=="AUDIO" || (typeof options.mediaType!='undefined' && options.mediaType=="audio") ){

              player.src([
                  { type: "audio/mp4", src:  src+".m4a" },
                  { type: "audio/webm", src: src+".webm" },
                  { type: type="video/youtube", src:  src},
                  { type: "audio/ogg", src: src+".ogg" }
                  /*{ type: "audio/mpeg", src:  src+".mp3" },
                  { type: "audio/ogg", src: src+".oga" }*/
               ]);
            }
            else{
            //console.log("video");
              player.src([                
                { type: "video/mp4", src:  src+".mp4" },
                { type: type="video/youtube", src:  src},
                { type: "video/webm", src: src+".webm" }
                //{ type: "video/ogv", src: src+".ogv" }
              ]);
            }
        }



        if(play) player.play();

        //remove 'currentTrack' CSS class
        for(var i=0; i<trackCount; i++){
            if (tracks[i].className.indexOf('currentTrack') !== -1) {
                tracks[i].className=tracks[i].className.replace(/\bcurrentTrack\b/,'nonPlayingTrack');
            }
        }
        //add 'currentTrack' CSS class
        track.className = track.className + " currentTrack";
        if(typeof onTrackSelected === 'function') onTrackSelected.apply(track);

    }

    //if want to start at track other than 1st track
    if(typeof options.setTrack!='undefined' ){
      options.setTrack=parseInt(options.setTrack);
      currentTrack=tracks[options.setTrack];
      index=options.setTrack;
      play=false;
      //console.log('options.setTrack index'+index);
      trackSelect(tracks[index]);
      play=true;
    }
    if (window.location.hash) {
      var hash = window.location.hash.substring(9);
      play = false;
      trackSelect(tracks[hash]);
    }

    var data={
      tracks: tracks,
      trackCount: trackCount,
      play:function(){
        return play;
      },
      index:function(){
        return index;
      },
      prev:function(){
        var j=index-1;
        //console.log('j'+j);
        if(j<0 || j>trackCount) j=0;
        trackSelect(tracks[j]);
      },
      next:function(){
        var j=index+1;
        //console.log('j'+j);
        if(j<0 || j>trackCount) j=0;
        trackSelect(tracks[j]);
      }
    };
    return data;
});
//return videojsplugin;
}));
