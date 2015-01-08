define([
    'bean',
    'common/utils/$',
    'common/utils/_',
    'common/utils/detect',
    'common/utils/mediator'
], function (
    bean,
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

    function reflow(forced) {
        if (headerPositions[lastIndex] !== getPosition(headers[lastIndex]) || forced) {
            headerPositions = headers.map(getPosition);
            winHeight = getWindowHeight();
            headerOnePosition = getPosition(headerOne);
            setPositions(true);
        }
    }

    function setPositions(forced) {
        var winBottom;

        vPosNow = window.scrollY;

        if (vPosCache !== vPosNow || forced) {
            vPosCache = vPosNow;
            winBottom = winHeight + vPosNow;

            if (winHeight - stickyTitlesContainer.offset().height < headerOnePosition - vPosNow + titleOneHeight + 100) {
                stickyTitlesContainer.removeClass('fixed');
            } else {
                stickyTitlesContainer.addClass('fixed');
            }

            stickyTitles.forEach(function (title, i) {
                if (headerPositions[i] > winBottom - offsets[i] + 7) {
                    title.show();
                } else {
                    title.hide();
                }
            });
        }
    }

    function forceReflow() {
        reflow(true);
    }

    function init() {
        var breakpoint = detect.getBreakpoint(true);

        if (breakpoint === 'leftCol' || breakpoint === 'wide') {
            headers = _.chain($('section:not(.fc-container--thrasher) .js-container__header'))
                .filter(function (section) { return $('.fc-container__header__title', section).text(); })
                .value();

            headerOne = headers.splice(0, 1)[0];

            lastIndex = headers.length - 1;

            titleOneHeight = $('.fc-container__header__title', headerOne).offset().height;

            $(headerOne).append(
                '<div class="fc-container__header__title--stickies" data-link-name="LHC titles">' +
                    _.map(headers, function (header, i) {
                        var title = $('.fc-container__header__title > *', header).text();

                        return '<div class="fc-container__header__title--sticky"><button data-link-name="' + i + ' | ' + title + '">' + title + '</button></div>';
                    }).join('') +
                '</div>'
            );

            stickyTitlesContainer = $('.fc-container__header__title--stickies', headerOne);

            stickyTitles = _.toArray($('.fc-container__header__title--sticky', stickyTitlesContainer));

            _.reduceRight(stickyTitles, function (m, title, i) {
                var height = title.offsetHeight + m;

                bean.add(title, 'click', function () { window.scrollTo(0, headerPositions[i] - 15); });
                offsets[i] = height;
                return height;
            }, 0);

            stickyTitles = _.map(stickyTitles, function (el) { return $(el); });

            setInterval(reflow, 1000);

            reflow();

            mediator.on('window:scroll', _.throttle(setPositions, 10));
            mediator.on('window:resize', _.throttle(forceReflow, 50));
            mediator.on('modules:nav:open', forceReflow);
            mediator.on('modules:nav:close', forceReflow);

            stickyTitlesContainer.css('visibility', 'visible');
        }
    }

    return {
        init: init
    };
});
