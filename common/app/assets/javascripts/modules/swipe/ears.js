define(['common', 'bean'], function(common, bean) {

    var btnClassName = 'swipe-ear',
        dataAttribute = 'data-direction',
        directions = ['right', 'left'],
        body = document.body;

    function generateBtn(dir) {
        var btn = document.createElement('button');
        btn.className = ['js-' + btnClassName, btnClassName, btnClassName + '--' + dir].join(' ');
        btn.setAttribute(dataAttribute, dir);
        btn.innerHTML = dir;
        return btn;
    }

    function bindListeners() {
        bean.on(body, 'click', 'js-' + btnClassName, function(e) {
            var dir = (e.target.getAttribute(dataAttribute) === 'left') ? 'next' : 'prev';
            common.mediator.emit('module:swipenav:navigate:' + dir);
        });
    }

    function appendToDom(frag) {
        body.appendChild(frag);
    }

    function init() {
        var frag = document.createDocumentFragment();

        directions.forEach(function(dir) {
            frag.appendChild(generateBtn(dir));
        });

        appendToDom(frag);
        bindListeners();
    }

    return {
        init: init
    };

});
