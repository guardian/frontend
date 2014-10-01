define([
    'bean',
    'bonzo',
    'common/utils/$'
], function(
    bean,
    bonzo,
    $
){
    var fauxBlockLink = function() {
        var overlaySelector = '.u-faux-block-link__overlay',
            hoverStateClassName = 'u-faux-block-link--hover';

        var hoverState = {
            add: function(e) {
                $(e.currentTarget).parent().addClass(hoverStateClassName);
            },
            remove: function(e) {
                $(e.currentTarget).parent().removeClass(hoverStateClassName);
            }
        };

        return {
            init: function() {
                bean.on(document.body, 'mouseenter', overlaySelector, hoverState.add);
                bean.on(document.body, 'mouseleave', overlaySelector, hoverState.remove);
            }
        };
    };

    return fauxBlockLink;
});
