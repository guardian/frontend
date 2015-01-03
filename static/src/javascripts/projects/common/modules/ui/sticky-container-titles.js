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

    var vPosNow = window.scrollY,
        vPosCache,
        winHeight,

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
        return window.innerHeight || document.documentElement.clientHeight;
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
        var winBottom;

        vPosNow = window.scrollY;

        if (vPosCache !== vPosNow) {
            vPosCache = vPosNow;
            winBottom = winHeight + vPosNow;

            if (winHeight - stickyTitlesContainer.offset().height < headerOnePosition - vPosNow + titleOneHeight + 100) {
                stickyTitlesContainer.removeClass('fixed');
            } else {
                stickyTitlesContainer.addClass('fixed');
            }

            stickyTitles.forEach(function (title, i) {
                var headerPosition = headerPositions[i] - 5,
                    offset = offsets[i];

                if (headerPosition > winBottom - offset / 3) {
                    title.removeClass('onscreen');
                    title.show();
                } else if (headerPosition > winBottom - offset) {
                    title.addClass('onscreen');
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
                '<div class="fc-container__header__title--stickies" data-link-name="LHC titles">' +
                    headers.map(function (header, i) {
                        var title = $('.fc-container__header__title > *', header).text();

                        return '<div class="fc-container__header__title--sticky"><button data-link-name="' + i + ' | ' + title + '">' + title + '</button></div>';
                    }).join('') +
                '</div>'
            );

            stickyTitlesContainer = $('.fc-container__header__title--stickies', headerOne);

            stickyTitles = _.toArray($('.fc-container__header__title--sticky', stickyTitlesContainer));

            _.reduceRight(stickyTitles, function (m, title, i) {
                var height = title.offsetHeight + m;

                title.addEventListener('click', function () { window.scrollTo(0, headerPositions[i] - 15); });
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
