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
                common.mediator.emit('modules:togglepanel:toggle', toggler);
            });
        }

    };

    var init = function () {
        var togglers = common.$g('.js-collapsible');
        for (var i=0, l=togglers.length; i<l; i++) {
            model.bindToggler(togglers[i]);
        }
    };

    return {
        init: init
    };

});