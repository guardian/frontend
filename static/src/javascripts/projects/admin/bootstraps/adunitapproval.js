define([
    'common/utils/$',
    'bean'
], function ($, bean) {

    function initialise() {
        $(".select-all-adunits").each(function (elem) {
            bean.on(elem, "click", function () {
                $(".status").each(function (inner) {
                    inner.checked = true;
                });
            })
        });

        $(".deselect-all-adunits").each(function (elem) {
            bean.on(elem, "click", function () {
                $(".status").each(function (inner) {
                    inner.checked = false;
                });
            })
        });

    }

    return {
        init: initialise
    };
});
