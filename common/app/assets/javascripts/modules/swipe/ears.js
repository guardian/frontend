define(['bean'], function(bean) {

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

    function bindListeners(btn) {
        var dir = btn.getAttribute(dataAttribute);
    }

    function appendToDom(frag) {
        body.appendChild(frag);
    }

    module:swipenav:navigate:next

    function init() {
        var frag = document.createDocumentFragment();

        directions.forEach(function(dir) {
            frag.appendChild(generateBtn(dir));
        });

        appendToDom(frag);
        bindListeners =
    }

    return {
        init: init
    };

});
