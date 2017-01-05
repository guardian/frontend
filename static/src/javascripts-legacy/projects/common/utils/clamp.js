define([
    'bonzo',
    'bean'
], function (
    bonzo,
    bean
) {

    var clamp = function (elem, lines, showMore) {
        var height = elem.clientHeight,
            lineHeight = getComputedStyle(elem).getPropertyValue('line-height'),
            maxHeight = (parseInt(lineHeight, 10) + (showMore ? 2 : 0)) * lines,
            $fade = bonzo(bonzo.create('<span class="clamp-fade"></span>')),
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
            $showMore = bonzo(bonzo.create('<span class="clamp-fade__content u-fauxlink" role="button">Read more</span>'));
            $fade.append($showMore);
            bean.on($showMore[0], 'click', function () {
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
