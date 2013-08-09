define(['common', 'bean', 'bonzo', 'modules/swipe/affix'], function(common, bean, bonzo, Affix) {

    var SwipeBar = function(options) {
        this.options = common.extend(this.DEFAULTS, options);
        this.el = this.generateTpl();
        this.$el = bonzo(this.el);
        this.body = this.options.context || document.body;
        this.isVisible = false;
        this.btns = [];

        bonzo(document.getElementById('header')).after(this.el);

        this.bindListeners();
        this.affix = new Affix({
            element: this.el,
            offset: {
                top: 58
            }
        });
    };

    SwipeBar.prototype.DEFAULTS = {
        className : 'swipe-bar',
        btnClassName : 'swipe-bar__btn'
    };

    SwipeBar.prototype.generateTpl = function() {
        var wrap = document.createElement('div');
        wrap.className = [this.options.className, 'js-' + this.options.className].join(' ');
        wrap.innerHTML = '<p>foooooo</p>';
        return wrap;
    };

    SwipeBar.prototype.generateBtn = function(dir) {
        var btn = document.createElement('button'),
            btnClassName = this.options.btnClassName;

        btn.className = ['js-' + btnClassName, btnClassName, btnClassName + '--' + dir].join(' ');
        btn.setAttribute('data-direction', dir);
        btn.setAttribute('data-link-name', 'swipe bar ' + dir);
        btn.innerHTML = '<i class="i i-swipe-arrow i-swipe-arrow--' + dir +'">' + titleCase(dir) + '</i>';
        return btn;
    };

    SwipeBar.prototype.show = function() {
        if(!this.isVisible && this.body.className.indexOf('has-gallery') === -1) {
            this.$el.removeClass('is-hidden');
            this.isVisible = true;
        }
    }

    SwipeBar.prototype.hide = function() {
        this.$el.addClass('is-hidden');
        this.isVisible = false;
    };

    SwipeBar.prototype.bindListeners = function() {
//        bean.on(body, 'click', '.js-' + btnClassName, function(e) {
//            var dir = (e.target.getAttribute(dataAttribute) === 'left') ? 'prev' : 'next';
//            common.mediator.emit('module:swipenav:navigate:' + dir);
//        });
//
//        var debouncedHideBtns = common.debounce(function(){
//            hideBtns();
//        }, 1000);
//
//        bean.on(body, 'touchmove', function() {
//            showBtns();
//            debouncedHideBtns();
//        });
    };

    return SwipeBar

});
