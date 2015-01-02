define([
    'common/utils/$',
    'common/utils/_',
    'common/utils/detect',
    'common/utils/mediator'
], function (
    $,
    _,
    detect,
    mediator
    ) {

    var w = window,
        d = document,
        e = d.documentElement,
        winHeight,

        vPosNow = w.scrollY,
        vPosCache,

        headers,
        headerPositions = [],

        headerOne,
        headerOnePosition,

        titleOneHeight,

        stickyTitles,
        stickyTitlesContainer,

        offsets = [],
        lastIndex = -1;

    function getWindowHeight() {
        return w.innerHeight || e.clientHeight;
    }

    function getPosition(el) {
        return vPosNow + el.getBoundingClientRect().top;
    }

    function getMetrics() {
        if (headerPositions[lastIndex] !== getPosition(headers[lastIndex])) {
            headerPositions = headers.map(getPosition);
            winHeight = getWindowHeight();
            headerOnePosition = getPosition(headerOne);
        }
    }

    function setPositions() {
        vPosNow = w.scrollY;

        if (vPosCache !== vPosNow) {
            vPosCache = vPosNow;

            if (winHeight - stickyTitlesContainer.offset().height < headerOnePosition - vPosNow + titleOneHeight + 100) {
                stickyTitlesContainer.removeClass('fixed');
            } else {
                stickyTitlesContainer.addClass('fixed');
            }

            stickyTitles.forEach(function (title, i) {
                if (headerPositions[i] > winHeight + vPosNow - offsets[i]) {
                    title.show();
                } else {
                    title.hide();
                }
            });
        }
    }

    function init() {
        if (['leftCol', 'wide'].indexOf(detect.getBreakpoint(true)) > -1) {
            headers = _.chain($('section:not(.fc-container--thrasher) .js-container__header'))
                .filter(function (section) { return $('.fc-container__header__title', section).text(); })
                .value();

            headerOne = headers.splice(0, 1)[0];

            lastIndex = headers.length - 1;

            titleOneHeight = $('.fc-container__header__title', headerOne).offset().height;

            $(headerOne).append(
                '<div class="fc-container__header__title--stickies">' +
                    headers.map(function (header) {
                        return '<div class="fc-container__header__title--sticky">' + $('.fc-container__header__title', header).text() + '</div>';
                    }).join('') +
                '</div>'
            );

            stickyTitlesContainer = $('.fc-container__header__title--stickies', headerOne);

            stickyTitles = _.toArray($('.fc-container__header__title--sticky', stickyTitlesContainer));

            _.reduceRight(stickyTitles, function (m, title, i) {
                var height = title.offsetHeight + m;

                title.addEventListener('click', function (e) {
                    w.scrollTo(0, headerPositions[i]);
                    e.preventDefault();
                });

                offsets[i] = height;
                return height;
            }, 0);

            stickyTitles = stickyTitles.map(function (el) { return $(el); });

            getMetrics();
            setInterval(getMetrics, 500);

            setPositions();
            mediator.on('window:scroll', _.throttle(setPositions, 10));

            stickyTitlesContainer.css('visibility', 'visible');
        }
    }

    return {
        init: _.once(init)
    };
});
