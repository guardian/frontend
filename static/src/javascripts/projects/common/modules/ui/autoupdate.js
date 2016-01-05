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
    /*
        @param {Object} options hash of configuration options:
            path             : {String}              Endpoint path to ajax request,
            delay            : {Number}              Timeout in milliseconds to query endpoint,
            attachTo         : {DOMElement|Object}   DOMElement or list of elements insert response into
            switches         : {Object}              Global switches object
            manipulationType : {String}              Which manipulation method used to insert content into DOM
    */
    function AutoUpdate(opts) {

        var options = assign({
            'backoff':          1, // 1 = no backoff
            'backoffMax':       1000 * 60 * 20 // 20 mins
        }, opts);

        this.notification = '<';
        this.updateDelay = options.delay;

        this.init = function () {
            this.$liveblogBody = $('.js-liveblog-body');
            this.$updateBox = $('.js-updates-button'),
            this.$updateBoxContainer = $('.blog__updates-box-container'),
            this.$updateBoxText = $('.blog__updates-box-text', this.$updateBox);

            this.latestBlockId = this.$liveblogBody.data('most-recent-block');
            this.requiredOffset = (detect.getBreakpoint() === 'mobile' && config.switches.disableStickyNavOnMobile) ? 12 : 60;

            this.$liveblogBody.addClass('autoupdate--has-animation');

            this.penultimate = $($('.block')[1]).attr('id'); // TO REMOVE AFTER TESTING

            this.checkForUpdates();
            new NotificationCounter().init();

            new Sticky(qwery('.blog__updates-box-tofix'), { top: this.requiredOffset, emit: true }).init();

            bean.on(document.body, 'click', '.js-updates-button', function () {
                this.button.onClick();
            }.bind(this));

            mediator.on('modules:liveblog-updates-button:unfixed', function () {
                this.$updateBox.addClass('loading');
                this.blocks.injectNew();
            }.bind(this));
        };

        this.checkForUpdates = function () {
            var that = this;
            setInterval(function () {
                return ajax({
                    url: window.location.pathname + '.json?lastUpdate=' + ((that.latestBlockId) ? that.penultimate : 'block-0'),
                    type: 'json',
                    method: 'get',
                    crossOrigin: true
                }).then(function (resp) {
                    mediator.emit('modules:autoupdate:unread', resp.numNewBlocks);

                    if (resp.numNewBlocks> 0) {
                        var lbOffset = that.$liveblogBody.offset().top,
                            scrollPos = window.scrollY;

                        if (scrollPos < lbOffset && scrollPos + window.innerHeight > lbOffset) {
                            that.blocks.injectNew();
                        } else {
                            that.button.refresh(resp.numNewBlocks);
                        }
                    }
                });
            }, 10000);
        };

        this.blocks = {
            injectNew: function () {
                var that = this;
                return ajax({
                    url: window.location.pathname + '.json?lastUpdate=' + ((that.latestBlockId) ? that.penultimate : 'block-0') + '&showBlocks=true',
                    type: 'json',
                    method: 'get',
                    crossOrigin: true
                }).then(function (resp) {
                    if (resp.html) {
                        var resultHtml = $.create('<div>' + resp.html + '</div>')[0],
                            elementsToAdd;

                        bonzo(resultHtml.children).addClass('autoupdate--hidden');
                        elementsToAdd = toArray(resultHtml.children);

                        $('#' + this.latestBlockId).before(elementsToAdd);
                        this.latestBlockId = $('.block').first().attr('id');

                        mediator.emit('modules:autoupdate:unread', 0);

                        $('.autoupdate--hidden', this.$liveblogBody).addClass('autoupdate--highlight').removeClass('autoupdate--hidden');

                        setTimeout(function () {
                            that.button.reset();
                        }, 600);

                        RelativeDates.init();
                    }
                });
            }.bind(this)
        };

        this.button = {
            refresh: function (count) {
                var updateText = (count > 1) ? ' new updates' : ' new update';
                this.$updateBox.removeClass('blog__updates-box--closed').addClass('blog__updates-box--open');
                this.$updateBoxText.html(count + ' new updates');
                this.$updateBoxContainer.addClass('blog__updates-box-container--open');
            }.bind(this),
            reset: function () {
                $('.js-updates-button').removeClass('blog__updates-box--open').removeClass('loading').addClass('blog__updates-box--closed');
                $('.blog__updates-box-container').removeClass('blog__updates-box-container--open');
            }.bind(this),
            onClick: function () {
                scroller.scrollToElement(qwery('.js-blog-blocks'), 300, 'easeOutQuad');
                this.$updateBox.addClass('loading');
                this.blocks.injectNew();
            }.bind(this)
        };
    }

    return AutoUpdate;

});
