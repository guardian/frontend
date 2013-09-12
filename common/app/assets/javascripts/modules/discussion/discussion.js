define([
    'common',
    'bonzo',
    'qwery',
    'bean',
    'ajax',
    'modules/userPrefs',
    'modules/analytics/clickstream'
], function (
    common,
    bonzo,
    qwery,
    bean,
    ajax,
    userPrefs,
    ClickStream
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
            loadingCommentsHtml   = '<div class="preload-msg">Loading comments…<div class="is-updating"></div></div>',
            currentPage           = 0,
            actionsTemplate       = '<button class="js-show-more-comments cta" data-link-name="Show more comments">Show more comments</button>' +
                '<div class="d-actions">' +
                '<a data-link-name="Comment on desktop" class="d-actions__link" href="/' + config.page.pageId + '?view=desktop#start-of-comments">' +
                    'Want to comment? Visit the desktop site</a>' +
                '<button class="top js-top js-show-article" data-link-name="Discussion: Return to article">Return to article</button></div>',
            clickstream           = new ClickStream({ addListener: false }),
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

                        if(self.discussionContainerNode.isInitialised) {
                            return;
                        } else {
                            self.discussionContainerNode.isInitialised = true;
                        }

                        self.getCommentCount(function(commentCount) {
                            if (commentCount > 0) {
                                self.upgradeByline(commentCount);
                                self.bindEvents();
                            }
                        });
                }

            },

            upgradeByline: function(commentCount) {
                var bylineNode = bonzo(context.querySelector('article .byline')),
                    isLive = (config.page.isLive) ? ' d-tabs--is-live' : '',
                    tabsHtml = '<div class="d-tabs' + isLive + '">' +
                                 '<ol class="d-tabs__container unstyled">' +
                                 '  <li class="d-tabs__item d-tabs__item--byline d-tabs__item--is-active js-show-article" data-link-name="Article Tab" data-is-ajax>' +
                                      bylineNode.html() +
                                 '  </li>' +
                                 '  <li class="d-tabs__item d-tabs__item--commentcount js-show-discussion" data-link-name="Discussion Tab">' +
                                 '    <a href="/discussion/'+ discussionId + '" class="d-commentcount speech-bubble" data-is-ajax>' +
                                 '       <span class="u-h">View all </span>' +
                                 '       <span class="js-commentcount__number">' + commentCount + '</span>' +
                                 '       <span class="u-h"> comments</span>' +
                                 '    </a>' +
                                 '  </li>' +
                                 '</ol>' +
                               '</div>';

                if(bylineNode.length) {
                    bylineNode.addClass('byline--cloned').after(tabsHtml);
                } else {
                    bonzo(context.querySelector('.js-article__container')).before(tabsHtml);
                }
                Array.prototype.forEach.call(context.querySelectorAll(".js-commentcount__number"), function(el) {
                    el.innerHTML = commentCount;
                });
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

            jumpToTop: function() {
                var tabsNode = context.querySelector('.d-tabs__container'),
                    topPos   = bonzo(tabsNode).offset().top - tabsNode.offsetHeight;

                window.scrollTo(0, topPos);
            },

            bindEvents: function() {
                // Setup events
                var tabsNode = context.querySelector('.d-tabs__container');

                bean.on(context, 'click', '.js-show-discussion', function(e) {
                    e.preventDefault();

                    //Toggles view for accidental clicks
                    if(self.discussionContainerNode.style.display === 'block' && commentsHaveLoaded) {
                        bean.fire(context.querySelector('.js-show-article'), 'click');
                        return;
                    }

                    bonzo(tabsNode.querySelectorAll('.d-tabs__item')).removeClass('d-tabs__item--is-active');
                    bonzo(tabsNode.querySelector('.d-tabs__item--commentcount')).addClass('d-tabs__item--is-active');

                    bonzo(context.querySelector('.d-show-cta')).addClass('u-h');
                    bonzo(self.mediaPrimaryNode).addClass('media-primary--comments-on');

                    self.discussionContainerNode.style.display = 'block';
                    self.articleContainerNode.style.display = 'none';

                    if (!commentsHaveLoaded) {
                        // Don't request again if we've already done it
                        self.loadDiscussion();
                    }

                    if (e.currentTarget.className.indexOf('js-top') !== -1) {
                        if(document.body.className.indexOf('has-swipe') !== -1) {
                            common.mediator.emit('modules:discussion:show', self.jumpToTop);
                        } else {
                            self.jumpToTop();
                        }
                    }

                    common.mediator.emit('modules:discussion:show');
                    location.hash = 'comments';
                });

                bean.on(context, 'click', '.js-show-article', function(e) {
                    // No preventDefault here, as there may be links in the byline

                    bonzo(tabsNode.querySelectorAll('.d-tabs__item')).removeClass('d-tabs__item--is-active');
                    bonzo(tabsNode.querySelector('.d-tabs__item--byline')).addClass('d-tabs__item--is-active');

                    bonzo(context.querySelector('.d-show-cta')).removeClass('u-h');
                    bonzo(self.mediaPrimaryNode).removeClass('media-primary--comments-on');

                    self.discussionContainerNode.style.display = 'none';
                    self.articleContainerNode.style.display = 'block';

                    if (e.currentTarget.className.indexOf('js-top') !== -1) {
                        if(document.body.className.indexOf('has-swipe') !== -1) {
                            common.mediator.emit('modules:discussion:show', self.jumpToTop);
                        } else {
                            self.jumpToTop();
                        }
                    }

                    // We force analytics on the Article/Byline tab, because
                    // the byline can be a complex mix of multiple <a>'s
                    if (e.target.className.match('.d-tabs__item--byline')) {
                        common.mediator.emit('module:clickstream:click', clickstream.getClickSpec({el: e.target}, true));
                    }

                    location.hash = 'story';
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
