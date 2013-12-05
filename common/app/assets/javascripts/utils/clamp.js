define(['bonzo', 'bean'], function(bonzo, bean) {

var clamp = function(elem, lines, showMore, showMoreTrackingName) {
    var height = elem.clientHeight,
        lineHeight = getComputedStyle(elem).getPropertyValue('line-height'),
        maxHeight = (parseInt(lineHeight, 10) + (showMore ? 2 : 0)) * lines,
        $fade = bonzo(bonzo.create('<span class="clamp__fade"></span>')),
        $elem = bonzo(elem),
        $showMore;

    if (height < maxHeight) {
        return;
    }
    
    $elem.css({
        maxHeight: maxHeight + 'px',
        overflow: 'hidden'
    });

    $elem.after($fade);

    if (showMore) {
        $showMore = bonzo(bonzo.create(
            '<span class="clamp__fade-content u-fauxlink" role="button"'+
            (showMoreTrackingName ? ' data-link-name="'+ showMoreTrackingName +'"' : '') +
            '>Read more</span>'));
        $fade.append($showMore);
        bean.on($showMore[0], 'click', function(e) {
            $fade.remove();
            $elem.css({
                maxHeight: 'none',
                overflow: 'auto'
            });
        });
    }
};

return clamp;

}); // define