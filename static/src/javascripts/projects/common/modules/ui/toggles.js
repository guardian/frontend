define([
    'bean',
    'bonzo',
    'common/utils/$'
], function (
    bean,
    bonzo,
    $
) {

    var popups = [],
        controls = [];

    function closeAllPopups(e) {
        if (!e || !$.ancestor(e.target, 'popup--persistent')) {
            bonzo(popups).removeClass('popup--open');
            bonzo(controls).removeClass('is-active');
        }
    }

    function initOne(control) {
        controls.push(control);

        var popupClass = bonzo(control).data('toggle'),
            $popupEl = $(popupClass ? '.' + popupClass : ''),
            $control = bonzo(control);

        if ($popupEl.length) {
            popups.push($popupEl[0]);

            bean.on(control, 'click', function (e) {
                e.preventDefault();
                var isOpen = $control.hasClass('is-active'),
                    addOrRemove = isOpen ? 'removeClass' : 'addClass';
                window.setTimeout(function () {
                    $control[addOrRemove]('is-active');
                    $popupEl[addOrRemove]('popup--open');
                }, 0);
            });
        }
    }

    function init() {
        $('[data-toggle]').each(initOne);
        bean.on(document.body, 'click', closeAllPopups);
    }

    return {
        init: init,
        initOne: initOne,
        closeAllPopups: closeAllPopups
    };
});
