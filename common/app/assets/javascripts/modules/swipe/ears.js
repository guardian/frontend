define(['common', 'bean', 'bonzo'], function(common, bean, bonzo) {

    var self = this,
        btnClassName = 'swipe-ear',
        dataAttribute = 'data-direction',
        directions = ['right', 'left'],
        body = document.body,
        isVisible = false,
        btns = [],
        timeout;

    function generateBtn(dir) {
        var btn = document.createElement('button');
        btn.className = ['js-' + btnClassName, btnClassName, btnClassName + '--' + dir, 'is-hidden'].join(' ');
        btn.setAttribute(dataAttribute, dir);
        btn.setAttribute('data-link-name', 'swipe ear ' + dir);
        btn.innerHTML = dir.charAt(0).toUpperCase() + dir.substr(1);
        return btn;
    }

    function showBtns() {
        if(!isVisible) {
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
            console.log(e.target.getAttribute(dataAttribute));
            var dir = (e.target.getAttribute(dataAttribute) === 'left') ? 'prev' : 'next';
            common.mediator.emit('module:swipenav:navigate:' + dir);
        });

        var debouncedHideBtns = common.debounce(function(){
            hideBtns();
        }, 1000);

//        bean.on(window, 'scroll', function() {
//            showBtns();
//            debouncedHideBtns();
//        });

        bean.on(body, 'touchmove', function() {
            console.log('fired');
            showBtns();
            debouncedHideBtns();
        });

//        bean.on(body, 'touchstart', function() {
//            showBtns();
//        });
//
//        bean.on(body, 'touchend', function() {
//            hideBtns();
//        });
    }

    function appendToDom(frag) {
        body.appendChild(frag);
    }

    function init() {
        var frag = document.createDocumentFragment();

        directions.forEach(function(dir) {
            var btn = generateBtn(dir);
            frag.appendChild(btn);
            btns.push(btn);
        });

        appendToDom(frag);
        bindListeners();
    }

    return {
        init: init
    };

});
