define(['common', 'bean', 'bonzo'], function(common, bean, bonzo) {

    var SwipeBar = function(options) {
        this.options = common.extend(this.DEFAULTS, options);
        this.el = this.generateTpl();
        this.$el = bonzo(this.el);
        this.body = this.options.context || document.body;
        this.isVisible = false;
        this.btns = [];

        bonzo(document.getElementById('header')).after(this.el);

        this.bindListeners();
    };

    SwipeBar.prototype.DEFAULTS = {
        className : 'swipe-bar',
        btnClassName : 'swipe-bar__btn',
        countClassName : 'swipe-bar__count'
    };

    SwipeBar.prototype.generateTpl = function() {
        var self = this,
            wrap = document.createElement('div'),
            span = document.createElement('span');

        wrap.className = [this.options.className, 'js-' + this.options.className, 'is-hidden'].join(' ');
        span.className = this.options.countClassName;
        wrap.appendChild(span);
        ['right', 'left'].forEach(function(dir){ wrap.appendChild(self.generateBtn(dir)); });

        return wrap;
    };

    SwipeBar.prototype.generateBtn = function(dir) {
        var btn = document.createElement('button'),
            btnClassName = this.options.btnClassName;

        btn.className = ['js-' + btnClassName, btnClassName, btnClassName + '--' + dir].join(' ');
        btn.setAttribute('data-direction', dir);
        btn.setAttribute('data-link-name', 'swipe bar ' + dir);
        btn.innerHTML = '<i class="i i-swipe-arrow i-swipe-arrow--' + dir +'">' + dir + '</i>';
        return btn;
    };

    SwipeBar.prototype.updateCount = function(data) {
        if(typeof data === 'object' && data.pos && data.len) {
            this.el.querySelector('.' + this.options.countClassName).innerHTML = data.pos + ' of ' + data.len;
        }
    };

    SwipeBar.prototype.show = function() {
        if(!this.isVisible && this.body.className.indexOf('has-gallery') === -1) {
            bean.on(this.body, 'click.swipe.bar', '.js-' + this.options.btnClassName, this.navigate);

            this.$el.removeClass('is-hidden');
            this.isVisible = true;
        }
    };

    SwipeBar.prototype.hide = function(){
        bean.off(this.body, 'click.swipe.bar');
        this.$el.addClass('is-hidden');
        this.isVisible = false;
    };

    SwipeBar.prototype.navigate = function(e) {
        var dir = (e.target.getAttribute('data-direction') === 'left') ? 'prev' : 'next';
        common.mediator.emit('module:swipenav:navigate:' + dir);
    };

    SwipeBar.prototype.bindListeners = function() {
        var self = this;

        common.mediator.on('module:swipenav:position:update', function(data){
            self.updateCount.call(self, data);
        });

        var debouncedHide = common.debounce(function(){
            self.hide();
        }, 1500);

        bean.on(this.body, 'touchstart touchmove', function(){
            common.requestAnimationFrame(function(){
                self.show();
                debouncedHide();
            });
        });
    };

    return SwipeBar;

});
