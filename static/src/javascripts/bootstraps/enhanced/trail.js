// @flow

/* eslint-disable no-new */

import fastdom from 'lib/fastdom-promise';
import qwery from 'qwery';
import $ from 'lib/$';
import config from 'lib/config';
import { catchErrorsWithContext } from 'lib/robust';
import proximityLoader from 'lib/proximity-loader';
import commentAdverts from 'commercial/modules/comment-adverts';
import { Loader as DiscussionLoader } from 'common/modules/discussion/loader';
import identityApi from 'common/modules/identity/api';
import { OnwardContent } from 'common/modules/onward/onward-content';
import { MostPopular } from 'common/modules/onward/popular';
import { related } from 'common/modules/onward/related';
import { TonalComponent } from 'common/modules/onward/tonal';
import { loadShareCounts } from 'common/modules/social/share-count';

const insertOrProximity = (selector, insert) => {
    if (window.location.hash) {
        insert();
    } else {
        fastdom.read(() => document.querySelector(selector)).then(el => {
            if (el) {
                proximityLoader.add(el, 1500, insert);
            }
        });
    }
};

const initPopular = () => {
    if (!config.get('page.isFront')) {
        insertOrProximity('.js-popular-trails', () => {
            new MostPopular().init();
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
                    config.page.contentType.toLowerCase()
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

const initOnwardContent = () => {
    insertOrProximity('.js-onward', () => {
        if (
            (config.get('page.seriesId') || config.get('page.blogIds')) &&
            config.get('page.showRelatedContent')
        ) {
            new OnwardContent(qwery('.js-onward'));
        } else if (config.get('page.tones', '') !== '') {
            fastdom
                .read(() => document.querySelectorAll('.js-onward'))
                .then(els => {
                    [...els].forEach(c => {
                        new TonalComponent().fetch(c, 'html');
                    });
                });
        }
    });
};

const initDiscussion = () => {
    if (
        config.get('switches.enableDiscussionSwitch') &&
        config.get('page.commentable')
    ) {
        fastdom.read(() => document.querySelector('.discussion')).then(el => {
            if (el) {
                new DiscussionLoader().attachTo(el);
            }
        });
    }
};

const repositionComments = () => {
    if (!identityApi.isUserLoggedIn()) {
        fastdom.read(() => $('.js-comments')).then($comments =>
            fastdom.write(() => {
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
        ['c-comment-adverts', commentAdverts],
    ]);
};

export { initTrails };
