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

        var context              = options.context,
            config               = options.config,
            discussionId         = options.id.replace('http://gu.com', ''),
            containerSelector    = options.containerSelector || '.discussion__container',
            commentCountSelector = options.commentCountSelector || '.d-commentcount',
            commentsHaveLoaded   = false,
            self;

        return {
            init: function() {
                if (config.page.commentable === false) {
                    return false;
                }

                self = this;
                self.discussionUrl      = '/discussion' + discussionId;
                self.discussionCountUrl = 'http://discussion.guardianapis.com/discussion-api/discussion/'+discussionId+'/comments/count';
                self.containerNode      = context.querySelector(containerSelector);
                self.commentCountNode   = context.querySelector(commentCountSelector);

                self.getCommentCount(function(commentCount) {
                    if (commentCount > 0) {
                        self.upgradeByline(commentCount);
                    }
                });
            },

            upgradeByline: function(commentCount) {
                var bylineNode = bonzo(context.querySelector('.byline'));
                var tabsHtml = '<div class="d-tabs">' +
                                 '<ol class="d-tabs__container unstyled">' +
                                 '  <li class="d-tabs__byline d-tabs--active js-show-article">' +
                                      bylineNode.html() +
                                 '  </li>' +
                                 '  <li class="d-tabs__commentcount js-show-discussion">' +
                                 '    <a href="#" class="d-commentcount speech-bubble">'+ commentCount + '</a>' +
                                 '  </li>' +
                                 '</ol>' +
                               '</div>';

                bylineNode.replaceWith(tabsHtml);
                self.bindEvents();
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

            loadDiscussion: function() {
                self.containerNode.innerHTML = '<div class="preload-msg">Loading comments…<div class="is-updating"></div></div>';

                ajax({
                    url: self.discussionUrl,
                    type: 'json',
                    method: 'get',
                    crossOrigin: true,
                    success: function(response) {
                        self.containerNode.innerHTML = response.html;
                        commentsHaveLoaded = true;
                    },
                    error: function() {
                        self.containerNode.innerHTML = '<div class="preload-msg">Error loading comments <button class="js-show-discussion">Try again</button></div>';
                    }
                });
            },

            bindEvents: function() {
                // Setup events
                bean.on(context, 'click', '.js-show-discussion', function(e) {
                    e.preventDefault();
                    bonzo(e.currentTarget.parentNode.children).removeClass('d-tabs--active');
                    bonzo(e.currentTarget).addClass('d-tabs--active');
                    context.querySelector('.discussion__container').style.display = 'block';
                    context.querySelector('.article__container').style.display = 'none';

                    if (!commentsHaveLoaded) {
                        // Don't request again if we've already done it
                        self.loadDiscussion();
                    }
                });

                bean.on(context, 'click', '.js-show-article', function(e) {
                    e.preventDefault();
                    bonzo(e.currentTarget.parentNode.children).removeClass('d-tabs--active');
                    bonzo(e.currentTarget).addClass('d-tabs--active');
                    context.querySelector('.discussion__container').style.display = 'none';
                    context.querySelector('.article__container').style.display = 'block';
                });
            }
        };

    };

    return Discussion;

});
