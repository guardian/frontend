// @flow

import bonzo from 'bonzo';
import bean from 'bean';
import $ from 'lib/$';
import {
    getUrlVars,
    constructQuery,
    replaceQueryString,
    pushQueryString,
} from 'lib/url';
import { Component } from 'common/modules/component';
import { recommendComment } from 'common/modules/discussion/api';

declare class PopStateEvent extends Event {
    state: Object;
}

class ActivityStream extends Component {
    constructor(opts: Object): void {
        super();

        this.endpoint =
            '/discussion/profile/:userId/:streamType.json?page=:page';
        this.componentClass = 'activity-stream';
        this.defaultOptions = {
            page: 1,
            streamType: 'discussions',
            userId: null,
        };

        this.setOptions(opts);
    }

    applyState(html: string, streamType: string): void {
        const selectTab = (type: string): void => {
            // Blur so that when pressing forward/back the focus is not retained on
            // the old tab Note, without the focus first, the blur doesn't seem to
            // work for some reason
            $('.js-activity-stream-change')
                .focus()
                .blur();

            $('.tabs__tab--selected').removeClass('tabs__tab--selected');

            bonzo($(`a[data-stream-type=${type}]`))
                .parent()
                .addClass('tabs__tab--selected');
        };

        // update display
        const $el = bonzo(this.elem).empty();

        this.setState('loading');

        $.create(html).each(el => {
            $el.html($(el).html()).attr({ class: el.className });
        });

        this.removeState('loading');

        const activeTab = $('.tabs__tab--selected');

        if (activeTab.data('stream-type') !== streamType) {
            selectTab(streamType === 'comments' ? 'discussions' : streamType);
        }

        // update opts
        this.options.streamType = streamType;
    }

    change(opts: Object): Promise<any> {
        this.setOptions(opts);
        // eslint-disable-next-line no-underscore-dangle
        return this._fetch();
    }

    fetched(resp: Object): void {
        this.applyState(resp.html, this.options.streamType);
        this.updateHistory(resp);
    }

    ready(): void {
        const pagination = (activityStream: ActivityStream): void => {
            bean.on(
                activityStream.elem,
                'click',
                '.js-activity-stream-page-change',
                (e: Event) => {
                    const target: HTMLElement = (e.currentTarget: any);
                    const page: ?string = target.getAttribute('data-page');
                    e.preventDefault();

                    activityStream.change({
                        page,
                    });
                }
            );
        };

        this.removeState('loading');
        this.on('click', '.js-disc-recommend-comment', this.recommendComment);

        $('.js-disc-recommend-comment').addClass(
            'disc-comment__recommend--open'
        );

        window.onpopstate = (event: PopStateEvent): void => {
            this.applyState(event.state.resp.html, event.state.streamType);
        };

        pagination(this);
    }

    // eslint-disable-next-line class-methods-use-this
    recommendComment(e: Event): void {
        const el: HTMLElement = (e.currentTarget: any);
        const id = el.getAttribute('data-comment-id');

        if (id) {
            recommendComment(id);

            bonzo(el).addClass('disc-comment__recommend--active');

            $('.js-disc-recommend-count', el).each(countEl => {
                countEl.innerHTML = parseInt(countEl.innerHTML, 10) + 1;
            });
        }
    }

    updateHistory(resp: Object): void {
        const page = this.options.page;
        const pageParam = getUrlVars().page;
        const streamType =
            this.options.streamType !== 'discussions'
                ? `/${this.options.streamType}`
                : '';
        const qs = `/user/id/${this.options
            .userId}${streamType}?${constructQuery({ page })}`;
        const state = { resp, streamType: this.options.streamType };
        const params = { querystring: qs, state };

        if (typeof pageParam === 'undefined') {
            // If first load and without page param, add it and overwrite history
            replaceQueryString(params);
        } else {
            pushQueryString(params);
        }
    }
}

export { ActivityStream };
