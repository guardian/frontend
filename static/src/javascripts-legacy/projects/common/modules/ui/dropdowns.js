define(['lib/$', 'bonzo', 'bean'], function($, bonzo, bean) {
    var s = {
        container: '.dropdown',
        button: '.dropdown__button',
        content: '.dropdown__content',
    };
    function init() {
        bean.on(document.body, 'click', s.button, function(e) {
            var $container = bonzo(
                $.ancestor(e.currentTarget, s.container.substring(1))
            );
            $container.toggleClass('dropdown--active');
            updateAria($container);
        });
    }

    function updateAria($container) {
        $container.each(function(d) {
            var v = bonzo(d).hasClass('dropdown--active');
            $(s.content, d).attr('aria-hidden', !v);
            $(s.button, d).attr('aria-expanded', v);
            $(s.content, d).attr('aria-expanded', v);
        });
    }

    return {
        init: init,
        updateAria: updateAria,
    };
});
