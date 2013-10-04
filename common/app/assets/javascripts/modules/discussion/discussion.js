
define([
    'common',
    'bonzo',
    'qwery',
    'bean',
    'ajax',
    'modules/discussion/comment-box',
    'modules/discussion/recommend-comments',
    'modules/userPrefs',
    'modules/analytics/clickstream',
    'modules/inview',
    'modules/detect',
    'modules/id',
], function (
    common,
    bonzo,
    qwery,
    bean,
    ajax,
    CommentBox,
    RecommendComments,
    userPrefs,
    ClickStream,
    Inview,
    Detect,
    Id
    ) {

    var Discussion = function(options) {

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
                                    '<div class="d-actions"><a href="#article" class="top" data-link-name="Discussion: Return to article">Return to article</a></div>',
            clickstream           = new ClickStream({ addListener: false }),
            apiRoot               = config.page.discussionApiRoot,
            user                  = Id.getUserFromCookie(),
            currentUserAvatarUrl,
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
                        self.discussionClosed        = (self.discussionContainerNode.getAttribute('data-discusison-closed') === 'true');
                        self.showCommentBox          = !self.discussionClosed && user;

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
                            }
                        });
                }

            },

            insertCommentCounts: function(commentCount) {
                var commentCountLabel = (commentCount === 1) ? 'comment' : 'comments',
                    html = '<a href="#comments" class="js-show-discussion commentcount" data-link-name="Comment count">' +
                           '  <i class="i i-comment-count-small"></i>' + commentCount +
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
                            self.discussionContainerNode.innerHTML = response.html  + actionsTemplate;
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
                        if (config.switches.discussionPostComment && !commentsHaveLoaded && !self.showCommentBox) {
                            self.renderCommentBar();
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
                var discussionElem = bonzo(this.discussionContainerNode),
                    showMoreBtnElem = bonzo(this.showMoreBtnNode),
                    showElem;

                if (self.discussionClosed) {
                    showElem = '<div class="d-bar d-bar--closed">This discussion is closed for comments.</div>';
                    discussionElem.prepend(showElem);
                    return;
                }

                else if (!user) {
                    var url = config.page.idUrl +'/{1}?returnUrl='+ window.location.href;
                    showElem = '<div class="d-bar d-bar--signin cta">Open for comments. <a href="'+ url.replace('{1}', 'signin') +'">Sign in</a> or <a href="'+ url.replace('{1}', 'register') +'">create your Guardian account</a> to join the discussion.</div>';
                    discussionElem.prepend(showElem);
                    showMoreBtnElem.after(showElem);
                    return;
                }
            },

            getCommentBox: function() {
                ajax({
                    url: '/discussion/comment-box.json'
                }).then(self.renderCommentBoxes);
            },

            renderCommentBoxes: function(resp) {
                var html = resp.html,
                    topBox, bottomBox,
                    discussionElem = bonzo(self.discussionContainerNode),
                    topBoxElem = bonzo(bonzo.create(html)),
                    bottomBoxElem = bonzo(bonzo.create(html));

                discussionElem.before(topBoxElem);
                discussionElem.after(bottomBoxElem);

                topBox = new CommentBox(context, {
                    apiRoot: apiRoot,
                    discussionId: discussionId,
                    condensed: true
                });
                topBox.attachTo(topBoxElem[0]);
                topBox.on('posted', self.addComment.bind(self, false));

                bottomBox = new CommentBox(context, {
                    apiRoot: apiRoot,
                    discussionId: discussionId
                });
                bottomBox.attachTo(bottomBoxElem[0]);
                bottomBox.on('posted', self.addComment.bind(self, true));

                bottomBoxElem.after('<a data-link-name="Comment on desktop" class="d-actions__link" href="/' + config.page.pageId + '?view=desktop#start-of-comments">' +
                    'Want our fully featured commenting experience? Head to our old site.</a>');
            },

            addComment: function(takeToTop, resp) {
                // TODO (jamesgorrie): this is weird, but we don't have templating
                var thread = bonzo(qwery('.d-thread', self.discussionContainerNode)[0]),
                    comment = bonzo(qwery('.d-comment', self.discussionContainerNode)[0]).clone().removeClass('d-comment--blocked'),
                    actions = bonzo(comment[0].querySelector('.d-comment__actions')),
                    datetime = bonzo(comment[0].querySelector('time')),
                    author = bonzo(comment[0].querySelector('.d-comment__author')),
                    body = bonzo(comment[0].querySelector('.d-comment__body')),
                    avatar = bonzo(comment[0].querySelector('.d-comment__avatar'))[0];

                comment[0].id = 'comment-'+ resp.id;
                author.html(user.displayName);
                datetime.html('Just now');

                body.html('<p>'+ resp.body.replace('\n\n', '</p><p>') +'</p>');
                thread.prepend(comment);

                if (takeToTop) {
                    window.location.hash = '';
                    window.location.hash = 'comment-'+ resp.id;
                }

                // avatar oddity as only discussion knows where it lives
                if (currentUserAvatarUrl) {
                    avatar.src = currentUserAvatarUrl;
                } else {
                    avatar.src = 'http://static.guim.co.uk/sys-images/Guardian/Pix/site_furniture/2010/09/01/no-user-image.gif';
                    return ajax({
                        url: apiRoot +'/profile/me',
                        type: 'jsonp',
                        crossOrigin: true,
                        data: { GU_U: Id.getCookie() },
                        headers: { 'D2-X-UID': 'zHoBy6HNKsk' }
                    }).then(function(resp) {
                        currentUserAvatarUrl = resp.userProfile.avatar;
                        avatar.src = currentUserAvatarUrl;
                    });
                }
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


            bindEvents: function() {
                // Setup events
                bean.on(context, 'click', '.js-show-discussion', function(e) {

                    bonzo(context.querySelector('.d-show-cta')).addClass('u-h');
                    bonzo(self.mediaPrimaryNode).addClass('media-primary--comments-on');

                    if (!commentsHaveLoaded) {
                        // Don't request again if we've already done it
                        self.loadDiscussion();
                        if (config.switches.discussionPostComment && self.showCommentBox) {
                            self.getCommentBox();
                        }
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

                // Auto load comments on desktop sizes
                if (/desktop|extended/.test(Detect.getLayoutMode())) {
                    var inview = new Inview('#comments', context);
                    bean.on(context, 'inview', '#comments', function(e) {
                        self.loadDiscussion();
                        bonzo(context.querySelector('.d-show-cta')).addClass('u-h');
                        bonzo(self.mediaPrimaryNode).addClass('media-primary--comments-on');
                    });
                }
            }
        };

    };

    return Discussion;

});
