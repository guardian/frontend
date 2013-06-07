define([
    'common',
    'bonzo',
    'qwery',
    'bean',
    'ajax',
    'modules/tabs'
], function (
    common,
    bonzo,
    qwery,
    bean,
    ajax,
    Tabs
    ) {

    var Discussion = function(options) {

        var initialResponses      = 3,
            responsesIncrement    = 25,
            context               = options.context,
            config                = options.config,
            discussionId          = options.id.replace('http://gu.com', ''),
            discussionContainer   = options.discussionContainer || '.article__discussion',
            articleContainer      = options.articleContainer || '.article__container',
            commentCountSelector  = options.commentCountSelector || '.d-commentcount',
            commentsHaveLoaded    = false,
            loadingCommentsHtml   = '<div class="preload-msg">Loading comments…<div class="is-updating"></div></div>',
            currentPage           = 0,
            actionsTemplate       = '<button class="d-actions__link js-show-more-comments cta" data-link-name="Show more comments">Show more comments</button>' +
                '<div class="d-actions">' +
                '<a class="d-actions__link" href="' + config.page.canonicalUrl + '#start-of-comments">' +
                    'Want to comment? Visit the desktop site</a>' +
                '<button class="top js-show-article" data-link-name="Discussion: Back to article">Back to article</button></div>',
            self;

        return {
            init: function() {
                if (config.switches.discussion === false || config.page.commentable === false) {
                    return false;
                }

                self = this;
                self.discussionUrl           = '/discussion' + discussionId;
                self.discussionCountUrl      = 'http://discussion.guardianapis.com/discussion-api/discussion/'+discussionId+'/comments/count';
                self.discussionContainerNode = context.querySelector(discussionContainer);
                self.articleContainerNode    = context.querySelector(articleContainer);
                self.commentCountNode        = context.querySelector(commentCountSelector);

                self.getCommentCount(function(commentCount) {
                    if (commentCount > 0) {
                        self.upgradeByline(commentCount);
                        self.bindEvents();
                    }
                });
            },

            upgradeByline: function(commentCount) {
                var bylineNode = bonzo(context.querySelector('.byline'));
                var tabsHtml = '<div class="d-tabs">' +
                                 '<ol class="d-tabs__container unstyled">' +
                                 '  <li class="d-tabs__byline d-tabs--active js-show-article" data-link-name="Article Tab" data-is-ajax>' +
                                      bylineNode.html() +
                                 '  </li>' +
                                 '  <li class="d-tabs__commentcount js-show-discussion" data-link-name="Discussion Tab" data-is-ajax>' +
                                 '    <button class="d-commentcount speech-bubble">'+ commentCount + '</button>' +
                                 '  </li>' +
                                 '</ol>' +
                               '</div>';

                bylineNode.replaceWith(tabsHtml);
            },

            getCommentCount: function(callback) {
                ajax({
                    url: self.discussionCountUrl,
                    type: 'jsonp',
                    jsonpCallback: 'callback',
                    jsonpCallbackName: 'commentcount',
                    success: function(response) {
                        callback(response.numberOfComments);
                    }
                });
            },

            loadDiscussion: function(page) {
                page = page || 1;

                if (currentPage === 0) {
                    // first load
                    self.discussionContainerNode.innerHTML = loadingCommentsHtml;
                }

                ajax({
                    url: self.discussionUrl + '?page=' + page,
                    type: 'json',
                    method: 'get',
                    crossOrigin: true,
                    success: function(response) {
                        if (currentPage === 0) {
                            self.discussionContainerNode.innerHTML = response.html  + actionsTemplate;
                            self.showMoreBtnNode = context.querySelector('.js-show-more-comments');
                            self.showOnlyFirstReplies();
                        } else {
                            var newComments = bonzo.create(response.html)[0].querySelector('.d-thread').innerHTML; // TODO: Check performance of this
                            bonzo(self.discussionContainerNode.querySelector('.d-thread')).append(newComments);
                            self.showMoreBtnNode.innerText = 'Show more comments';
                        }

                        // Hide the 'Show more button' if there's no more messages on the server
                        self.showMoreBtnNode.style.display = (response.hasMore === true) ? 'block' : 'none';

                        commentsHaveLoaded = true;
                        currentPage = response.currentPage;
                        common.mediator.emit('fragment:ready:dates', self.discussionContainerNode);
                    },
                    error: function() {
                        self.discussionContainerNode.innerHTML = '<div class="preload-msg">Error loading comments' +
                                                                 '  <button class="cta js-show-discussion" data-link-name="Try loading comments again" data-is-ajax>Try again</button>' +
                                                                 '</div>';
                    }
                });
            },

            showOnlyFirstReplies: function(numToShow) {
                numToShow = numToShow || initialResponses;

                Array.prototype.forEach.call(context.querySelectorAll('.d-thread .d-thread'), function(threadNode) {
                    var totalResponses = threadNode.dataset.responses;

                    threadNode.dataset.visibleResponses = numToShow;
                    bonzo(threadNode.querySelectorAll('.d-comment:nth-child(n+'+(numToShow+1)+')')).attr('hidden','hidden');

                    var moreCommentsNum = totalResponses-threadNode.dataset.visibleResponses;
                    if (moreCommentsNum > 0 && totalResponses < responsesIncrement) {
                        // In this case, we just show the rest of the responses
                        bonzo(threadNode).append('<button class="cta js-show-more-replies" data-link-name="Show more replies" data-is-ajax>'+
                                                    self.buildShowMoreLabel(moreCommentsNum) +
                                                 '</button>');
                    }
                });

            },

            showMoreReplies: function(el) {
                var threadNode = el.parentNode,
                    totalResponses = parseInt(threadNode.dataset.responses, 10),
                    visibleResponses = parseInt(threadNode.dataset.visibleResponses, 10) + responsesIncrement,
                    selector = '.d-comment:nth-child(n-'+(visibleResponses)+')';

                bonzo(threadNode.querySelectorAll(selector)).removeAttr('hidden');
                threadNode.dataset.visibleResponses = visibleResponses;

                if (visibleResponses >= totalResponses) {
                    threadNode.querySelector('.js-show-more-replies').style.display = 'none';
                } else {
                    var buttonText = self.buildShowMoreLabel(totalResponses - visibleResponses);
                    threadNode.querySelector('.js-show-more-replies').innerText = buttonText;
                }
            },

            buildShowMoreLabel: function(num) {
                return (num === 1) ? 'Show 1 more reply' : 'Show '+num+' more replies';
            },

            bindEvents: function() {
                // Setup events
                var tabsNode = context.querySelector('.d-tabs__container');

                bean.on(context, 'click', '.js-show-discussion', function(e) {
                    e.preventDefault();
                    bonzo(tabsNode.querySelectorAll('li')).removeClass('d-tabs--active');
                    bonzo(tabsNode.querySelector('.d-tabs__commentcount')).addClass('d-tabs--active');

                    self.discussionContainerNode.style.display = 'block';
                    self.articleContainerNode.style.display = 'none';

                    if (!commentsHaveLoaded) {
                        // Don't request again if we've already done it
                        self.loadDiscussion();
                    }
                });

                bean.on(context, 'click', '.js-show-article', function(e) {
                    bonzo(tabsNode.querySelectorAll('li')).removeClass('d-tabs--active');
                    bonzo(tabsNode.querySelector('.d-tabs__byline')).addClass('d-tabs--active');

                    self.discussionContainerNode.style.display = 'none';
                    self.articleContainerNode.style.display = 'block';

                    if (e.currentTarget.className.indexOf('top') !== -1) {
                        var topPos = bonzo(tabsNode).offset().top;
                        window.scrollTo(0, topPos);
                    }
                });

                bean.on(context, 'click', '.js-show-more-comments', function(e) {
                    self.showMoreBtnNode.innerText = "Loading…";
                    self.loadDiscussion(currentPage + 1);
                });

                bean.on(context, 'click', '.js-show-more-replies', function(e) {
                    self.showMoreReplies(e.currentTarget);
                });
            }
        };

    };

    return Discussion;

});
