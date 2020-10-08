// @flow

/* eslint-disable no-new */

import fastdom from 'lib/fastdom-promise';
import qwery from 'qwery';
import $ from 'lib/$';
import config from 'lib/config';
import { catchErrorsWithContext } from 'lib/robust';
import { addProximityLoader } from 'lib/proximity-loader';
import { Loader as DiscussionLoader } from 'common/modules/discussion/loader';
import { isUserLoggedIn } from 'common/modules/identity/api';
import { OnwardContent } from 'common/modules/onward/onward-content';
import { MostPopular } from 'common/modules/onward/popular';
import { related } from 'common/modules/onward/related';
import { TonalComponent } from 'common/modules/onward/tonal';
import { loadShareCounts } from 'common/modules/social/share-count';
import { onwardVideo } from 'common/modules/video/onward-container';
import { onwardAudio } from 'common/modules/audio/onward-container';
import { moreInSeriesContainerInit } from 'common/modules/video/more-in-series-container';

const initMoreInSection = (): void => {
    const {
        showRelatedContent,
        isPaidContent,
        section,
        shortUrl,
        seriesId,
    } = config.get('page', {});

    if (
        (config.get('page.contentType') !== 'Audio' &&
            config.get('page.contentType') !== 'Video') ||
        !showRelatedContent ||
        isPaidContent ||
        !section
    ) {
        return;
    }

    const el = $('.js-more-in-section')[0];
    moreInSeriesContainerInit(
        el,
        config.get('page.contentType', '').toLowerCase(),
        section,
        shortUrl,
        seriesId
    );
};

const insertOrProximity = (selector, insert) => {
    if (window.location.hash) {
        insert();
    } else {
        fastdom
            .measure(() => document.querySelector(selector))
            .then(el => {
                if (el) {
                    addProximityLoader(el, 1500, insert);
                }
            });
    }
};

const initPopular = () => {
    if (!config.get('page.isFront')) {
        insertOrProximity('.js-popular-trails', () => {
            new MostPopular();
        });
    }
};

const initRelated = () => {
    if (!(config.get('page.seriesId') || config.get('page.blogIds'))) {
        insertOrProximity('.js-related', () => {
            const opts = {
                excludeTags: [],
            };

            // exclude ad features from non-ad feature content
            if (config.get('page.sponsorshipType') !== 'paid-content') {
                opts.excludeTags.push('tone/advertisement-features');
            }
            // don't want to show professional network content on videos or interactives
            if (
                'contentType' in config.get('page') &&
                ['video', 'interactive'].includes(
                    config.get('page.contentType', '').toLowerCase()
                )
            ) {
                opts.excludeTags.push(
                    'guardian-professional/guardian-professional'
                );
            }

            related(opts);
        });
    }
};

const initOnwardVideoContainer = (): void => {
    const contentType = config.get('page.contentType', '');

    if (contentType !== 'Audio' && contentType !== 'Video') {
        return;
    }

    const mediaType = contentType.toLowerCase();
    const els = $(
        mediaType === 'video'
            ? '.js-video-components-container'
            : '.js-media-popular'
    );

    els.each(el => {
        onwardVideo(el, mediaType);
    });
};

const initOnwardAudioContainer = (): void => {
    if (config.get('page.contentType') === 'Audio') {
        $('.js-audio-components-container').each(el => onwardAudio(el));
    }
};

const initOnwardContent = () => {
    insertOrProximity('.js-onward', () => {
        if (
            (config.get('page.seriesId') || config.get('page.blogIds')) &&
            config.get('page.showRelatedContent')
        ) {
            new OnwardContent(qwery('.js-onward'));
        } else if (config.get('page.tones', '') !== '') {
            fastdom
                .measure(() => Array.from(document.querySelectorAll('.js-onward')))
                .then(els => {
                    els.forEach(c => {
                        new TonalComponent().fetch(c, 'html');
                    });
                });
        }
    });

    initOnwardVideoContainer();
    initOnwardAudioContainer();
};

const initDiscussion = () => {
    if (
        config.get('switches.enableDiscussionSwitch') &&
        config.get('page.commentable')
    ) {
        fastdom
            .measure(() => document.querySelector('.discussion'))
            .then(el => {
                if (el) {
                    new DiscussionLoader().attachTo(el);
                }
            });
    }
};

const repositionComments = () => {
    if (!isUserLoggedIn()) {
        fastdom
            .measure(() => $('.js-comments'))
            .then($comments =>
                fastdom.mutate(() => {
                    $comments.appendTo(qwery('.js-repositioned-comments'));
                    if (window.location.hash === '#comments') {
                        const top = $comments.offset().top;
                        $(document.body).scrollTop(top);
                    }
                })
            );
    }
};

const initTrails = () => {
    catchErrorsWithContext([
        ['c-discussion', initDiscussion],
        ['c-comments', repositionComments],
        ['c-shares', loadShareCounts],
        ['c-popular', initPopular],
        ['c-related', initRelated],
        ['c-onward', initOnwardContent],
        ['c-more-in-section', initMoreInSection],
    ]);
};

export { initTrails };
