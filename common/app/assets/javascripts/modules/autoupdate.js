define(['common', 'reqwest', 'bonzo', 'bean'], function (common, reqwest, bonzo, bean) {

    function Autoupdate(path, delay, attachTo) {



        var options = {
            'activeClass': 'is-active',
            'btnClass' : '.update-btn',
            'prefName': 'auto-update'
        };

        this.path = path;
        this.delay = delay;
        this.attachTo = attachTo;

        // View
        this.view = {
            attachTo: this.attachTo,

            render: function (html) {
                attachTo.innerHTML = html;
                common.mediator.emit('modules:autoupdate:render');
            },

            toggle: function (btn) {
                var action = btn.getAttribute('data-action');

                bonzo(this.btns).removeClass(options.activeClass);

                if(action === 'on') {
                    common.mediator.emit('modules:autoupdate:on');
                } else {
                    common.mediator.emit('modules:autoupdate:off');
                }

                bonzo(btn).addClass(options.activeClass);
                this.setPref(action);
            },

            destroy: function () {
                bonzo('.update').remove();
            }
        };
        
        // Model
        this.load = function (url) {
            var path = this.path;
            return reqwest({
                url: path,
                type: 'jsonp',
                jsonpCallback: 'callback',
                jsonpCallbackName: 'autoUpdate',
                success: function (response) {
                    if(response.refreshStatus === false) {
                        common.mediator.emit('modules:autoupdate:off');
                        common.mediator.emit('modules:autoupdate:destroy');
                    } else {
                        common.mediator.emit('modules:autoupdate:loaded', [response.html]);
                    }
                },
                error: function () {
                    //Log using error module
                }
            });
        };

        this.on = function () {
            this.off();
            var that = this;

            this.interval = window.setInterval(function() {
                that.load.call(that);
            }, this.delay);
        };

        this.off = function () {
            if(this.interval) window.clearInterval(this.interval);
        };

        this.getPref = function () {
            return guardian.userPrefs.get(options.prefName);
        };

        this.setPref = function(pref) {
            guardian.userPrefs.set(options.prefName, pref);
        };

        // Bindings
        common.mediator.on('modules:autoupdate:toggle', this.view.toggle, this);
        common.mediator.on('modules:autoupdate:loaded', this.view.render);
        common.mediator.on('modules:autoupdate:on', this.on, this);
        common.mediator.on('modules:autoupdate:off', this.off, this);
        common.mediator.on('modules:autoupdate:destroy', this.view.destroy);

        //Initalise
        this.init = function () {
            this.btns = common.$g(options.btnClass);

            this.btns.each(function (btn) {
                bean.add(btn, 'click', function (e) {
                    e.preventDefault();

                    var isActive = bonzo(this).hasClass(options.activeClass);
                    if(!isActive) {
                        common.mediator.emit('modules:autoupdate:toggle', this);
                    }
                });
            });

            var pref = this.getPref();

            if(pref === 'off') {
                common.mediator.emit('modules:autoupdate:toggle', this.btns[1]);
            } else {
                common.mediator.emit('modules:autoupdate:toggle', this.btns[0]);
            }
        };

    }
    
    return Autoupdate;

});