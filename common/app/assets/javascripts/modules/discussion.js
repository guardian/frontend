define([
    'bonzo',
    'qwery',
    'bean',
    'ajax',
    'modules/tabs'
], function (
    bonzo,
    qwery,
    bean,
    ajax,
    Tabs
    ) {

    var Discussion = function(options) {

        var initialVisibleReplies = 3,
            context               = options.context,
            config                = options.config,
            discussionId          = options.id.replace('http://gu.com', ''),
            discussionContainer   = options.discussionContainer || '.article__discussion',
            articleContainer      = options.articleContainer || '.article__container',
            commentCountSelector  = options.commentCountSelector || '.d-commentcount',
            commentsHaveLoaded    = false,
            loadingCommentsHtml   = '<div class="preload-msg">Loading comments…<div class="is-updating"></div></div>',
            currentPage           = 0,
            actionsTemplate      = '<div class="d-actions">' +
                '<button class="d-actions__link js-show-more-comments cta" data-link-name="Show more comments">Show more comments</button>' +
                '<a class="d-actions__link" href="' + config.page.canonicalUrl + '#start-of-comments">' +
                    'Want to comment? Visit the desktop site</a>' +
                '<button class="top js-show-article">Back to article</button></div>',
            self;

        return {
            init: function() {
                if (config.page.commentable === false) {
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
                                 '  <li class="d-tabs__byline d-tabs--active js-show-article" data-link-name="Article Tab">' +
                                      bylineNode.html() +
                                 '  </li>' +
                                 '  <li class="d-tabs__commentcount js-show-discussion" data-link-name="Discussion Tab">' +
                                 '    <a href="#" class="d-commentcount speech-bubble">'+ commentCount + '</a>' +
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
                        } else {
                            var newComments = bonzo.create(response.html)[0].querySelector('.d-thread').innerHTML; // TODO: Check performance of this
                            bonzo(self.discussionContainerNode.querySelector('.d-thread')).append(newComments);
                        }

                        context.querySelector('.js-show-more-comments').style.display = (response.hasMore === true) ? 'block' : 'none';

                        commentsHaveLoaded = true;
                        currentPage = response.currentPage;
                    },
                    error: function() {
                        self.discussionContainerNode.innerHTML = '<div class="preload-msg">Error loading comments <button class="cta js-show-discussion">Try again</button></div>';
                    }
                });
            },

            bindEvents: function() {
                // Setup events
                bean.on(context, 'click', '.js-show-discussion', function(e) {
                    e.preventDefault();
                    bonzo(e.currentTarget.parentNode.children).removeClass('d-tabs--active');
                    bonzo(e.currentTarget).addClass('d-tabs--active');
                    self.discussionContainerNode.style.display = 'block';
                    self.articleContainerNode.style.display = 'none';

                    if (!commentsHaveLoaded) {
                        // Don't request again if we've already done it
                        self.loadDiscussion();
                    }
                });

                bean.on(context, 'click', '.js-show-article', function(e) {
                    e.preventDefault();
                    bonzo(e.currentTarget.parentNode.children).removeClass('d-tabs--active');
                    bonzo(e.currentTarget).addClass('d-tabs--active');
                    self.discussionContainerNode.style.display = 'none';
                    self.articleContainerNode.style.display = 'block';
                });

                bean.on(context, 'click', '.js-show-more-comments', function(e) {
                    self.loadDiscussion(currentPage + 1);
                });
            }
        };

    };

    return Discussion;

});
