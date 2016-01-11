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
    'common/modules/ui/sticky',
    'common/utils/scroller',
    'lodash/collections/toArray',
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
    RelativeDates,
    NotificationCounter) {

    function AutoUpdate(opts) {
        var options = assign({
            'backoff':          1, // 1 = no backoff
            'backoffMax':       1000 * 60 * 20 // 20 mins
        }, opts);

        this.updateDelay = 10000;
        var that = this;

        this.init = function () {
            that.$liveblogBody = $('.js-liveblog-body');
            that.$updateBox = $('.js-updates-button');
            that.$updateBoxContainer = $('.blog__updates-box-container');
            that.$updateBoxText = $('.blog__updates-box-text', this.$updateBox);

            that.$liveblogBody.addClass('autoupdate--has-animation');

            //this.latestBlockId = this.$liveblogBody.data('most-recent-block');
            that.penultimate = $($('.block')[0]).attr('id'); // TO REMOVE AFTER TESTING
            that.latestBlockId = this.penultimate;
            that.requiredOffset = 12;

            that.checkForUpdates();

            new NotificationCounter().init();
            new Sticky(qwery('.blog__updates-box-tofix'), { top: this.requiredOffset, emit: true }).init();

            bean.on(document.body, 'click', '.js-updates-button', function () {
                that.button.onClick();
            }.bind(this));

            mediator.on('modules:liveblog-updates-button:unfixed', function () {
                that.$updateBox.addClass('loading');
                that.blocks.injectNew();
            }.bind(this));
        };

        this.checkForUpdates = function () {
                return ajax({
                    url: window.location.pathname + '.json?lastUpdate=' + ((that.latestBlockId) ? that.latestBlockId : 'block-0'),
                    type: 'json',
                    method: 'get',
                    crossOrigin: true
                }).then(function (resp) {
                    mediator.emit('modules:autoupdate:unread', resp.numNewBlocks);
                    if (resp.numNewBlocks > 0) {
                        var lbOffset = that.$liveblogBody.offset().top,
                            scrollPos = window.scrollY;

                        //if top of the liveblog is in or below the viewport, then inject the new posts in without Toast
                        if (scrollPos < lbOffset) {
                            that.blocks.injectNew();
                        } else {
                            that.button.refresh(resp.numNewBlocks);
                        }
                    }
                }).then(function () {
                    setTimeout(that.checkForUpdates, that.updateDelay);
                });
        };

        this.blocks = {
            injectNew: function () {
                return ajax({
                    url: window.location.pathname + '.json?lastUpdate=' + ((that.latestBlockId) ? that.latestBlockId : 'block-0') + '&showBlocks=true',
                    type: 'json',
                    method: 'get',
                    crossOrigin: true
                }).then(function (resp) {
                    if (resp.html) {
                        //clean up blocks before insertion
                        var resultHtml = $.create('<div>' + resp.html + '</div>')[0],
                            elementsToAdd;

                        bonzo(resultHtml.children).addClass('autoupdate--hidden');
                        elementsToAdd = toArray(resultHtml.children);

                        //insert new blocks and animate
                        $('#' + that.latestBlockId).before(elementsToAdd);
                        $('.autoupdate--hidden', this.$liveblogBody).addClass('autoupdate--highlight').removeClass('autoupdate--hidden');

                        //set the latest block id equal to the first block in the DOM
                        that.latestBlockId = $('.block').first().attr('id');

                        mediator.emit('modules:autoupdate:unread', 0);
                        RelativeDates.init();
                    }
                }).then(function() {
                    that.button.reset();
                });
            }.bind(this)
        };

        this.button = {
            refresh: function (count) {
                var updateText = (count > 1) ? ' new updates' : ' new update';
                that.$updateBox.removeClass('blog__updates-box--closed').addClass('blog__updates-box--open');
                that.$updateBoxText.html(count + updateText);
                that.$updateBoxContainer.addClass('blog__updates-box-container--open');
            }.bind(this),
            reset: function () {
                $('.js-updates-button').removeClass('blog__updates-box--open').removeClass('loading').addClass('blog__updates-box--closed');
                $('.blog__updates-box-container').removeClass('blog__updates-box-container--open');
            }.bind(this),
            onClick: function () {
                scroller.scrollToElement(qwery('.js-blog-blocks'), 300, 'easeOutQuad');
                that.$updateBox.addClass('loading');
                that.blocks.injectNew();
            }.bind(this)
        };
    }

    return AutoUpdate;

});
