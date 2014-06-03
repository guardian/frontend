# VAST Javascript Client

[![Build Status](https://travis-ci.org/dailymotion/vast-client-js.png)](https://travis-ci.org/dailymotion/vast-client-js)


## Build

    $ npm install
    $ npm run-script bundle

## Usage

``` javascript
DMVAST.client.get(VASTURL, function(response)
{
    if (response)
    {
        for (var adIdx = 0, adLen = response.ads.length; adIdx < adLen; adIdx++)
        {
            var ad = response.ads[adIdx];
            for (var creaIdx = 0, creaLen = ad.creatives.length; creaIdx < creaLen; creaIdx++)
            {
                var linearCreative = ad.creatives[creaIdx];
                if (linearCreative.type != "linear") continue;

                for (var mfIdx = 0, mfLen = linearCreative.mediaFiles.length; mfIdx < mfLen; mfIdx++)
                {
                    var mediaFile = linearCreative.mediaFiles[mfIdx];
                    if (mediaFile.mimeType != "video/mp4") continue;

                    player.vastTracker = new DMVAST.tracker(ad, linearCreative);
                    player.vastTracker.on('clickthrough', function(url)
                    {
                        document.location.href = url;
                    });
                    player.on('canplay', function() {this.vastTracker.load();});
                    player.on('timeupdate', function() {this.vastTracker.setProgress(this.currentTime);});
                    player.on('play', function() {this.vastTracker.setPaused(false);});
                    player.on('pause', function() {this.vastTracker.setPaused(true);});

                    player.video.href = mediaFile.fileURL;
                    // put player in ad mode
                    break;
                }

                if (player.vastTracker)
                {
                    break;
                }
            }

            if (player.vastTracker)
            {
                break;
            }
            else
            {
                // Inform ad server we can't find suitable media file for this ad
                DMVAST.util.track(ad.errorURLTemplates, {ERRORCODE: 403});
            }
        }
    }

    if (!player.vastTracker)
    {
        // No pre-roll, start video
    }

});
```
