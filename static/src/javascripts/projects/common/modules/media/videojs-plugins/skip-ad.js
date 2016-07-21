define([
    'qwery',
    'bean',
    'common/utils/$',
    'common/utils/template',
    'text!common/views/ui/video-ads-skip-overlay.html'
], function(
    qwery,
    bean,
    $,
    template,
    adsSkipOverlayTemplate
) {

    function skipAd(mediaType, skipTimeout) {
        var intervalId;
        var events = {
                update: function () {
                    var adsManager  = this.ima.getAdsManager(),
                        currentTime = adsManager.getCurrentAd().getDuration() - adsManager.getRemainingTime(),
                        skipTime    = parseInt((skipTimeout - currentTime).toFixed(), 10);

                    if (skipTime > 0) {
                        $('.js-skip-remaining-time', this.el()).text(skipTime);
                    } else {
                        window.clearInterval(intervalId);
                        $('.js-ads-skip', this.el())
                            .html(
                                '<button class="js-ads-skip-button vjs-ads-skip__button" data-link-name="Skip video advert">' +
                                '<i class="i i-play-icon-grey skip-icon"></i>' +
                                '<i class="i i-play-icon-gold skip-icon"></i>Skip advert' +
                                '</button>'
                            );
                        bean.on(qwery('.js-ads-skip-button')[0], 'click', events.skip.bind(this));
                    }
                },
                skip: function () {
                    $('.js-ads-skip', this.el()).hide();
                    this.trigger(mediaType + ':preroll:skip');
                    // in lieu of a 'skip' api, rather hacky way of achieving it
                    this.ima.onAdComplete_();
                    this.ima.onContentResumeRequested_();
                    this.ima.getAdsManager().stop();
                },
                init: function () {
                    var adDuration = this.ima.getAdsManager().getCurrentAd().getDuration();

                    var skipButton = template(adsSkipOverlayTemplate, {
                        adDuration: adDuration,
                        skipTimeout: skipTimeout
                    });

                    $(this.el()).append(skipButton);
                    intervalId = setInterval(events.update.bind(this), 500);

                },
                end: function () {
                    $('.js-ads-skip', this.el()).hide();
                    window.clearInterval(intervalId);
                }
            };

        this.one(mediaType + ':preroll:play', events.init.bind(this));
        this.one(mediaType + ':preroll:end', events.end.bind(this));
    }

    return skipAd;


});
