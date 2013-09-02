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
    'modules/userPrefs'
], function (
    common,
    ajax,
    bonzo,
    bean,
    qwery,
    userPrefs
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
            'btnClass' : '.update-btn',
            'prefName': 'auto-update',
            'iconClass' : 'is-updating',
            'manipulationType' : 'html'
        }, config);

        this.template =
            '<p class="update-text type-6">Auto update</p>' +
            '<i class="'+ options.iconClass + '"/></i>' +
            '<button class="update-btn type-8" data-action="off" data-link-name="autoupdate off">Off</button>' +
            '<button class="update-btn type-8" data-action="on" data-link-name="autoupdate on">On</button>';

        // View
        this.view = {
            render: function (res) {
                var attachTo = options.attachTo,
                    manipulation = options.manipulationType,
                    date = new Date().toString();

                //Check if we are handling single fragment
                if(attachTo.nodeType) {
                    var $attachTo = bonzo(attachTo);
                    // in case we don't want to show the full response
                    if (options.responseSelector) {
                        $attachTo[manipulation](common.$g(options.responseSelector, bonzo.create('<div>' + res.html + '<div>')[0]));
                    } else {
                        $attachTo[manipulation](res.html);
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
                common.mediator.emit('modules:autoupdate:render');
            },

            toggle: function (btn) {
                var action = btn.getAttribute('data-action');

                bonzo(this.btns).removeClass(options.activeClass);
                bonzo(this.icon).removeClass(options.activeClass);

                if(action === 'on') {
                    this.on();
                    bonzo(this.icon).addClass(options.activeClass);
                } else {
                    this.off();
                }

                bonzo(btn).addClass(options.activeClass);
                this.setPref(action);
            },

            destroy: function () {
                bonzo('.update').remove();
                common.mediator.emit('modules:autoupdate:destroyed');
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

            // add the component to the page, and show it
            common.$g('.update').html(this.template).removeClass('hidden');

            this.icon = common.$g('.' + options.iconClass);
            this.btns = common.$g(options.btnClass);

            this.btns.each(function (btn) {
                bean.add(btn, 'click', function (e) {
                    e.preventDefault();

                    var isActive = bonzo(this).hasClass(options.activeClass);
                    if(!isActive) {
                        that.view.toggle.call(that, this);
                    }
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
