/*
    Module: autoupdate.js
    Description: Used to load update fragments of the DOM from specfied endpoint
*/
define([
    'common',
    'ajax',
    'bonzo',
    'bean',
    'qwery',
    'modules/userPrefs',
    'modules/detect'
], function (
    common,
    ajax,
    bonzo,
    bean,
    qwery,
    userPrefs,
    detect
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

        var options = common.extend({
            'activeClass': 'is-active',
            'btnClass' : '.js-auto-update',
            'prefName': 'auto-update',
            'manipulationType' : 'html'
        }, config);

        var unread = 0,
            originalPageTitle;

        this.template =
            '<div class="live-widget">' +
            '  <button class="u-button-reset live-toggler live-toggler--autoupdate js-auto-update js-auto-update--on"' +
            '          data-action="off" data-link-name="autoupdate off" title="Turn auto update off">' +
            '    <span class="lt__label">Auto update</span>' +
            '    <span class="h">is</span>' +
            '    <span class="lt__value">On</span>' +
            '    <span class="h">(turn off)</span>' +
            '  </button>' +
            '  <button class="u-button-reset live-toggler live-toggler--autoupdate js-auto-update js-auto-update--off"' +
            '          data-action="on" data-link-name="autoupdate on" title="Turn auto update on">' +
            '    <span class="lt__label">Auto update</span>' +
            '    <span class="h">is</span>' +
            '    <span class="lt__value">Off</span>' +
            '    <span class="h">(turn on)</span>' +
            '  </button>'+
            '</div>';

        // View
        this.view = {
            render: function (res) {
                var attachTo = options.attachTo,
                    manipulation = options.manipulationType,
                    date = new Date().toString();

                //res.html = '<div id="block-'+date+'" class="block">new block</div>';

                //Check if we are handling single fragment
                if(attachTo.nodeType) {
                    var $attachTo = bonzo(attachTo);
                    // in case we don't want to show the full response
                    if (options.responseSelector) {
                        $attachTo[manipulation](common.$g(options.responseSelector, bonzo.create('<div>' + res.html + '<div>')[0]));
                    } else {
                        var elementsToAdd = bonzo.create('<div>' + res.html + '</div>')[0];
                        bonzo(elementsToAdd.children).addClass('autoupdate--new');

                        $attachTo[manipulation](elementsToAdd.innerHTML);

                    }
                    // add a timestamp to the attacher
                    $attachTo.attr('data-last-updated', date);
                //Multiple fragments to update
                } else {
                    var response = bonzo.create('<div>' + res.html + '<div>');
                    for (var view in attachTo) {
                        if(attachTo.hasOwnProperty(view)) {
                            var html = common.$g(options.responseSelector[view], response[0]);
                            bonzo(attachTo[view])[manipulation](html)
                                .attr('data-last-updated', date);
                        }
                    }
                }

                console.log(manipulation);
                if (manipulation === 'prepend') {
                    var newElements = attachTo.querySelectorAll('.autoupdate--new');

                    unread += newElements.length;

                    if (options.showUnreadCounter && unread && !detect.pageVisible()) {
                        this.updatePageTitle(unread);

                    } else {
                        unread = 0;
                        this.restorePageTitle();
                    }


                    if (detect.pageVisible()) {
                        this.revealNewElements();
                    }
                }


                common.mediator.emit('modules:autoupdate:render');
            },

            toggle: function (btn) {
                var action = btn.getAttribute('data-action');

                bonzo(this.btns).removeClass(options.activeClass);

                if(action === 'on') {
                    this.on();
                } else {
                    this.off();
                }

                btn.parentNode.getElementsByClassName('js-auto-update--' + action)[0].className += ' ' + options.activeClass;

                this.setPref(action);
            },

            destroy: function () {
                bonzo('.update').remove();
                common.mediator.emit('modules:autoupdate:destroyed');
            },

            revealNewElements: function() {
                var newElements = options.attachTo.querySelectorAll('.autoupdate--new');
                bonzo(newElements).addClass('autoupdate--highlight');

                setTimeout(function() {
                    bonzo(newElements).removeClass('autoupdate--new')
                        .removeClass('autoupdate--highlight');
                }, 5000);
            },

            updatePageTitle: function(count) {
                document.title = '(' + count + ') ' + originalPageTitle;
            },

            restorePageTitle: function() {
                document.title = originalPageTitle;
            }
        };



        // Model
        this.load = function (url) {
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
                        that.view.render(response);
                        common.mediator.emit('modules:autoupdate:loaded', response);
                    }
                },
                function(req) {
                    common.mediator.emit('module:error', 'Failed to load auto-update: ' + req.statusText, 'modules/autoupdate.js');
                }
            );
        };

        this.on = function () {
            this.off();
            var that = this;

            this.interval = window.setInterval(function() {
                that.load.call(that);
            }, options.delay);
        };

        this.off = function () {
            if(this.interval) { window.clearInterval(this.interval); }
        };

        this.getPref = function () {
            return userPrefs.get(options.prefName);
        };

        this.setPref = function(pref) {
            userPrefs.set(options.prefName, pref);
        };

        // Initialise
        this.init = function () {
            if (options.switches && options.switches.autoRefresh !== true) {
                return;
            }

            var that = this,
                loadOnInitialise = options.loadOnInitialise || false,
                pref = this.getPref();


            if (options.animateInserts) {
                bonzo(options.attachTo).addClass('autoupdate--has-animation');
            }

            // Save original page title
            originalPageTitle = document.title;

            detect.initPageVisibility();

            common.mediator.on('modules:detect:pagevisibility:visible', function() {
                that.view.restorePageTitle();
                that.view.revealNewElements();
            });

            // add the component to the page, and show it
            common.$g('.update').html(this.template).removeClass('hidden');

            this.btns = common.$g(options.btnClass);

            this.btns.each(function (btn) {
                bean.add(btn, 'click', function (e) {
                    e.preventDefault();

                    that.view.toggle.call(that, this);
                });
            });

            if(pref === 'off') {
                this.view.toggle.call(this, this.btns[0]);
            } else {
                this.view.toggle.call(this, this.btns[1]);
            }

            if (loadOnInitialise) {
                that.load.call(that);
            }
        };

    }

    return Autoupdate;

});
