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
            discussionId         = options.id.replace('http://gu.com', ''),
            containerSelector    = options.containerSelector || '.discussion-container',
            commentCountSelector = options.commentCountSelector || '.discussion-comment-count',
            commentsHaveLoaded   = false,
            self;

        return {
            init: function() {
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
                    if (!commentsHaveLoaded) {
                        self.loadDiscussion();
                    }
                });
            },

            updateCommentCounter: function() {
                ajax({
                    url: self.discussionCountUrl,
                    type: 'jsonp',
                    jsonpCallback: 'callback',
                    jsonpCallbackName: 'commentcount',
                    success: function(response) {
                        if (response.numberOfComments > 0) {
                            self.commentCountNode.innerText = response.numberOfComments;
                        }
                    }
                });
            },

            loadDiscussion: function() {
                self.containerNode.innerHTML = '<div class="preload-msg">Loading comments...<div class="is-updating"></div></div>';

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
