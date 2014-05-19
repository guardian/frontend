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
        button: '.dropdown__button',
        content: '.dropdown__content'
    };
    function init() {

        if(!$(s.container).length) { return false; }

        function ancestor(el, c) {
            if (!el.parentNode || bonzo(el.parentNode).hasClass(c.substring(1))) {
                return el.parentNode;
            } else {
                ancestor(el.parentNode, c);
            }
        }
        bean.on(context, 'click', s.button, function(e) {
            bonzo(ancestor(e.currentTarget, s.container))
                .toggleClass('dropdown--active')
                .each(function(d) {
                    var v = bonzo(d).hasClass('dropdown--active');
                    $(s.content, d).attr('aria-hidden', !v);
                    $(s.content, d).attr('aria-expanded', v);
                });
        });
    }

    return {
        init: init
    };
});
