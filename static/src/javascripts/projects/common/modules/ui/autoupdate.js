/*
    Module: autoupdate.js
    Description: Used to load update fragments of the DOM from specfied endpoint
*/
define([
    'bean',
    'bonzo',
    'qwery',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/modules/article/twitter',
    'common/modules/live/notification-bar',
    'lodash/objects/assign',
    'common/modules/ui/simpleSticky',
    'common/utils/scroller',
    'lodash/collections/toArray',
    'lodash/functions/bindAll',
    'common/modules/ui/relativedates',
    'common/modules/ui/notification-counter'
], function (
    bean,
    bonzo,
    qwery,
    $,
    ajax,
    config,
    detect,
    mediator,
    twitter,
    NotificationBar,
    assign,
    Sticky,
    scroller,
    toArray,
    bindAll,
    RelativeDates,
    NotificationCounter) {

    function AutoUpdate() {
        this.updateDelay = 10000;

        this.init = function () {
            this.$liveblogBody = $('.js-liveblog-body');
            this.$updateBox = $('.js-updates-button');
            this.$updateBoxContainer = $('.blog__updates-box-container');
            this.$updateBoxText = $('.blog__updates-box-text', this.$updateBox);

            this.$liveblogBody.addClass('autoupdate--has-animation');

            //this.latestBlockId = this.$liveblogBody.data('most-recent-block');
            this.penultimate = $($('.block')[1]).attr('id'); // TO REMOVE AFTER TESTING
            this.latestBlockId = this.penultimate;
            this.requiredOffset = 12;
            this.isLivePage = !(window.location.href.search('[?&]page=') !== -1);

            this.checkForUpdates();
            detect.initPageVisibility();

            new NotificationCounter().init();
            new Sticky(qwery('.blog__updates-box-tofix'), { top: this.requiredOffset, emit: true }).init();

            bean.on(document.body, 'click', '.js-updates-button', function () {
                if (this.isLivePage) {
                    this.button.livePageOnClick();
                } else {
                    this.button.notLivePageOnClick();
                }
            }.bind(this));

            mediator.on('modules:liveblog-updates-button:unfixed', function () {
                if (this.isLivePage) {
                    this.$updateBox.addClass('loading');
                    this.blocks.injectNew();
                }
            }.bind(this));

            mediator.on('modules:detect:pagevisibility:visible', function () {
                //this.on(); // reset backoff
                this.blocks.revealNewElements();
            }.bind(this));

            bindAll(this, 'checkForUpdates');
        };

        this.checkForUpdates = function () {
            var shouldFetchBlocks = '&showBlocks=' + (this.isLivePage ? 'true' : 'false');
            var latestBlockIdToUse = ((this.latestBlockId) ? this.latestBlockId : 'block-0');

            return ajax({
                url: window.location.pathname + '.json?lastUpdate=' + latestBlockIdToUse + shouldFetchBlocks,
                type: 'json',
                method: 'get',
                crossOrigin: true
            }).then(function (resp) {
                if (resp.numNewBlocks > 0) {
                    var lbOffset = this.$liveblogBody.offset().top,
                        scrollPos = window.scrollY;

                    this.blocks.newBlocks = resp.html;

                    mediator.emit('modules:autoupdate:unread', resp.numNewBlocks);

                    //if top of the liveblog is in or below the viewport, then inject the new posts in without Toast
                    if (scrollPos < lbOffset) {
                        this.blocks.injectNew();
                    } else {
                        this.button.refresh(resp.numNewBlocks);
                    }
                }
            }.bind(this)).then(function () {
                setTimeout(this.checkForUpdates, this.updateDelay);
            }.bind(this));
        };

        this.blocks = {
            newBlocks: '',
            injectNew: function () {
                if (this.blocks.newBlocks) {
                    //clean up blocks before insertion
                    var resultHtml = $.create('<div>' + this.blocks.newBlocks + '</div>')[0],
                        elementsToAdd;

                    bonzo(resultHtml.children).addClass('autoupdate--hidden');
                    elementsToAdd = toArray(resultHtml.children);

                    //insert new blocks and animate
                    $('.blog__updates-box-container').after(elementsToAdd);

                    if (detect.pageVisible()) {
                        this.blocks.revealNewElements();
                    }

                    this.latestBlockId = $('.block').first().attr('id');

                    this.blocks.newBlocks = '';

                    RelativeDates.init();
                    twitter.enhanceTweets();

                    setTimeout(function () {
                        this.button.reset();
                    }.bind(this), 600);
                }
            }.bind(this),
            revealNewElements: function () {
                $('.autoupdate--hidden', this.$liveblogBody).addClass('autoupdate--highlight').removeClass('autoupdate--hidden');
                mediator.emit('modules:autoupdate:unread', 0);
            }.bind(this)
        };

        this.button = {
            refresh: function (count) {
                var updateText = (count > 1) ? ' new updates' : ' new update';
                this.$updateBox.removeClass('blog__updates-box--closed').addClass('blog__updates-box--open');
                this.$updateBoxText.html(count + updateText);
                this.$updateBoxContainer.addClass('blog__updates-box-container--open');
            }.bind(this),
            reset: function () {
                this.$updateBox.removeClass('blog__updates-box--open').removeClass('loading').addClass('blog__updates-box--closed');
                this.$updateBoxContainer.removeClass('blog__updates-box-container--open');
            }.bind(this),
            livePageOnClick: function () {
                scroller.scrollToElement(qwery('.js-blog-blocks'), 300, 'easeOutQuad');
                this.$updateBox.addClass('loading');
                this.blocks.injectNew();
            }.bind(this),
            notLivePageOnClick: function () {
                location.assign(window.location.pathname);
            }
        };
    }

    return AutoUpdate;

});
