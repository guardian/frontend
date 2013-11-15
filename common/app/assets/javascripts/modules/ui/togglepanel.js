define(['common', 'bonzo', 'bean'], function (common, bonzo, bean) {

    var view = {
        toggle: function (toggler) {
            var iconElm = common.$g('i', toggler);
            var elmId = toggler.getAttribute('data-toggle-panel');
            var elmToToggle = common.$g('#' + elmId);

            if (elmToToggle) {
                bonzo(iconElm).toggleClass('i-filter-arrow-down i-filter-arrow-up');

                bonzo(elmToToggle).toggleClass('js-hidden');
            }
        }
    };

    var model = {

        bindToggler: function (toggler) {
            bean.add(toggler, 'click', function () {
                view.toggle(toggler);
            });
        }

    };

    var init = function (context) {
        Array.prototype.forEach.call(context.querySelectorAll('.js-collapsible'), function(toggler) {
            model.bindToggler(toggler);
        });
    };

    return {
        init: init
    };

});