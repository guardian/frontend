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
            containerSelector    = options.containerSelector || '.article__discussion',
            commentCountSelector = options.commentCountSelector || '.discussion__commentcount',
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

                self.updateCommentCounter();

                // This is only here temporarily, needs a better loving home
                var tabs = new Tabs();
                tabs.init(context.querySelector('.article'));

                // Setup events
                bean.on(context, 'click', '.js-show-discussion', function(e) {
                    context.querySelector('.article__discussion').style.display = 'block';
                    context.querySelector('.article__container').style.display = 'none';
                    if (!commentsHaveLoaded) {
                        self.loadDiscussion();
                    }
                });

                bean.on(context, 'click', '.js-show-article', function(e) {
                    context.querySelector('.article__discussion').style.display = 'none';
                    context.querySelector('.article__container').style.display = 'block';
                });
            },

            upgradeByline: function(commentCount) {
                commentCount = commentCount || 0;
                var bylineNode = bonzo(context.querySelector('.byline'));
                var tabsHtml = '<div class="d-tabs">' +
                                 '<div class="d-tabs__byline js-show-article">' +
                                    context.querySelector('.byline').outerHTML +
                                 '</div>' +
                                 '<div class="d-tabs__commentcount speech-bubble js-show-discussion">' +
                                    commentCount +
                                 '</div>' +
                               '</div>';

                bylineNode.replaceWith(tabsHtml);
            },

            updateCommentCounter: function() {
                ajax({
                    url: self.discussionCountUrl,
                    type: 'jsonp',
                    jsonpCallback: 'callback',
                    jsonpCallbackName: 'commentcount',
                    success: function(response) {
                        if (response.numberOfComments > 0) {
                            self.upgradeByline(response.numberOfComments);
                        }
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
            }
        };

    };

    return Discussion;

});
