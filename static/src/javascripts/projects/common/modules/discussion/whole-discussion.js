define([
    'bean',
    'bonzo',
    'qwery',
    'Promise',
    'common/utils/$',
    'common/utils/ajax-promise',
    'lodash/collections/forEach',
    'lodash/arrays/range'
], function (
    bean,
    bonzo,
    qwery,
    Promise,
    $,
    ajaxPromise,
    forEach,
    range) {
    // This size effectively determines how many calls this module needs to make.
    // Number of ajax calls = number of comments / comments per page
    var commentsPerPage = 50,
        concurrentLimit = 3,
        maximumCommentCount = 1000;

    // A basic Promise queue based on: http://talks.joneisen.me/presentation-javascript-concurrency-patterns/refactoru-9-23-2014.slide#25
    function runConcurrently(workFunction, items) {

        return new Promise(function (resolve) {

            function onComplete() {
                workers--;
                if (queue.length) {
                    start(queue.shift());
                } else if (!workers) {
                    resolve();
                }
            }

            function start(item) {
                workers++;
                workFunction.call(null, item).then(onComplete, onComplete);
            }

            if (!items || !items.length) {
                resolve();
                return;
            }

            var initialItems = items.splice(0, concurrentLimit),
                queue = items,
                workers = 0;

            forEach(initialItems, start);
        });
    }

    function WholeDiscussion(options) {
        this.discussionId = options.discussionId;
        this.discussion = [];
        this.params = {
            orderBy: options.orderBy,
            displayThreaded: options.displayThreaded,
            maxResponses: options.maxResponses
        };
    }

    WholeDiscussion.prototype.firstPageLoaded = function (resp) {
        // Add the first page of comments to the discussion object.
        this.storeCommentPage(resp, 1);

        // Keep a copy of the comments thread and discussion container so it can be easily reduced later.
        this.discussionContainer = bonzo.create(resp.commentsHtml);
        this.commentsThread = $('.d-thread--comments', this.discussionContainer).empty();
        this.postedCommentHtml = resp.postedCommentHtml;
        this.lastPage = resp.lastPage;

        // Decide if this discussion is too big to load the remaining pages for.
        if (resp.commentCount > maximumCommentCount) {
            throw new Error('Discussion comment count too large');
        }

        // Return a collection of the indices of the remaining pages.
        return range(2, this.lastPage + 1);
    };

    // Caches a bonzo object/array of comments, so that they can be re-assembled when the load is complete.
    WholeDiscussion.prototype.storeCommentPage = function (response, page) {
        var container = $('.d-thread--comments', bonzo.create(response.commentsHtml)),
            comments = $('.d-comment--top-level', container);
        if (this.params.orderBy === 'newest') {

            comments = comments.map(function (comment) {
                return comment;
            }).reverse();
        }
        this.discussion[page] = comments;
    };

    WholeDiscussion.prototype.loadPage = function (pageNumber) {

        // Always load in oldest order, to ensure pages are consistent whilst new comments are posted.
        var queryParams = {
            orderBy: 'oldest',
            page: pageNumber,
            pageSize: commentsPerPage,
            displayThreaded: this.params.displayThreaded
        };

        if (this.params.maxResponses) {
            queryParams.maxResponses = this.params.maxResponses;
        }

        return ajaxPromise({
            url: '/discussion/' + this.discussionId + '.json',
            type: 'json',
            method: 'get',
            crossOrigin: true,
            data: queryParams
        });
    };

    WholeDiscussion.prototype.loadPageAndStore = function (pageNumber) {
        return this.loadPage(pageNumber).then(function (response) {
            this.storeCommentPage(response, pageNumber);
        }.bind(this));
    };

    WholeDiscussion.prototype.loadRemainingPages = function (pages) {
        return runConcurrently(this.loadPageAndStore.bind(this), pages);
    };

    WholeDiscussion.prototype.makeDiscussionResponseObject = function () {

        if (this.params.orderBy === 'newest') {
            this.discussion.reverse();
        }

        this.discussion.reduce(function (result, comments) {
            result.append(comments);
            return result;
        }, this.commentsThread);

        return {
            paginationHtml: '',
            postedCommentHtml: this.postedCommentHtml,
            commentsHtml: this.discussionContainer.html(),
            lastPage: this.lastPage
        };
    };

    WholeDiscussion.prototype.loadAllComments = function () {

        // Always load the first page, to retrieve the number of comments in the discussion.
        return this.loadPage(1)
        .then(this.firstPageLoaded.bind(this))
        .then(this.loadRemainingPages.bind(this))
        .then(this.makeDiscussionResponseObject.bind(this));
    };

    return WholeDiscussion;
});
