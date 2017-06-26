// @flow
/* eslint-disable no-underscore-dangle */
import qwery from 'qwery';
import bean from 'bean';
import $ from 'lib/$';

const skipAd = function skipAd(mediaType: string, skipTimeout: number): void {
    let intervalId;

    const skip = (): void => {
        $('.js-ads-skip', this.el()).hide();
        this.trigger(`${mediaType}:preroll:skip`);
        // This is to follow more closely the videojs convention
        this.trigger('adskip');
        // in lieu of a 'skip' api, rather hacky way of achieving it
        this.ima.onAdComplete_();
        this.ima.onContentResumeRequested_();
        this.ima.getAdsManager().stop();
    };

    const update = (): void => {
        const adsManager = this.ima.getAdsManager();
        const currentTime =
            adsManager.getCurrentAd().getDuration() -
            adsManager.getRemainingTime();
        const skipTime = parseInt((skipTimeout - currentTime).toFixed(), 10);

        if (skipTime > 0) {
            $('.js-skip-remaining-time', this.el()).text(skipTime);
        } else {
            window.clearInterval(intervalId);
            $('.js-ads-skip', this.el()).html(
                `<button class="js-ads-skip-button vjs-ads-skip__button" data-link-name="Skip video advert">
                    <i class="i i-play-icon-grey skip-icon"></i>
                    <i class="i i-play-icon-gold skip-icon"></i>Skip advert
                </button>`
            );
            bean.on(qwery('.js-ads-skip-button')[0], 'click', skip);
        }
    };

    const init = (): void => {
        const adDuration = this.ima
            .getAdsManager()
            .getCurrentAd()
            .getDuration();

        const skipButton = `<div class="js-ads-skip vjs-ads-skip">
                                <span class="vjs-ads-skip__countdown">
                                    ${adDuration > skipTimeout
                                        ? 'You may skip this advert in '
                                        : 'Your video will start in '}
                                    <span class="js-skip-remaining-time">${skipTimeout}</span> seconds
                                </span>
                            </div>`;

        $(this.el()).append(skipButton);

        intervalId = setInterval(update.bind(this), 500);
    };

    const end = (): void => {
        $('.js-ads-skip', this.el()).hide();
        window.clearInterval(intervalId);
    };

    this.one(`${mediaType}:preroll:play`, init);
    this.one(`${mediaType}:preroll:end`, end);
};

export { skipAd };
