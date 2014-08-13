define([
    'bean',
    'bonzo',
    'common/utils/$'
], function(
    bean,
    bonzo,
    $
){
    var fauxBlockLink = function(context) {
        bean.on(
            context,
            'mouseenter',
            '.u-faux-block-link__overlay',
            function(e) {
                $(e.currentTarget).parent().addClass('u-faux-block-link--hover');
            }
        );
        bean.on(
            context,
            'mouseleave',
            '.u-faux-block-link__overlay',
            function(e) {
                $(e.currentTarget).parent().removeClass('u-faux-block-link--hover');
            }
        );
    };
    return fauxBlockLink;
});