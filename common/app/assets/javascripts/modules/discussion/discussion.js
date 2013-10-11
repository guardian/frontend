define([
    'common',
    'bonzo',
    'qwery',
    'bean',
    'ajax',
    'modules/analytics/discussion',
    'modules/discussion/comment-box',
    'modules/discussion/recommend-comments',
    'modules/userPrefs',
    'modules/analytics/clickstream',
    'modules/inview',
    'modules/detect',
    'modules/id'
], function (
    common,
    bonzo,
    qwery,
    bean,
    ajax,
    tracking,
    CommentBox,
    RecommendComments,
    userPrefs,
    ClickStream,
    Inview,
    Detect,
    Id
    ) {

    var Discussion = function(options) {
        options.config.switches.discussionPostComment = true;
        var initialResponses      = 3,
            responsesIncrement    = 25,
            context               = options.context,
            config                = options.config,
            discussionId          = options.id.replace('http://gu.com', ''),
            discussionContainer   = options.discussionContainer || '.article__discussion',
            articleContainer      = options.articleContainer || '.js-article__container',
            mediaPrimary          = options.mediaPrimary || 'article .media-primary',
            commentsHaveLoaded    = false,
            loadingInProgress     = false,
            loadingCommentsHtml   = '<div class="preload-msg">Loading comments…<div class="is-updating"></div></div>',
            currentPage           = 0,
            actionsTemplate       = '<button class="js-show-more-comments cta" data-link-name="Show more comments">Show more comments</button>' +
                                    '<div class="d-actions">'+
                                        '<a data-link-name="Comment on desktop" class="d-actions__link" href="/'+ config.page.pageId +'?view=desktop#start-of-comments">'+
                                            'Want our fully featured commenting experience? Head to our old site.'+
                                        '</a>'+
                                        '<a href="#article" class="top" data-link-name="Discussion: Return to article">Return to article</a>'+
                                    '</div>',
            clickstream           = new ClickStream({ addListener: false }),
            apiRoot               = config.page.discussionApiRoot,
            user                  = Id.getUserFromCookie(),
            self;

        return {
            init: function() {
                if (config.page.commentable === true &&
                    (config.switches.discussion === true || userPrefs.isOn('discussion-dev'))) {

                        self = this;
                        self.discussionUrl           = '/discussion' + discussionId;
                        self.discussionCountUrl      = "/discussion/comment-counts.json?shortUrls=" + discussionId;
                        self.discussionContainerNode = context.querySelector(discussionContainer);
                        self.articleContainerNode    = context.querySelector(articleContainer);
                        self.mediaPrimaryNode        = context.querySelector(mediaPrimary);
                        self.discussionClosed        = (self.discussionContainerNode.getAttribute('data-discussion-closed') === 'true');
                        self.showCommentBox          = (!self.discussionClosed && user);

                        if (self.discussionContainerNode.isInitialised) {
                            return;
                        } else {
                            self.discussionContainerNode.isInitialised = true;
                        }

                        self.getCommentCount(function(commentCount) {
                            if (commentCount > 0) {
                                // Remove non-JS links
                                common.$g('.js-show-discussion, .js-show-discussion a').attr('href', '#comments');

                                self.insertCommentCounts(commentCount);
                                self.bindEvents();
                                self.bindTracking();
                            }
                        });
                }

            },

            insertCommentCounts: function(commentCount) {
                var commentCountLabel = (commentCount === 1) ? 'comment' : 'comments',
                    html = '<a href="#comments" class="js-show-discussion commentcount tone-colour" data-link-name="Comment count">' +
                           '  <i class="i"></i>' + commentCount +
                           '  <span class="commentcount__label">'+commentCountLabel+'</span>' +
                           '</a>';

                context.querySelector(".js-commentcount__number").innerHTML = commentCount;
                bonzo(context.querySelectorAll('.js-comment-count')).html(html);
            },

            getCommentCount: function(callback) {
                ajax({
                    url: self.discussionCountUrl,
                    type: 'json',
                    method: 'get',
                    crossOrigin: true,
                    success: function(response) {
                        if(response && response.counts &&response.counts.length) {
                            callback(response.counts[0].count);
                        }
                    }
                });
            },

            loadDiscussion: function(page) {
                if (loadingInProgress) { return; }
                loadingInProgress = true;

                page = page || 1;

                if (currentPage === 0) {
                    // first load
                    self.discussionContainerNode.innerHTML = loadingCommentsHtml;
                }

                ajax({
                    url: self.discussionUrl + '.json?page=' + page,
                    type: 'json',
                    method: 'get',
                    crossOrigin: true,
                    success: function(response) {
                        if (currentPage === 0) {
                            self.discussionContainerNode.innerHTML = response.html + actionsTemplate;
                            self.showMoreBtnNode = context.querySelector('.js-show-more-comments');
                        } else {
                            var newComments = bonzo.create(response.html)[0].querySelector('.d-thread').innerHTML; // TODO: Check performance of this
                            bonzo(self.discussionContainerNode.querySelector('.d-thread')).append(newComments);
                            self.showMoreBtnNode.innerText = 'Show more comments';
                        }

                        self.showOnlyFirstReplies();

                        // Hide the 'Show more button' if there's no more messages on the server
                        self.showMoreBtnNode.style.display = (response.hasMore === true) ? 'block' : 'none';

                        currentPage = response.currentPage;

                        common.mediator.emit('fragment:ready:dates', self.discussionContainerNode);
                        loadingInProgress = false;

                        // We do this onload here as to only jump the page around once
                        if (config.switches.discussionPostComment && !commentsHaveLoaded) {
                            if (!self.showCommentBox) {
                                self.renderCommentBar();
                            } else {
                                self.getCommentBox();
                            }
                        }

                        RecommendComments.init(context, { apiRoot: apiRoot });
                        commentsHaveLoaded = true;
                    },
                    error: function() {
                        self.discussionContainerNode.innerHTML = '<div class="preload-msg">Error loading comments' +
                                                                 '  <button class="cta js-show-discussion" data-link-name="Try loading comments again" data-is-ajax>Try again</button>' +
                                                                 '</div>';
                        loadingInProgress = false;
                    }
                });
            },

            showOnlyFirstReplies: function(numToShow) {
                numToShow = numToShow || initialResponses;

                Array.prototype.forEach.call(context.querySelectorAll('.d-thread .d-thread'), function(threadNode) {
                    if (threadNode._processed === true) {
                        // Don't process this thread more than once
                        // This happens when another page is loaded
                        return;
                    }

                    var totalResponses = parseInt(threadNode.getAttribute('data-responses'), 10);

                    threadNode._processed = true;
                    threadNode._responses = totalResponses;
                    threadNode._visibleResponses = numToShow;

                    bonzo(threadNode.querySelectorAll('.d-comment:nth-child(n+'+(numToShow+1)+')')).attr('hidden','hidden');

                    var moreCommentsNum = responsesIncrement;// The amount of comments the CTA will reveal

                    if (totalResponses <= (threadNode._visibleResponses + responsesIncrement)) {
                        // If the number of hidden responses is less than the
                        // increment, we just show all of them
                        moreCommentsNum = totalResponses - threadNode._visibleResponses;
                    }

                    if (moreCommentsNum > 0) {
                        // Show the CTA only if there's more to reveal
                        bonzo(threadNode).append('<button class="cta js-show-more-replies" data-link-name="Show more replies" data-is-ajax>'+
                                                   self.buildShowMoreLabel(moreCommentsNum) +
                                                 '</button>');
                    }
                });

            },

            renderCommentBar: function() {
                var $discussionElem = bonzo(this.discussionContainerNode),
                    $showMoreBtnElem = bonzo(this.showMoreBtnNode),
                    showElem;

                if (self.discussionClosed) {
                    showElem = '<div class="d-bar d-bar--closed">This discussion is closed for comments.</div>';
                    $discussionElem.prepend(showElem);
                    return;
                }

                else if (!user) {
                    var url = config.page.idUrl +'/{1}?returnUrl='+ window.location.href;
                    showElem = '<div class="d-bar d-bar--signin">Open for comments. <a href="'+ url.replace('{1}', 'signin') +'">Sign in</a> or <a href="'+ url.replace('{1}', 'register') +'">create your Guardian account</a> to join the discussion.</div>';
                    $discussionElem.prepend(showElem);
                    $showMoreBtnElem.after(showElem);
                    return;
                }
            },

            getCommentBox: function() {
                var url = config.page.discussionApiRoot + '/profile/' + user.id;
                ajax({
                    url: url,
                    crossOrigin: true,
                    type: 'json',
                    data: {
                        GU_U: Id.getCookie()
                    }
                }).then(self.renderCommentBoxes);
            },

            renderCommentBoxes: function(resp) {
                // The user is logged in
                if (resp.status !== 'ok' || !resp.userProfile.privateFields) {
                    // the user shouldn't have reached this method
                    return;
                }
                var topBox, bottomBox,
                    userFields = resp.userProfile.privateFields,
                    tmplId = userFields.canPostComment ? 'tmpl-comment-box' : 'tmpl-cannot-comment',
                    html = document.getElementById(tmplId).innerHTML,
                    $discussionElem = bonzo(self.discussionContainerNode),
                    $topBoxElem = bonzo(bonzo.create(html)),
                    $bottomBoxElem = bonzo(bonzo.create(html));

                // This comes in useful later
                user.privateFields = userFields;
                user.avatar = resp.userProfile.avatar;

                if (!userFields.isPremoderated) {
                    bonzo($topBoxElem[0].querySelector('.d-comment-box__premod')).remove();
                    bonzo($bottomBoxElem[0].querySelector('.d-comment-box__premod')).remove();
                }

                $discussionElem.before($topBoxElem);
                bonzo(self.showMoreBtnNode).after($bottomBoxElem);

                topBox = new CommentBox(context, common.mediator, {
                    apiRoot: apiRoot,
                    discussionId: discussionId,
                    condensed: true
                });
                topBox.attachTo($topBoxElem[0]);
                topBox.on('post:success', self.addComment.bind(self, false));

                bottomBox = new CommentBox(context, common.mediator, {
                    apiRoot: apiRoot,
                    discussionId: discussionId
                });
                bottomBox.attachTo($bottomBoxElem[0]);
                bottomBox.on('post:success', self.addComment.bind(self, true));
            },

            addComment: function(takeToTop, resp) {
                // TODO (jamesgorrie): this is weird, but we don't have templating
                var discussionContainerNode = self.discussionContainerNode[0],
                    $thread = bonzo(qwery('.d-thread', discussionContainerNode)),
                    $comment = bonzo(qwery('.d-comment', discussionContainerNode)).clone().removeClass('d-comment--blocked')[0],
                    $actions = bonzo($comment.querySelector('.d-comment__actions')),
                    $datetime = bonzo($comment.querySelector('time')),
                    $author = bonzo($comment.querySelector('.d-comment__author')),
                    $body = bonzo($comment.querySelector('.d-comment__body')),
                    $avatar = bonzo($comment.querySelector('.d-comment__avatar'));

                $comment.id = 'comment-'+ resp.id;
                $author.html(user.displayName);
                $datetime.html('Just now');

                $body.html('<p>'+ resp.body.replace('\n\n', '</p><p>') +'</p>');
                $thread.prepend($comment);

                if (takeToTop) {
                    window.location.hash = '';
                    window.location.hash = 'comment-'+ resp.id;
                }

                // This is stored in the DOM like so
                // To spare us another call to the discussion API
                $avatar[0].src = user.avatar;
            },

            showMoreReplies: function(el) {
                var threadNode = el.parentNode,
                    totalResponses = threadNode._responses,
                    visibleResponses = threadNode._visibleResponses + responsesIncrement;

                Array.prototype.forEach.call(threadNode.querySelectorAll('.d-comment'), function(commentNode, i) {
                    if (i < visibleResponses) {
                        commentNode.removeAttribute('hidden');
                    }
                });

                threadNode._visibleResponses = visibleResponses;

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

            bindTracking: function() {
                tracking.init();
            },

            bindEvents: function() {
                // Setup events
                bean.on(context, 'click', '.js-show-discussion', function(e) {

                    bonzo(context.querySelector('.d-show-cta')).addClass('u-h');
                    bonzo(self.mediaPrimaryNode).addClass('media-primary--comments-on');

                    if (!commentsHaveLoaded) {
                        // Don't request again if we've already done it
                        self.loadDiscussion();
                    }

                    common.mediator.emit('modules:discussion:show');
                    location.hash = 'comments';
                });

                bean.on(context, 'click', '.js-show-article', function(e) {

                    bonzo(context.querySelector('.d-show-cta')).removeClass('u-h');
                    bonzo(self.mediaPrimaryNode).removeClass('media-primary--comments-on');

                    location.hash = 'article';
                });

                bean.on(context, 'click', '.js-show-more-comments', function(e) {
                    self.showMoreBtnNode.innerText = "Loading…";
                    self.loadDiscussion(currentPage + 1);
                });

                bean.on(context, 'click', '.js-show-more-replies', function(e) {
                    self.showMoreReplies(e.currentTarget);
                });


                // Go straight to comments if the link has #comments
                if (location.hash === '#comments') {
                    bean.fire(context.querySelector('.js-show-discussion'), 'click');
                }

            }
        };

    };

    return Discussion;

});
