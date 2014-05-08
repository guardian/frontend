/*
    Module: autoupdate.js
    Description: Used to load update fragments of the DOM from specfied endpoint
*/
define([
    'common/utils/mediator',
    'common/utils/ajax',
    'common/$',
    'bonzo',
    'bean',
    'common/modules/userPrefs',
    'common/utils/detect',
    'common/modules/live/notification-bar',
    'lodash/objects/assign',
    'common/modules/article/twitter'
], function (
    mediator,
    ajax,
    $,
    bonzo,
    bean,
    userPrefs,
    detect,
    NotificationBar,
    extend,
    twitter
) {
    /*
        @param {Object} options hash of configuration options:
            path             : {String}              Endpoint path to ajax request,
            delay            : {Number}              Timeout in milliseconds to query endpoint,
            attachTo         : {DOMElement|Object}   DOMElement or list of elements insert response into
            switches         : {Object}              Global switches object
            loadOnInitialise : {Number}              Make the first request when the module is created
            manipulationType : {String}              Which manipulation method used to insert content into DOM
    */
    function Autoupdate(config) {

        var options = extend({
            'activeClass': 'is-active',
            'btnClass' : '.js-auto-update',
            'manipulationType' : 'html'
        }, config);

        this.unreadBlocks = 0;
        this.notification = '<';

        this.template =
            '  <button class="u-button-reset live-toggler live-toggler--autoupdate live-toggler--on js-auto-update js-auto-update--on"' +
            '          data-action="off" data-link-name="autoupdate off" title="Turn auto update off">' +
            '    <span class="live-toggler__label">Auto update:</span>' +
            '    <span class="u-h">is</span>' +
            '    <span class="live-toggle__value">On</span>' +
            '    <span class="u-h">(turn off)</span>' +
            '  </button>' +
            '  <button class="u-button-reset live-toggler live-toggler--autoupdate live-toggler--off js-auto-update js-auto-update--off"' +
            '          data-action="on" data-link-name="autoupdate on" title="Turn auto update on">' +
            '    <span class="live-toggler__label">Auto update:</span>' +
            '    <span class="u-h">is</span>' +
            '    <span class="live-toggle__value">Off</span>' +
            '    <span class="u-h">(turn on)</span>' +
            '  </button>';

        // View
        this.view = {
            render: function (res) {
                var attachTo = options.attachTo,
                    manipulation = options.manipulationType,
                    date = new Date().toString(),
                    $attachTo = bonzo(attachTo),
                    elementsToAdd = $.create('<div>' + res.html + '</div>')[0];

                this.unreadBlocks += elementsToAdd.children.length;

                if (manipulation === 'prepend') {
                    bonzo(elementsToAdd.children).addClass('autoupdate--hidden');
                }

                $attachTo[manipulation](elementsToAdd.innerHTML);
                // add a timestamp to the attacher
                $attachTo.attr('data-last-updated', date);
                twitter.enhanceTweets();

                if(this.isUpdating) {
                    this.notificationBar.setState('hidden');
                    this.view.revealNewElements.call(this);
                } else if(this.unreadBlocks > 0) {
                    this.notificationBar.notify(this.unreadBlocks);
                    mediator.emit('modules:autoupdate:unread', this.unreadBlocks);
                }
                mediator.emit('modules:autoupdate:render');
            },

            toggle: function (btn) {
                var action = btn.getAttribute('data-action');

                $(options.btnClass).removeClass(options.activeClass);
                $('.js-auto-update--' + action, btn.parentNode).addClass(options.activeClass);

                this[action]();
            },

            destroy: function () {
                $('.update').remove();
                mediator.emit('modules:autoupdate:destroyed');
            },

            revealNewElements: function() {
                var $newElements = $('.autoupdate--hidden', options.attachTo);
                $newElements.addClass('autoupdate--highlight').removeClass('autoupdate--hidden');

                // Do not reset the unread count when page isn't visible. The notification count will then show the
                // number of blocks loaded since the last reader view.
                if (detect.pageVisible()) {
                    this.unreadBlocks = 0;
                }
                mediator.emit('modules:autoupdate:unread', this.unreadBlocks);

                setTimeout(function() {
                    $newElements.removeClass('autoupdate--highlight');
                }, 5000);
            }
        };

        // Model
        this.load = function () {
            var that = this,
                path = (typeof options.path === 'function') ? options.path() : options.path + '.json';

            return ajax({
                url: path,
                type: 'json',
                crossOrigin: true
            }).then(
                function(response) {
                    if(response.refreshStatus === false) {
                        that.off();
                        that.view.destroy();
                    } else {
                        that.view.render.call(that, response);
                        mediator.emit('modules:autoupdate:loaded', response);
                    }
                },
                function(req) {
                    mediator.emit('module:error', 'Failed to load auto-update: ' + req.statusText, 'common/modules/autoupdate.js');
                }
            );
        };

        this.on = function () {
            var that = this;

            this.nextReload = new Date().getTime() + options.delay;
            this.isUpdating = true;

            if(this.interval) { window.clearInterval(this.interval); }
            this.interval = window.setInterval(function() {
                that.load.call(that);
                that.nextReload = new Date().getTime() + options.delay;
            }, options.delay);
        };

        this.off = function () {
            this.isUpdating = false;
        };

        // Initialise
        this.init = function () {
            if (options.switches && options.switches.autoRefresh !== true) {
                return;
            }

            var that = this;

            this.notificationBar = new NotificationBar({attachTo: $('.js-update-notification')[0] });

            $(options.attachTo).addClass('autoupdate--has-animation');

            detect.initPageVisibility();

            mediator.on('modules:detect:pagevisibility:visible', function() {
                if(this.isUpdating) { that.view.revealNewElements(); }
            });

            mediator.on('modules:notificationbar:show', this.view.revealNewElements.bind(this));

            // add the component to the page, and show it
            $('.update').html(this.template).removeClass('u-h');

            this.btns = $(options.btnClass);

            this.btns.each(function (btn) {
                bean.add(btn, 'click', function (e) {
                    e.preventDefault();
                    that.view.toggle.call(that, this);
                });
            });

            this.view.toggle.call(this, this.btns[1]);
        };

    }

    return Autoupdate;

});
