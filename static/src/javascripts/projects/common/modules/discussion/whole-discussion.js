// @flow

import $ from 'lib/$';
import bonzo from 'bonzo';
import fetchJson from 'lib/fetch-json';
import { constructQuery } from 'lib/url';
import range from 'lodash/arrays/range';

declare type DiscussionResponse = {
    commentsHtml: string,
    lastPage: number,
    paginationHtml: string,
    postedCommentHtml: string,
};

/* This size effectively determines how many calls this module needs to make.
   Number of ajax calls = number of comments / comments per page */
const COMMENTS_PER_PAGE = 50;
const CONCURRENT_LIMIT = 3;
const MAX_COMMENT_COUNT = 1000;

// A basic Promise queue based on: http://talks.joneisen.me/presentation-javascript-concurrency-patterns/refactoru-9-23-2014.slide#25
const runConcurrently = (
    workFunction: (num: number) => Promise<any>,
    items: Array<number>
): Promise<void> =>
    new Promise(resolve => {
        const queue = items;
        let workers = 0;

        const onComplete = () => {
            workers -= 1;
            if (queue.length) {
                // eslint-disable-next-line no-use-before-define
                start(queue.shift());
            } else if (!workers) {
                resolve();
            }
        };

        const start = item => {
            workers += 1;
            workFunction.call(null, item).then(onComplete, onComplete);
        };

        if (!items || !items.length) {
            resolve();
            return;
        }

        const initialItems = items.splice(0, CONCURRENT_LIMIT);

        initialItems.forEach(start);
    });

class WholeDiscussion {
    commentsThread: bonzo;
    discussion: Array<Object>;
    discussionContainer: bonzo;
    discussionId: number;
    lastPage: number;
    params: {
        commentsClosed: boolean,
        displayThreaded: boolean,
        maxResponses: number,
        orderBy: 'newest' | 'oldest',
    };
    postedCommentHtml: string;

    constructor(options: Object): void {
        this.discussionId = options.discussionId;
        this.discussion = [];
        this.params = {
            orderBy: options.orderBy,
            displayThreaded: options.displayThreaded,
            maxResponses: options.maxResponses,
            commentsClosed: options.commentsClosed,
        };
    }

    firstPageLoaded(resp: Object): Array<number> {
        // Add the first page of comments to the discussion object.
        this.storeCommentPage(resp, 1);

        /* Keep a copy of the comments thread and discussion container so it
           can be easily reduced later. */
        this.discussionContainer = bonzo.create(resp.commentsHtml);
        this.postedCommentHtml = resp.postedCommentHtml;
        this.lastPage = resp.lastPage;
        this.commentsThread = $(
            '.d-thread--comments',
            this.discussionContainer
        ).empty();

        // Decide if this discussion is too big to load the remaining pages for.
        if (resp.commentCount > MAX_COMMENT_COUNT) {
            throw new Error('Discussion comment count too large');
        }

        // Return a collection of the indices of the remaining pages.
        return range(2, this.lastPage + 1);
    }

    /* Caches a bonzo object/array of comments, so that they can be
       re-assembled when the load is complete. */
    storeCommentPage(response: Object, page: number): void {
        const container = $(
            '.d-thread--comments',
            bonzo.create(response.commentsHtml)
        );
        let comments = $('.d-comment--top-level', container);

        if (this.params.orderBy === 'newest') {
            comments = comments.map(comment => comment).reverse();
        }

        this.discussion[page] = comments;
    }

    loadPage(pageNumber: number): Promise<Object> {
        // Always load in oldest order, to ensure pages are consistent whilst new comments are posted.
        const queryParams: Object = {
            orderBy: 'oldest',
            page: pageNumber,
            pageSize: COMMENTS_PER_PAGE,
            displayThreaded: this.params.displayThreaded,
            commentsClosed: this.params.commentsClosed,
        };

        if (this.params.maxResponses) {
            queryParams.maxResponses = this.params.maxResponses;
        }

        const url = `/discussion/${this.discussionId}.json?${constructQuery(
            queryParams
        )}`;

        return fetchJson(url, {
            mode: 'cors',
        });
    }

    loadPageAndStore(pageNumber: number): Promise<void> {
        return this.loadPage(pageNumber).then(response => {
            this.storeCommentPage(response, pageNumber);
        });
    }

    loadRemainingPages(pages: Array<number>): Promise<void> {
        return runConcurrently(this.loadPageAndStore.bind(this), pages);
    }

    makeDiscussionResponseObject(): DiscussionResponse {
        if (this.params.orderBy === 'newest') {
            this.discussion.reverse();
        }

        this.discussion.reduce((result, comments) => {
            result.append(comments);
            return result;
        }, this.commentsThread);

        return {
            paginationHtml: '',
            postedCommentHtml: this.postedCommentHtml,
            commentsHtml: this.discussionContainer.html(),
            lastPage: this.lastPage,
        };
    }

    // Always load the first page, to retrieve the number of comments in the discussion.
    loadAllComments(): Promise<DiscussionResponse> {
        return this.loadPage(1)
            .then(resp => this.firstPageLoaded(resp))
            .then(pages => this.loadRemainingPages(pages))
            .then(() => this.makeDiscussionResponseObject());
    }
}

export { WholeDiscussion };
