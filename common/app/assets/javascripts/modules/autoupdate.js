define([
    'common',
    'reqwest',
    'bonzo',
    'bean',
    'qwery',
    'modules/userPrefs'
], function (
    common,
    reqwest,
    bonzo,
    bean,
    qwery,
    userPrefs
) {

    function Autoupdate(config) {

        var options = common.extend({
            'activeClass': 'is-active',
            'btnClass' : '.update-btn',
            'prefName': 'auto-update'
        }, config);

        this.template =
            '<p class="update-text type-4">Auto update</p>' +
            '<button class="update-btn type-6" data-action="on" data-link-name="autoupdate on">On</button>' +
            '<button class="update-btn type-6" data-action="off" data-link-name="autoupdate off">Off</button>';

        // View
        this.view = {
            render: function (html) {
                var attachTo = options.attachTo;
                attachTo.innerHTML = html;
                // add a timestamp to the attacher
                bonzo(attachTo).attr('data-last-updated', new Date().toString());
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
            var path = options.path,
                that = this;

            return reqwest({
                url: path,
                type: 'jsonp',
                jsonpCallback: 'callback',
                jsonpCallbackName: 'autoUpdate',
                success: function (response) {
                    if(response.refreshStatus === false) {
                        that.off();
                        that.view.destroy();
                    } else {
                        common.mediator.emit('modules:autoupdate:loaded', [response.html]);
                    }
                },
                error: function () {
                    common.mediator('module:error', 'Failed to load auto-update:' + options.path, 'autoupdate.js');
                }
            });
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

        // Bindings
        common.mediator.on('modules:autoupdate:loaded', this.view.render);

        //Initalise
        this.init = function () {
            if (options.switches && options.switches.autoRefresh !== true) {
                return;
            }
            
            var that = this,
                pref = this.getPref();
            
            // add the component to the page
            qwery('.update')[0].innerHTML = this.template;
            
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
                this.view.toggle.call(this, this.btns[1]);
            } else {
                this.view.toggle.call(this, this.btns[0]);
            }
        };

    }
    
    return Autoupdate;

});