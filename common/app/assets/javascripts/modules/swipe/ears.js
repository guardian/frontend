define(['common', 'bean', 'bonzo'], function(common, bean, bonzo) {

    var btnClassName = 'swipe-ear',
        dataAttribute = 'data-direction',
        directions = ['right', 'left'],
        body = document.body,
        isVisible = false,
        btns = [];

    function titleCase(str) {
        return str.charAt(0).toUpperCase() + str.substr(1);
    }

    function generateBtn(dir) {
        var btn = document.createElement('button');
        btn.className = ['js-' + btnClassName, btnClassName, btnClassName + '--' + dir, 'is-hidden'].join(' ');
        btn.setAttribute(dataAttribute, dir);
        btn.setAttribute('data-link-name', 'swipe ear ' + dir);
        btn.innerHTML = '<i class="i i-swipe-arrow i-swipe-arrow--' + dir +'">' + titleCase(dir) + '</i>';
        return btn;
    }

    function showBtns() {
        if(!isVisible && document.body.className.indexOf('has-gallery') === -1) {
            btns.forEach(function(el){ bonzo(el).removeClass('is-hidden'); });
            isVisible = true;
        }
    }

    function hideBtns() {
        btns.forEach(function(el){ bonzo(el).addClass('is-hidden'); });
        isVisible = false;
    }

    function bindListeners() {
        bean.on(body, 'click', '.js-' + btnClassName, function(e) {
            var dir = (e.target.getAttribute(dataAttribute) === 'left') ? 'prev' : 'next';
            common.mediator.emit('module:swipenav:navigate:' + dir);
        });

        var debouncedHideBtns = common.debounce(function(){
            hideBtns();
        }, 500);

        bean.on(body, 'touchmove', function() {
            showBtns();
            debouncedHideBtns();
        });

    }

    function init() {
        var frag = document.createDocumentFragment();

        directions.forEach(function(dir) {
            var btn = generateBtn(dir);
            frag.appendChild(btn);
            btns.push(btn);
        });

        body.appendChild(frag);
        bindListeners();
    }

    return {
        init: init
    };

});
