define([
    'common/$',
    'bonzo',
    'bean',
    'common/utils/context'
], function(
    $,
    bonzo,
    bean,
    context
) {
    context = context();
    var s = {
        container: '.dropdown',
        button: '.dropdown__button'
    };
    function init() {
        function ancestor(el, c) {
            if (!el.parentNode || bonzo(el.parentNode).hasClass(c.substring(1))) {
                return el.parentNode;
            } else {
                ancestor(el.parentNode, c);
            }
        }
        bean.on(context, 'click', s.button, function(e) {
            bonzo(ancestor(e.currentTarget, s.container)).toggleClass('dropdown--active');
        });
    }

    return {
        init: init
    };
});
