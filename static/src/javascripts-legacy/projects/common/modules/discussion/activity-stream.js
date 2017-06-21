define(
    [
        'bonzo',
        'bean',
        'lib/$',
        'lib/url',
        'common/modules/component',
        'common/modules/discussion/api',
    ],
    function(bonzo, bean, $, url, component, discussionApi) {
        function ActivityStream(opts) {
            this.setOptions(opts);
        }
        component.define(ActivityStream);
        ActivityStream.prototype.endpoint =
            '/discussion/profile/:userId/:streamType.json?page=:page';
        ActivityStream.prototype.componentClass = 'activity-stream';

        ActivityStream.prototype.defaultOptions = {
            page: 1,
            streamType: 'discussions',
            userId: null,
        };
        ActivityStream.prototype.ready = function() {
            this.removeState('loading');
            this.on(
                'click',
                '.js-disc-recommend-comment',
                this.recommendComment
            );
            $('.js-disc-recommend-comment').addClass(
                'disc-comment__recommend--open'
            );

            window.onpopstate = function(event) {
                if (url.hasHistorySupport) {
                    this.applyState(
                        event.state.resp.html,
                        event.state.streamType
                    );
                }
            }.bind(this);

            pagination(this);
        };
        ActivityStream.prototype.recommendComment = function(e) {
            var el = e.currentTarget;
            discussionApi.recommendComment(el.getAttribute('data-comment-id'));
            bonzo(el).addClass('disc-comment__recommend--active');
            $('.js-disc-recommend-count', el).each(function(countEl) {
                countEl.innerHTML = parseInt(countEl.innerHTML, 10) + 1;
            });
        };
        ActivityStream.prototype.change = function(opts) {
            this.setOptions(opts);
            return this._fetch();
        };
        ActivityStream.prototype.fetched = function(resp) {
            this.applyState(resp.html, this.options.streamType);
            this.updateHistory(resp);
        };
        ActivityStream.prototype.applyState = function(html, streamType) {
            // update display
            var $el = bonzo(this.elem).empty();
            this.setState('loading');
            $.create(html).each(function(el) {
                $el.html($(el).html()).attr({ class: el.className });
            });
            this.removeState('loading');

            var activeTab = $('.tabs__tab--selected');
            if (activeTab.data('stream-type') !== streamType) {
                selectTab(
                    streamType === 'comments' ? 'discussions' : streamType
                );
            }

            // update opts
            this.options.streamType = streamType;
        };
        ActivityStream.prototype.updateHistory = function(resp) {
            var page = this.options.page;
            var pageParam = url.getUrlVars().page;
            var streamType = this.options.streamType !== 'discussions'
                ? '/' + this.options.streamType
                : '';
            var qs =
                '/user/id/' +
                this.options.userId +
                streamType +
                '?' +
                url.constructQuery({ page: page });
            var state = { resp: resp, streamType: this.options.streamType };
            var params = { querystring: qs, state: state };

            if (typeof pageParam === 'undefined') {
                // If first load and without page param, add it and overwrite history
                url.replaceQueryString(params);
            } else {
                url.pushQueryString(params);
            }
        };

        function pagination(activityStream) {
            bean.on(
                activityStream.elem,
                'click',
                '.js-activity-stream-page-change',
                function(e) {
                    var page = e.currentTarget.getAttribute('data-page');
                    e.preventDefault();

                    activityStream.change({
                        page: page,
                    });
                }
            );
        }

        function selectTab(streamType) {
            // Blur so that when pressing forward/back the focus is not retained on
            // the old tab Note, without the focus first, the blur doesn't seem to
            // work for some reason
            $('.js-activity-stream-change').focus().blur();

            $('.tabs__tab--selected').removeClass('tabs__tab--selected');
            bonzo($('a[data-stream-type=' + streamType + ']'))
                .parent()
                .addClass('tabs__tab--selected');
        }

        return ActivityStream;
    }
);
